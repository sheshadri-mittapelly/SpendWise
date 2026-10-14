from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Expense(Base):
    __tablename__ = "expenses"
    id : Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id : Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10,2), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    description:Mapped[str] = mapped_column(Text, nullable=True)
    expense_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False,default=lambda: datetime.now(timezone.utc))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    user = relationship("User", back_populates="expenses")

