from sqlalchemy.orm import Session
from app.models.all_models import Account, Transaction, TransactionType
from app.schemas.all_schemas import TransactionCreate
from fastapi import HTTPException
from decimal import Decimal

def get_account_by_user_id(db: Session, user_id: int):
    return db.query(Account).filter(Account.user_id == user_id).first()

def get_account(db: Session, account_id: int):
    return db.query(Account).filter(Account.id == account_id).first()

def deposit(db: Session, account_id: int, amount: Decimal, category: str = "Outros"):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Deposit amount must be positive.")
    
    # Lock the account row for update to ensure consistency in concurrent requests
    # with_for_update() locks the selected row
    account = db.query(Account).filter(Account.id == account_id).with_for_update().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    account.balance += amount
    
    transaction = Transaction(
        account_id=account.id,
        type=TransactionType.DEPOSIT.value,
        amount=amount,
        category=category,
        balance_after=account.balance
    )
    db.add(transaction)
    
    # Commit transaction
    db.commit()
    db.refresh(transaction)
    return transaction

def withdraw(db: Session, account_id: int, amount: Decimal, category: str = "Outros"):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Withdrawal amount must be positive.")
    
    # Lock for update
    account = db.query(Account).filter(Account.id == account_id).with_for_update().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    if account.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient funds.")

    account.balance -= amount

    transaction = Transaction(
        account_id=account.id,
        type=TransactionType.WITHDRAW.value,
        amount=amount,
        category=category,
        balance_after=account.balance
    )
    db.add(transaction)
    
    db.commit()
    db.refresh(transaction)
    return transaction

def get_statement(db: Session, account_id: int):
    return db.query(Transaction).filter(Transaction.account_id == account_id).order_by(Transaction.timestamp.desc()).all()

def transfer(db: Session, from_account_id: int, to_account_number: str, amount: Decimal, category: str = "Transferência"):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Transfer amount must be positive.")
    
    # Order locks by ID to prevent deadlocks
    # 1. Get destination account first (don't lock yet to see if it exists)
    dest_account = db.query(Account).filter(Account.number == to_account_number).first()
    if not dest_account:
        raise HTTPException(status_code=404, detail="Destination account not found.")
    
    if from_account_id == dest_account.id:
        raise HTTPException(status_code=400, detail="Cannot transfer to the same account.")

    # Sort IDs for locking order
    ids = sorted([from_account_id, dest_account.id])
    
    # Lock both accounts
    accounts_map = {
        acc.id: acc for acc in db.query(Account).filter(Account.id.in_(ids)).with_for_update().all()
    }
    
    source = accounts_map[from_account_id]
    dest = accounts_map[dest_account.id]

    if source.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient funds for transfer.")

    # Perform transfer
    source.balance -= amount
    dest.balance += amount

    # Record transactions for both
    tx_out = Transaction(
        account_id=source.id,
        type="transfer_out",
        amount=amount,
        category=category,
        balance_after=source.balance
    )
    tx_in = Transaction(
        account_id=dest.id,
        type="transfer_in",
        amount=amount,
        category=category,
        balance_after=dest.balance
    )
    
    db.add(tx_out)
    db.add(tx_in)
    
    db.commit()
    db.refresh(tx_out)
    return tx_out

