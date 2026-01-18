from sqlalchemy.orm import Session
from app.models.all_models import Account, Loan, Transaction, TransactionType
from fastapi import HTTPException
from decimal import Decimal
from app.services import transaction_service

def request_loan(db: Session, account_id: int, amount: Decimal, installments: int):
    account = db.query(Account).filter(Account.id == account_id).with_for_update().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    # Business Rule: Loan cannot exceed the credit limit
    if amount > account.credit_limit:
        raise HTTPException(
            status_code=400, 
            detail=f"O valor solicitado excede seu limite de crédito disponível (R$ {account.credit_limit:.2f})."
        )

    # Interest Calculation: 
    # Let's use a logic where interest increases slightly with installments:
    # 2.5% + (0.1% * installments)
    interest_rate = Decimal("2.50") + (Decimal("0.1") * Decimal(str(installments)))
    
    # Simple Interest Calculation for total (Principal + Interest)
    # Total = Principal * (1 + (rate * installments / 100))
    total_to_pay = amount * (1 + (interest_rate * installments / 100))
    installment_amount = total_to_pay / installments

    # Create the loan record
    loan = Loan(
        account_id=account.id,
        amount=amount,
        installments=installments,
        interest_rate=interest_rate,
        installment_amount=installment_amount,
        total_to_pay=total_to_pay,
        status="active"
    )
    db.add(loan)

    # Add the money to the account balance immediately
    account.balance += amount

    # Record the transaction
    transaction = Transaction(
        account_id=account.id,
        type="deposit",
        category="Empréstimo",
        amount=amount,
        balance_after=account.balance
    )
    db.add(transaction)

    db.commit()
    db.refresh(loan)
    return loan

def get_loans(db: Session, account_id: int):
    return db.query(Loan).filter(Loan.account_id == account_id).order_by(Loan.timestamp.desc()).all()
