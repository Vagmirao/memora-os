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
    MemoryUpdate,
    MemoryVersionResponse,
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
            detail="Cannot revert an inactive memory.",
        )

    version_statement = (
        select(MemoryVersion)
        .where(
            MemoryVersion.memory_id == memory_id,
            MemoryVersion.version_number == version_number,
        )
    )

    version = db.scalar(version_statement)

    if version is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory version not found.",
        )

    memory.content = version.content
    memory.memory_type = version.memory_type
    memory.confidence = version.confidence
    memory.importance = version.importance

    db.flush()

    latest_version = db.scalar(
        select(MemoryVersion.version_number)
        .where(MemoryVersion.memory_id == memory.id)
        .order_by(MemoryVersion.version_number.desc())
        .limit(1)
    )

    next_version_number = (latest_version or 0) + 1

    new_version = MemoryVersion(
        memory_id=memory.id,
        version_number=next_version_number,
        content=memory.content,
        memory_type=memory.memory_type,
        confidence=memory.confidence,
        importance=memory.importance,
    )

    db.add(new_version)
    db.flush()

    event = MemoryEvent(
    memory_id=memory.id,
    version_id=new_version.id,
    event_type="REVERTED",
    description=f"Memory reverted to version {version_number}.",
    )

    db.add(event)

    db.commit()
    db.refresh(memory)

    return memory

@router.patch(
    "/{memory_id}",
    response_model=MemoryResponse,
)
def update_memory(
    memory_id: UUID,
    memory_data: MemoryUpdate,
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

    for field, value in update_data.items():
        setattr(memory, field, value)

    db.flush()

    latest_version = db.scalar(
        select(MemoryVersion.version_number)
        .where(MemoryVersion.memory_id == memory.id)
        .order_by(MemoryVersion.version_number.desc())
        .limit(1)
    )

    next_version_number = (
        (latest_version or 0) + 1
    )

    version = MemoryVersion(
        memory_id=memory.id,
        version_number=next_version_number,
        content=memory.content,
        memory_type=memory.memory_type,
        confidence=memory.confidence,
        importance=memory.importance,
    )

    db.add(version)
    db.flush()

    event = MemoryEvent(
    memory_id=memory.id,
    version_id=version.id,
    event_type="UPDATED",
    description="Memory updated.",
    )

    db.add(event)

    db.commit()
    db.refresh(memory)

    return memory

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

