from fastapi import APIRouter, Depends, HTTPException,status,Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.db.databases import get_db
from datetime import date
from app.models import User
from app.models import Expense
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(expense_data: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    expense = Expense(
        title = expense_data.title,
        amount=expense_data.amount,
        description=expense_data.description,
        category=expense_data.category,
        expense_date=expense_data.expense_date,
        user_id=current_user.id
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int,
                   expense_data: ExpenseCreate,
                   db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    expense.title = expense_data.title
    expense.amount = expense_data.amount
    expense.description = expense_data.description
    expense.category = expense_data.category
    expense.expense_date = expense_data.expense_date

    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db:Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    db.delete(expense)
    db.commit()
    db.refresh(expense)

@router.get("/", response_model=list[ExpenseResponse])
def get_expenses(category: str | None = None, start_date: date | None = None, end_date: date | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    if category:
        query = query.filter(Expense.category == category)

    if start_date:
        query = query.filter(Expense.expense_date >= start_date)

    if end_date:
        query = query.filter(Expense.expense_date <= end_date)

    return query.order_by(Expense.expense_date.desc()).all()

@router.get("/summary/monthly")
def monthly_summary(year: int, month:int,db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
   if month < 1 or month > 12:
       raise HTTPException(status_code=400, details="Month must be between 1 and 12")
   result = db.query(Expense.category,func.sum(Expense.amount).label("total_amount")).filter(Expense.user_id == current_user.id,extract("year",Expense.expense_date) == year,
                                                                                             extract("month",Expense.expense_date)==month).group_by(Expense.category).order_by(Expense.category).all()
   return {"year": year,"month": month,
           "Total_expenses": sum((row.total for row in result),start=0),
           "category_breakdown": [{"category": row.category,"total": row.total}
                                  for row in result]}

#pagination to expenses
@router.get("/", response_model=list[ExpenseResponse])
def get_expenses(category: str | None = None,
                 start_date: date | None = None,
                 end_date: date| None = None,
                 skip: int = Query(default=0, ge=0),
                 limit: int = Query(default=20,ge=1,le=100),
                 db:Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)

    if category:
        query = query.filter(Expense.category == category)
    if start_date:
        query = query.filter(Expense.expense_date >= start_date)

    if end_date:
        query = query.filter(Expense.expense_date < end_date)

    return(
        query.order_by(Expense.expense_date.desc())
        .offset(skip).limit(limit).all()
    )

#dashboard summary

@router.get("/dashboard")
def expense_dashboard(year: int,month: int,db: Session =Depends(get_db),current_user : User = Depends(get_current_user)):
    if month < 1 or month > 12:
        raise HTTPException(status_code=400,detail="month must be between 1 and 12")
    total_expenses = (db.query(func.coalesce(func.sum(Expense.amount),0)).filter(Expense.user_id == current_user.id).scalar())

    monthly_total = (db.query(func.coalesce(func.sum(Expense.amount),0)).filter(Expense.user_id == current_user.id,
                                                                                extract("year",Expense.expense_date)== year,
                                                                                extract("month",Expense.expense_date) == month).scalar())
    category_rows = (db.query(Expense.category,
                             func.sum(Expense.amount).label("total")).filter(
                                 Expense.user_id == current_user.id,
                                 extract("year", Expense.expense_date)== year,
                                 extract("month", Expense.expense_date) == month
                             ).group_by(Expense.category).order_by(Expense.category).all()
                             )
    return {
        "year": year,
        "month": month,
        "total_expenses": total_expenses,
        "monthly_total": monthly_total,
        "category_breakdown": [
            {"category": row.category,"total": row.total}
            for row in category_rows
        ]
    }