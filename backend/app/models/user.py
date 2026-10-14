from datetime import datetime, timezone
from sqlalchemy import Boolean,String,Integer
from sqlalchemy.orm import Mapped, mapped_column ,relationship # pyright: ignore[reportMissingImports]
from app.db.base import Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name : Mapped[str] = mapped_column(String(100),nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    google_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=True)
    profile_picture: Mapped[str | None] = mapped_column(String(500),nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(50), nullable=False, default="local")
    expenses = relationship("Expense", back_populates="user",cascade="all, delete-orphan")
    budgets = relationship("Budget",back_populates="user",cascade="all, delete-orphan")

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)