from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.db.database import SessionLocal
from backend.app.db.models import Memory, MemoryEvent
from backend.app.schemas.event import MemoryEventResponse


router = APIRouter(
    prefix="/api/memories",
    tags=["Memory Events"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get(
    "/{memory_id}/events",
    response_model=list[MemoryEventResponse],
)
def get_memory_events(
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
        select(MemoryEvent)
        .where(MemoryEvent.memory_id == memory_id)
        .order_by(MemoryEvent.created_at.asc())
    )

    events = db.scalars(statement).all()

    return events