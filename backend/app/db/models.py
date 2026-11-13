from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    memories: Mapped[list["Memory"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Memory(Base):
    __tablename__ = "memories"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    content: Mapped[str] = mapped_column(
        String(5000),
        nullable=False,
    )

    memory_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    confidence: Mapped[float] = mapped_column(
        default=1.0,
        nullable=False,
    )

    importance: Mapped[float] = mapped_column(
        default=0.5,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        back_populates="memories",
    )

    versions: Mapped[list["MemoryVersion"]] = relationship(
        back_populates="memory",
        cascade="all, delete-orphan",
        order_by="MemoryVersion.version_number",
    )

    events: Mapped[list["MemoryEvent"]] = relationship(
        back_populates="memory",
        cascade="all, delete-orphan",
        order_by="MemoryEvent.created_at",
    )


class MemoryVersion(Base):
    __tablename__ = "memory_versions"
    __table_args__ = (
    UniqueConstraint(
        "memory_id",
        "version_number",
        name="uq_memory_version_number",
    ),
)
    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    memory_id: Mapped[UUID] = mapped_column(
        ForeignKey("memories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    version_number: Mapped[int] = mapped_column(
        nullable=False,
    )

    content: Mapped[str] = mapped_column(
        String(5000),
        nullable=False,
    )

    memory_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    confidence: Mapped[float] = mapped_column(
        default=1.0,
        nullable=False,
    )

    importance: Mapped[float] = mapped_column(
        default=0.5,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    memory: Mapped["Memory"] = relationship(
        back_populates="versions",
    )

class MemoryEvent(Base):
    __tablename__ = "memory_events"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    memory_id: Mapped[UUID] = mapped_column(
        ForeignKey("memories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    version_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("memory_versions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    memory: Mapped["Memory"] = relationship(
        back_populates="events",
    )

    version: Mapped["MemoryVersion | None"] = relationship()