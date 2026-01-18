from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Any

from app.core import database, security, config
from app.services import auth_service
from app.schemas.all_schemas import UserCreate, UserResponse, Token

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(database.get_db)) -> Any:
    user = auth_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user_cpf = auth_service.get_user_by_cpf(db, cpf=user_in.cpf)
    if user_cpf:
        raise HTTPException(
            status_code=400,
            detail="The user with this CPF already exists in the system.",
        )
    
    user = auth_service.create_user(db, user_in)
    return user

@router.post("/login", response_model=Token)
def login_access_token(db: Session = Depends(database.get_db), form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
