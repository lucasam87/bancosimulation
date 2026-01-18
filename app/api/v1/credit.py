from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from app.core import database
from app.api import deps
from app.services import transaction_service, ai_service
from app.schemas.all_schemas import CreditAnalysisCreate, CreditAnalysisResponse
from app.models.all_models import User, CreditAnalysis

router = APIRouter()

@router.post("/apply", response_model=CreditAnalysisResponse)
def apply_for_credit(
    application_in: CreditAnalysisCreate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Analyze with AI
    analysis_result = ai_service.analyze_credit_with_ai(
        age=application_in.age,
        mother_name=application_in.mother_name,
        monthly_income=application_in.monthly_income,
        assets_value=application_in.assets_value
    )
    
    # Save analysis record
    credit_analysis = CreditAnalysis(
        account_id=account.id,
        age=application_in.age,
        mother_name=application_in.mother_name,
        monthly_income=application_in.monthly_income,
        assets_value=application_in.assets_value,
        status=analysis_result["status"],
        ai_feedback=analysis_result["ai_feedback"],
        approved_limit=analysis_result["approved_limit"],
        score=analysis_result.get("score", 0)
    )
    
    # If approved, update account limit
    if analysis_result["status"] == "approved":
        account.credit_limit = analysis_result["approved_limit"]
    
    db.add(credit_analysis)
    db.commit()
    db.refresh(credit_analysis)
    
    return credit_analysis

@router.get("/status", response_model=CreditAnalysisResponse)
def get_credit_status(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    last_analysis = db.query(CreditAnalysis).filter(CreditAnalysis.account_id == account.id).order_by(CreditAnalysis.timestamp.desc()).first()
    if not last_analysis:
        raise HTTPException(status_code=404, detail="No credit application found")
        
    return last_analysis
