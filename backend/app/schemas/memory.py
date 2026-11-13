from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MemoryCreate(BaseModel):
    user_id: UUID
    content: str = Field(min_length=1, max_length=5000)
    memory_type: str = Field(min_length=1, max_length=50)
    source: str = Field(min_length=1, max_length=50)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    importance: float = Field(default=0.5, ge=0.0, le=1.0)

class MemoryUpdate(BaseModel):
    content: str | None = Field(
        default=None,
        min_length=1,
        max_length=5000,
    )

    memory_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    confidence: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
    )

    importance: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
    )
    
class MemoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    content: str
    memory_type: str
    source: str
    confidence: float
    importance: float
    is_active: bool
    created_at: datetime
    updated_at: datetime

    
class MemoryListResponse(BaseModel):
    memories: list[MemoryResponse]
    total: int

class MemoryVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    memory_id: UUID
    version_number: int
    content: str
    memory_type: str
    confidence: float
    importance: float
    created_at: datetime
