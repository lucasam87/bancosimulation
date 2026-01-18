from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any
import random

from app.core import database
from app.api import deps
from app.services import transaction_service
from app.schemas.all_schemas import CreditCardResponse
from app.models.all_models import User, CreditCard, CreditAnalysis, Transaction

router = APIRouter()

@router.post("/request", response_model=CreditCardResponse)
def request_credit_card(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Check if already has a card
    if account.credit_card:
        return account.credit_card

    # Criteria 1: Score from last Gemini Analysis
    last_analysis = db.query(CreditAnalysis).filter(CreditAnalysis.account_id == account.id).order_by(CreditAnalysis.timestamp.desc()).first()
    if not last_analysis or last_analysis.score < 600:
        raise HTTPException(
            status_code=400, 
            detail="Seu Score atual não é suficiente para a emissão do cartão. Requisito mínimo: 600 pontos."
        )

    # Criteria 2: Movement (Total volume of transactions)
    # Let's say we want at least R$ 1000 in movement
    total_movement = db.query(func.sum(Transaction.amount)).filter(Transaction.account_id == account.id).scalar() or 0
    if total_movement < 1000:
        raise HTTPException(
            status_code=400,
            detail=f"Movimentação insuficiente. Você movimentou R$ {total_movement:.2f}, mas precisamos de pelo menos R$ 1.000,00 para avaliar o cartão."
        )

    # Dynamic Limit Calculation
    # Limit is the highest between:
    # 1. Approved Limit from Credit Analysis
    # 2. 20% of Total Movement
    from decimal import Decimal
    base_limit = account.credit_limit
    movement_based_limit = total_movement * Decimal('0.20')
    final_limit = max(base_limit, movement_based_limit)

    # Issue Card
    # Generate mock card info
    last_digits = str(random.randint(1000, 9999))
    card = CreditCard(
        account_id=account.id,
        card_number=f"**** **** **** {last_digits}",
        cvv_hash="888", # simulated
        expiry_date="12/29",
        limit=final_limit,
        status="active"
    )
    
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

@router.get("/me", response_model=CreditCardResponse)
def get_my_card(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account or not account.credit_card:
        raise HTTPException(status_code=404, detail="Cartão não encontrado ou não solicitado.")
    
    return account.credit_card

@router.post("/block", response_model=CreditCardResponse)
def toggle_block_card(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account or not account.credit_card:
        raise HTTPException(status_code=404, detail="Cartão não encontrado.")
    
    # Toggle status
    if account.credit_card.status == "blocked":
        account.credit_card.status = "active"
    else:
        account.credit_card.status = "blocked"
        
    db.commit()
    db.refresh(account.credit_card)
    return account.credit_card

@router.get("/cvv", response_model=dict)
def get_cvv(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account or not account.credit_card:
        raise HTTPException(status_code=404, detail="Cartão não encontrado.")
        
    return {"cvv": account.credit_card.cvv_hash}
