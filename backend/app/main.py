from fastapi import FastAPI,Depends
from app.core.config import settings
from sqlalchemy.orm import Session
from app.db.databases import get_db
from sqlalchemy import text
from app.api.routes.auth import router as auth_router
from app.api.routes.expenses import router as expenses_router
from app.api.routes.budgets import router as budgets_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, debug=settings.DEBUG)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))  # Simple query to check database connectivity
    return {"status": "healthy"}



@app.get("/")
def root():
    return {"message": "Welcome to SpendWise API!",
            "version": settings.APP_VERSION,}


app.include_router(auth_router,prefix="/api/v1",)

app.include_router(expenses_router, prefix="/api/v1")

app.include_router(budgets_router, prefix="/api/v1")