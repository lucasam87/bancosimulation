from sqlalchemy.orm import Session
from app.models.all_models import User, Account
from app.schemas.all_schemas import UserCreate
from app.core.security import get_password_hash, verify_password
import random

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_cpf(db: Session, cpf: str):
    return db.query(User).filter(User.cpf == cpf).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email, 
        name=user.name, 
        cpf=user.cpf, 
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Automatic Account Creation
    create_user_account(db, db_user)
    
    return db_user

def create_user_account(db: Session, user: User):
    # Generate unique account number (simple logic for now)
    while True:
        number = str(random.randint(10000, 99999))
        if not db.query(Account).filter(Account.number == number).first():
            break
    
    db_account = Account(user_id=user.id, number=number, balance=0.00)
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
