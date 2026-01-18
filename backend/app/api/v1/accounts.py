from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from app.core import database
from app.api import deps
from app.services import transaction_service
from app.schemas.all_schemas import AccountResponse
from app.models.all_models import User, CreditAnalysis

router = APIRouter()

@router.get("/me", response_model=AccountResponse)
def get_my_account(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Get current user's account information.
    """
    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    # Fetch latest score
    last_analysis = db.query(CreditAnalysis).filter(CreditAnalysis.account_id == account.id).order_by(CreditAnalysis.timestamp.desc()).first()
    if last_analysis:
        account.score = last_analysis.score
    else:
        account.score = 0
        
    return account
