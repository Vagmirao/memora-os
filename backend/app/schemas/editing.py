
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


class MemoryEditRequest(BaseModel):
    """
    Fields that a user is allowed to modify
    when editing an existing memory.
    """

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

    @model_validator(mode="after")
    def validate_changes(self):
        if not self.model_fields_set:
            raise ValueError(
                "At least one field must be provided."
            )

        for field_name in self.model_fields_set:
            if getattr(self, field_name) is None:
                raise ValueError(
                    f"{field_name} cannot be null."
                )

        return self


class MemoryEditPreview(BaseModel):
    """
    Represents the proposed changes before saving.
    """

    memory_id: str

    current: dict

    proposed: dict

    changed_fields: list[str]

    has_changes: bool


class MemoryVersionComparison(BaseModel):
    """
    Represents a comparison between two memory versions.
    """

    memory_id: str

    from_version: int

    to_version: int

    differences: dict[str, dict]

    model_config = ConfigDict(
        extra="forbid"
    )
