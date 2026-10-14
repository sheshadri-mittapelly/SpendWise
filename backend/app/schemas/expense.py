from datetime import datetime
from pydantic import BaseModel,ConfigDict, Field
from decimal import Decimal

class ExpenseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    amount: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    category: str = Field(min_length=1, max_length=50)
    description: str | None = None
    expense_date: datetime 

class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    title: str
    amount: Decimal
    category: str
    description: str | None
    expense_date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)