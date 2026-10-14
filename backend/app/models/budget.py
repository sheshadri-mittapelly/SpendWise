from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer,String, Numeric,UniqueConstraint,ForeignKey
from sqlalchemy.orm import relationship, mapped_column, Mapped
from app.db.base import Base

class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (UniqueConstraint("user_id","category","year","month",
                                       name="uq_user_category_month_budget",),)

    id : Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id : Mapped[int] = mapped_column(ForeignKey("users.id",ondelete="CASCADE"))
    category : Mapped[str] = mapped_column(String(50), nullable=False)
    amount : Mapped[float] = mapped_column(Numeric(10,2), nullable=False)
    year : Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="budgets")