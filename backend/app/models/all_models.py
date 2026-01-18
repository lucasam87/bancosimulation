from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class TransactionType(str, enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAW = "withdraw"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    cpf = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    account = relationship("Account", back_populates="user", uselist=False)

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    number = Column(String, unique=True, index=True, nullable=False)
    balance = Column(Numeric(10, 2), default=0.00, nullable=False)
    credit_limit = Column(Numeric(10, 2), default=0.00, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="account")
    transactions = relationship("Transaction", back_populates="account")
    credit_analyses = relationship("CreditAnalysis", back_populates="account")
    loans = relationship("Loan", back_populates="account")
    credit_card = relationship("CreditCard", back_populates="account", uselist=False)

class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    installments = Column(Integer, default=1)
    interest_rate = Column(Numeric(5, 2), default=2.50)
    installment_amount = Column(Numeric(10, 2), nullable=False)
    total_to_pay = Column(Numeric(10, 2), nullable=False)
    status = Column(String, default="active") # 'active', 'paid'
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    account = relationship("Account", back_populates="loans")

class CreditCard(Base):
    __tablename__ = "credit_cards"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), unique=True, nullable=False)
    card_number = Column(String, nullable=False)
    cvv_hash = Column(String, nullable=False)
    expiry_date = Column(String, nullable=False)
    limit = Column(Numeric(10, 2), nullable=False)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    account = relationship("Account", back_populates="credit_card")

class CreditAnalysis(Base):
    __tablename__ = "credit_analyses"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    age = Column(Integer, nullable=False)
    mother_name = Column(String, nullable=False)
    monthly_income = Column(Numeric(10, 2), nullable=False)
    assets_value = Column(Numeric(10, 2), nullable=False)
    score = Column(Integer, default=0)
    status = Column(String, nullable=False) # 'approved', 'rejected', 'pending'
    ai_feedback = Column(String)
    approved_limit = Column(Numeric(10, 2), default=0.00)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    account = relationship("Account", back_populates="credit_analyses")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    type = Column(String, nullable=False) # stored as string or use Enum type
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String, nullable=False, server_default='Outros')
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Store balance after transaction for snapshotting history
    balance_after = Column(Numeric(10, 2), nullable=False)

    account = relationship("Account", back_populates="transactions")
