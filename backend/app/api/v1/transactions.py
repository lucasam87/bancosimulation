from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List

from app.core import database
from app.api import deps
from app.services import transaction_service
from app.schemas.all_schemas import TransactionCreate, TransactionResponse, TransferCreate
from app.models.all_models import User, TransactionType

router = APIRouter()

@router.post("/deposit", response_model=TransactionResponse)
def deposit(
    transaction_in: TransactionCreate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Deposit money into the current user's account.
    """
    if transaction_in.type != TransactionType.DEPOSIT.value:
         raise HTTPException(status_code=400, detail="Invalid transaction type for this endpoint")

    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    return transaction_service.deposit(
        db, 
        account_id=account.id, 
        amount=transaction_in.amount,
        category=transaction_in.category
    )

@router.post("/withdraw", response_model=TransactionResponse)
def withdraw(
    transaction_in: TransactionCreate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Withdraw money from the current user's account.
    """
    if transaction_in.type != TransactionType.WITHDRAW.value:
         raise HTTPException(status_code=400, detail="Invalid transaction type for this endpoint")

    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    return transaction_service.withdraw(
        db, 
        account_id=account.id, 
        amount=transaction_in.amount,
        category=transaction_in.category
    )

@router.post("/transfer", response_model=TransactionResponse)
def transfer(
    transfer_in: TransferCreate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Transfer money to another account.
    """
    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    return transaction_service.transfer(
        db, 
        from_account_id=account.id, 
        to_account_number=transfer_in.destination_account, 
        amount=transfer_in.amount,
        category=transfer_in.category
    )

@router.get("/statement", response_model=List[TransactionResponse])
def get_statement(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Get transaction history (statement).
    """
    account = transaction_service.get_account_by_user_id(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    return transaction_service.get_statement(db, account_id=account.id)
