from decimal import Decimal
from pydantic import BaseModel, Field,ConfigDict

class BudgetCreate(BaseModel):
    category: str = Field(min_length=1, max_length=50)
    year: int = Field(ge=2000, le=2100)
    month: int = Field(ge=1, le=12)
    amount: Decimal = Field(gt=0, max_digits=10,decimal_places=2)

class BudgetResponse(BaseModel):
    id : int
    category: str
    year: int
    month: int
    amount: Decimal

    model_config = ConfigDict(from_attributes=True)

