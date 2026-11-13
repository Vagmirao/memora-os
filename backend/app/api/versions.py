from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.db.database import SessionLocal
from backend.app.db.models import Memory, MemoryVersion
from backend.app.schemas.version import MemoryVersionResponse


router = APIRouter(
    prefix="/api/memories",
    tags=["Memory Versions"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


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
            status_code=404,
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
    "/{memory_id}/versions/{version_number}",
    response_model=MemoryVersionResponse,
)
def get_memory_version(
    memory_id: UUID,
    version_number: int,
    db: Session = Depends(get_db),
):
    memory = db.get(Memory, memory_id)

    if memory is None:
        raise HTTPException(
            status_code=404,
            detail="Memory not found.",
        )

    statement = (
        select(MemoryVersion)
        .where(
            MemoryVersion.memory_id == memory_id,
            MemoryVersion.version_number == version_number,
        )
    )

    version = db.scalar(statement)

    if version is None:
        raise HTTPException(
            status_code=404,
            detail="Memory version not found.",
        )

    return version