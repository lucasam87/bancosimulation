from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List

from app.core import database
from app.api import deps
from app.services import transaction_service, loan_service
from app.schemas.all_schemas import LoanCreate, LoanResponse
from app.models.all_models import User

router = APIRouter()

@router.post("/request", response_model=LoanResponse)
def request_loan(
    loan_in: LoanCreate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return loan_service.request_loan(db, account_id=account.id, amount=loan_in.amount, installments=loan_in.installments)

@router.get("/list", response_model=List[LoanResponse])
def list_loans(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    return loan_service.get_loans(db, account_id=account.id)
