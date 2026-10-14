from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from sqlalchemy import func,extract
from app.db.databases import get_db
from app.api.deps import get_current_user
from app.models import User,Budget
from app.models.budget import Budget
from app.models.expense import Expense
from app.schemas.budget import BudgetCreate,BudgetResponse 


router = APIRouter(prefix="/budgets",tags=["Budgets"])
@router.post("/",response_model=BudgetResponse,status_code=status.HTTP_201_CREATED)
def create_budget(budget_data: BudgetCreate, db:Session = Depends(get_db), current_user: User = Depends(get_current_user),):
    existing_budget = db.query(Budget).filter(Budget.user_id == current_user.id, Budget.category == budget_data.category, Budget.year == budget_data.year, Budget.month == budget_data.month).first()
    if existing_budget:
        raise HTTPException(status_code=409, detail="Budget already exists for this category and month")
    new_budget = Budget(user_id=current_user.id,
                        category=budget_data.category,
                        year=budget_data.year,
                        month=budget_data.month,
                        amount=budget_data.amount)
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget

@router.get("/",response_model=list[BudgetResponse])
def get_budgets(year: int,month:int,db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Invalid month")
    return (db.query(Budget).filter(Budget.user_id == current_user.id,Budget.year == year,Budget.month == month,).order_by(Budget.category).all())

@router.put("/{budget_id}",response_model=BudgetResponse)
def update_budget(budget_id: int, budget_data: BudgetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if budget is None:
        raise HTTPException(status_code=404,detail="Budget not found")
    budget.category = budget_data.category
    budget.year = budget_data.year
    budget.month = budget_data.month
    budget.amount = budget_data.amount

    db.commit()
    db.refresh(budget)
    return budget  

@router.delete("/{budget_id}",status_code= status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: int ,db:Session =Depends(get_db),current_user:User=Depends(get_current_user)):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if budget is None:
        raise HTTPException(status_code=404,detail="Budget not found")
    db.delete(budget)
    db.commit()

    return None

@router.get("/summary")
def budget_summary(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    ):
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Invalid month")
    budgets = (db.query(Budget).filter(Budget.user_id == current_user.id,
                                      Budget.year == year,
                                      Budget.month == month).all())
    spending = (db.query(Expense.category,func.sum(Expense.amount).label("spent"))
                .filter(Expense.user_id == current_user.id,
                        extract("year",Expense.expense_date)== year,
                        extract("month",Expense.expense_date) == month)
                        .group_by(Expense.category).all())

    spending_by_category = {row.category : row.spent for row in spending}

    summary = []

    for budget in budgets:
        spent = spending_by_category.get(budget.category,0)
        remaining = budget.amount - spent

        summary.append({
            "category": budget.category,
            "budget" : budget.amount,
            "spent": spent,
            "remaining": remaining,
            "status" : "over budget" if remaining < 0 else "within budget"
        })

        return {
            "year": year,
            "month": month,
            "summary" : summary,
        }