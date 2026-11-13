from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MemoryVersionResponse(BaseModel):
    id: UUID
    memory_id: UUID
    version_number: int
    content: str
    memory_type: str
    confidence: float
    importance: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)