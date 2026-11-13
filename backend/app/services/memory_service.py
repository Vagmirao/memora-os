
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.db.models import (
    Memory,
    MemoryEvent,
    MemoryVersion,
)

class StaleMemoryVersionError(Exception):
    """Raised when an edit is based on an outdated version."""

class MemoryVersionNotFoundError(Exception):
    """Raised when the requested historical version doesn't exist."""

def update_memory_safely(
    db: Session,
    memory: Memory,
    update_data: dict,
    expected_version: int,
) -> Memory:
    """
    Safely update a memory using optimistic concurrency control.

    Locks the memory row while checking and applying the edit.
    Rejects edits based on outdated versions.
    """

    try:
        # Lock the memory row to prevent simultaneous edits
        # from passing the version check together.
        locked_memory = db.scalar(
            select(Memory)
            .where(Memory.id == memory.id)
            .with_for_update()
            .execution_options(populate_existing=True)
        )

        if locked_memory is None:
            raise ValueError("Memory not found.")

        if not locked_memory.is_active:
            raise ValueError(
                "Cannot update an inactive memory."
            )

        # Find the latest saved version.
        latest_version = db.scalar(
            select(MemoryVersion.version_number)
            .where(
                MemoryVersion.memory_id == locked_memory.id
            )
            .order_by(
                MemoryVersion.version_number.desc()
            )
            .limit(1)
        )

        latest_version = latest_version or 0

        # Reject edits based on an outdated version.
        if expected_version != latest_version:
            raise StaleMemoryVersionError(
                f"Memory has changed. Expected version "
                f"{expected_version}, but the latest version "
                f"is {latest_version}. Reload before editing."
            )

        # Find fields that actually changed.
        changed_fields = {}

        editable_fields = {
            "content",
            "memory_type",
            "confidence",
            "importance",
        }

        for field, new_value in update_data.items():
            if field not in editable_fields:
                raise ValueError(
                    f"Field '{field}' cannot be edited."
                )

            current_value = getattr(
                locked_memory,
                field,
            )

            if current_value != new_value:
                changed_fields[field] = new_value

        # No changes: don't create a version or event.
        if not changed_fields:
            db.commit()
            db.refresh(locked_memory)
            return locked_memory

        # Apply changes.
        for field, value in changed_fields.items():
            setattr(locked_memory, field, value)

        db.flush()

        # Create the next version.
        version = MemoryVersion(
            memory_id=locked_memory.id,
            version_number=latest_version + 1,
            content=locked_memory.content,
            memory_type=locked_memory.memory_type,
            confidence=locked_memory.confidence,
            importance=locked_memory.importance,
        )

        db.add(version)
        db.flush()

        # Record the event.
        event = MemoryEvent(
            memory_id=locked_memory.id,
            version_id=version.id,
            event_type="UPDATED",
            description=(
                "Memory updated. Changed fields: "
                + ", ".join(changed_fields.keys())
            ),
        )

        db.add(event)

        db.commit()
        db.refresh(locked_memory)

        return locked_memory

    except Exception:
        db.rollback()
        raise


def preview_memory_edit(
    memory: Memory,
    update_data: dict,
) -> dict:
    """
    Preview proposed memory changes without modifying
    the database or creating a version or event.
    """

    editable_fields = [
        "content",
        "memory_type",
        "confidence",
        "importance",
    ]

    current = {
        field: getattr(memory, field)
        for field in editable_fields
    }

    proposed = current.copy()
    proposed.update(update_data)

    changed_fields = [
        field
        for field in update_data
        if current[field] != update_data[field]
    ]

    return {
        "memory_id": str(memory.id),
        "current": current,
        "proposed": proposed,
        "changed_fields": changed_fields,
        "has_changes": bool(changed_fields),
    }


def compare_memory_versions(
    memory_id,
    from_version: MemoryVersion,
    to_version: MemoryVersion,
) -> dict:
    """
    Compare two saved memory versions.

    Returns only fields whose values differ.
    Does not modify the database.
    """

    fields_to_compare = [
        "content",
        "memory_type",
        "confidence",
        "importance",
    ]

    differences = {}

    for field in fields_to_compare:
        old_value = getattr(from_version, field)
        new_value = getattr(to_version, field)

        if old_value != new_value:
            differences[field] = {
                "from": old_value,
                "to": new_value,
            }

    return {
        "memory_id": str(memory_id),
        "from_version": from_version.version_number,
        "to_version": to_version.version_number,
        "differences": differences,
    }

def revert_memory_safely(
    db: Session,
    memory_id,
    version_number: int,
    expected_version: int,
) -> Memory:
    """
    Safely restore a historical memory version.

    The historical version is never modified.
    A successful revert creates a new version and event.
    """

    try:
        # Lock the memory row before checking its latest version.
        memory = db.scalar(
            select(Memory)
            .where(Memory.id == memory_id)
            .with_for_update()
            .execution_options(populate_existing=True)
        )

        if memory is None:
            raise ValueError("Memory not found.")

        if not memory.is_active:
            raise ValueError(
                "Cannot revert an inactive memory."
            )

        # Find the latest version.
        latest_version = db.scalar(
            select(MemoryVersion.version_number)
            .where(MemoryVersion.memory_id == memory_id)
            .order_by(
                MemoryVersion.version_number.desc()
            )
            .limit(1)
        )

        latest_version = latest_version or 0

        # Check for outdated revert requests.
        if expected_version != latest_version:
            raise StaleMemoryVersionError(
                f"Memory has changed. Expected version "
                f"{expected_version}, but the latest version "
                f"is {latest_version}. Reload before reverting."
            )

        # Find the historical version to restore.
        target_version = db.scalar(
            select(MemoryVersion)
            .where(
                MemoryVersion.memory_id == memory_id,
                MemoryVersion.version_number == version_number,
            )
        )

        if target_version is None:
            raise MemoryVersionNotFoundError(
                "Memory version not found."
            )

        # Check whether the requested version is already
        # identical to the current memory.
        fields_to_restore = [
            "content",
            "memory_type",
            "confidence",
            "importance",
        ]

        has_changes = any(
            getattr(memory, field)
            != getattr(target_version, field)
            for field in fields_to_restore
        )

        if not has_changes:
            db.commit()
            db.refresh(memory)
            return memory

        # Restore the historical values.
        for field in fields_to_restore:
            setattr(
                memory,
                field,
                getattr(target_version, field),
            )

        db.flush()

        # Create a new snapshot, never overwrite history.
        new_version = MemoryVersion(
            memory_id=memory.id,
            version_number=latest_version + 1,
            content=memory.content,
            memory_type=memory.memory_type,
            confidence=memory.confidence,
            importance=memory.importance,
        )

        db.add(new_version)
        db.flush()

        # Record the revert operation.
        event = MemoryEvent(
            memory_id=memory.id,
            version_id=new_version.id,
            event_type="REVERTED",
            description=(
                f"Memory reverted to version {version_number}."
            ),
        )

        db.add(event)

        db.commit()
        db.refresh(memory)

        return memory

    except Exception:
        db.rollback()
        raise
