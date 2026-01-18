from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# Shared properties
class UserBase(BaseModel):
    name: str
    email: EmailStr
    cpf: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Account
class AccountBase(BaseModel):
    pass

class AccountCreate(AccountBase):
    pass # Created automatically for user

class AccountResponse(AccountBase):
    id: int
    number: str
    balance: Decimal
    credit_limit: Decimal
    created_at: datetime
    user_id: int
    score: Optional[int] = 0

    class Config:
        from_attributes = True

# Transaction
class TransactionBase(BaseModel):
    amount: Decimal = Field(..., gt=0)

class TransactionCreate(TransactionBase):
    type: str # 'deposit', 'withdraw', 'transfer_out', 'transfer_in'
    category: Optional[str] = "Outros"

class TransactionResponse(TransactionBase):
    id: int
    type: str
    category: str
    timestamp: datetime
    balance_after: Decimal
    account_id: int

    class Config:
        from_attributes = True

class TransferCreate(BaseModel):
    destination_account: str
    amount: Decimal = Field(..., gt=0)
    category: Optional[str] = "Transferência"

class CreditAnalysisCreate(BaseModel):
    age: int
    mother_name: str
    monthly_income: Decimal = Field(..., gt=0)
    assets_value: Decimal = Field(..., ge=0)

class CreditAnalysisResponse(BaseModel):
    id: int
    status: str
    ai_feedback: str
    score: int
    approved_limit: Decimal
    timestamp: datetime

    class Config:
        from_attributes = True

class LoanCreate(BaseModel):
    amount: Decimal = Field(..., gt=0)
    installments: int = Field(..., gt=0, le=24)

class LoanResponse(BaseModel):
    id: int
    amount: Decimal
    installments: int
    interest_rate: Decimal
    installment_amount: Decimal
    total_to_pay: Decimal
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True

class CreditCardResponse(BaseModel):
    id: int
    card_number: str
    expiry_date: str
    limit: Decimal
    status: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
