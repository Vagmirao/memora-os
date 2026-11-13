from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.db.models import (
    Memory,
    MemoryEvent,
    MemoryVersion,
    User,
)
from backend.app.schemas.memory import (
    MemoryCreate,
    MemoryListResponse,
    MemoryResponse,
    MemoryVersionResponse,
)

from backend.app.schemas.editing import (
    MemoryEditRequest,
    MemoryEditPreview,
    MemoryVersionComparison,
)

from backend.app.services.memory_service import (
    update_memory_safely,
    preview_memory_edit,
    compare_memory_versions,
    revert_memory_safely,
    StaleMemoryVersionError,
    MemoryVersionNotFoundError,
)

router = APIRouter(
    prefix="/api/memories",
    tags=["Memories"],
)


@router.post(
    "",
    response_model=MemoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_memory(
    memory_data: MemoryCreate,
    db: Session = Depends(get_db),
):
    user = db.get(User, memory_data.user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    memory = Memory(
        user_id=memory_data.user_id,
        content=memory_data.content,
        memory_type=memory_data.memory_type,
        source=memory_data.source,
        confidence=memory_data.confidence,
        importance=memory_data.importance,
        is_active=True,
    )

    db.add(memory)
    db.flush()

    version = MemoryVersion(
        memory_id=memory.id,
    version_number=1,
    content=memory.content,
    memory_type=memory.memory_type,
    confidence=memory.confidence,
    importance=memory.importance,
    )

    db.add(version)
    db.flush()

    event=MemoryEvent(
        memory_id=memory.id,
    version_id=version.id,
    event_type="CREATED",
    description="Memory created.",
    )

    db.add(event)

    db.commit()
    db.refresh(memory)

    return memory


@router.get(
    "",
    response_model=MemoryListResponse,
)
def get_memories(
    user_id: UUID,
    db: Session = Depends(get_db),
):
    statement = (
        select(Memory)
        .where(
            Memory.user_id == user_id,
            Memory.is_active.is_(True),
        )
        .order_by(Memory.created_at.desc())
    )

    memories = db.scalars(statement).all()

    return {
        "memories": memories,
        "total": len(memories),
    }


@router.post(
    "/{memory_id}/revert/{version_number}",
    response_model=MemoryResponse,
)
def revert_memory(
    memory_id: UUID,
    version_number: int,
    expected_version: int,
    db: Session = Depends(get_db),
):
    if version_number < 1 or expected_version < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Version numbers must be positive.",
        )

    memory = db.get(Memory, memory_id)

    if memory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found.",
        )

    if not memory.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot revert an inactive memory.",
        )

    try:
        reverted_memory = revert_memory_safely(
            db=db,
            memory_id=memory_id,
            version_number=version_number,
            expected_version=expected_version,
        )

    except StaleMemoryVersionError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    except MemoryVersionNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return reverted_memory


@router.patch(
    "/{memory_id}",
    response_model=MemoryResponse,
)
def update_memory(
    memory_id: UUID,
    memory_data: MemoryEditRequest,
    expected_version: int,
    db: Session = Depends(get_db),
):
    memory = db.get(Memory, memory_id)

    if memory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found.",
        )

    if not memory.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update an inactive memory.",
        )

    update_data = memory_data.model_dump(
        exclude_unset=True,
    )

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update.",
        )

    try:
        updated_memory = update_memory_safely(
            db=db,
            memory=memory,
            update_data=update_data,
            expected_version=expected_version,
        )

    except StaleMemoryVersionError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return updated_memory


@router.post(
    "/{memory_id}/preview",
    response_model=MemoryEditPreview,
)
def preview_memory_update(
    memory_id: UUID,
    memory_data: MemoryEditRequest,
    db: Session = Depends(get_db),
):
    memory = db.get(Memory, memory_id)

    if memory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found.",
        )

    if not memory.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot preview edits for an inactive memory.",
        )

    update_data = memory_data.model_dump(
        exclude_unset=True,
    )

    preview = preview_memory_edit(
        memory=memory,
        update_data=update_data,
    )

    return preview


@router.get(
    "/{memory_id}/compare",
    response_model=MemoryVersionComparison,
)
def compare_versions(
    memory_id: UUID,
    from_version: int,
    to_version: int,
    db: Session = Depends(get_db),
):
    if from_version < 1 or to_version < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Version numbers must be positive.",
        )

    if from_version == to_version:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select two different versions.",
        )

    memory = db.get(Memory, memory_id)

    if memory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found.",
        )

    from_statement = (
        select(MemoryVersion)
        .where(
            MemoryVersion.memory_id == memory_id,
            MemoryVersion.version_number == from_version,
        )
    )

    to_statement = (
        select(MemoryVersion)
        .where(
            MemoryVersion.memory_id == memory_id,
            MemoryVersion.version_number == to_version,
        )
    )

    old_version = db.scalar(from_statement)
    new_version = db.scalar(to_statement)

    if old_version is None or new_version is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both memory versions were not found.",
        )

    return compare_memory_versions(
        memory_id=memory_id,
        from_version=old_version,
        to_version=new_version,
    )


@router.get(
    "/{memory_id}/versions",
    response_model=list[MemoryVersionResponse],
)

def get_memory_versions(
    memory_id: UUID,
    db: Session = Depends(get_db),
):
    memory = db.get(Memory, memory_id)

    if memory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found.",
        )

    statement = (
        select(MemoryVersion)
        .where(MemoryVersion.memory_id == memory_id)
        .order_by(MemoryVersion.version_number.asc())
    )

    versions = db.scalars(statement).all()

    return versions

@router.get(
    "/{memory_id}",
    response_model=MemoryResponse,
)
def get_memory(
    memory_id: UUID,
    db: Session = Depends(get_db),
):
    memory = db.get(Memory, memory_id)

    if memory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found.",
        )

    return memory

