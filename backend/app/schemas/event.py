from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MemoryEventResponse(BaseModel):
    id: UUID
    memory_id: UUID
    version_id: UUID | None
    event_type: str
    description: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)