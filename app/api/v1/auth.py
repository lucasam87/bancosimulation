from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Any
from app.core import security, config
from app.api import deps
from app.schemas.all_schemas import UserCreate, UserResponse, Token
from firebase_admin import firestore

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db=Depends(deps.get_db)) -> Any:
    # Check if user exists (Query Firestore)
    users_ref = db.collection("users")
    
    # Check Email
    email_query = users_ref.where("email", "==", user_in.email).stream()
    if any(email_query):
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
        
    # Check CPF
    cpf_query = users_ref.where("cpf", "==", user_in.cpf).stream()
    if any(cpf_query):
        raise HTTPException(
            status_code=400,
            detail="The user with this CPF already exists in the system.",
        )
    
    # Hashing password
    hashed_password = security.get_password_hash(user_in.password)
    
    # Create User Document
    new_user_data = {
        "email": user_in.email,
        "name": user_in.name,
        "cpf": user_in.cpf,
        "hashed_password": hashed_password,
        "is_active": True,
        "is_superuser": False
    }
    
    # Add to Firestore (auto-generated ID)
    update_time, user_ref = users_ref.add(new_user_data)
    
    # Add ID to response
    new_user_data["id"] = user_ref.id
    return new_user_data

@router.post("/login", response_model=Token)
def login_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(deps.get_db)) -> Any:
    # User authentication logic via Firestore
    users_ref = db.collection("users")
    query = users_ref.where("email", "==", form_data.username).limit(1).stream()
    
    user_doc = next(query, None)
    
    if not user_doc:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    user_data = user_doc.to_dict()
    
    if not security.verify_password(form_data.password, user_data["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Using 'sub' as user ID for token
    access_token = security.create_access_token(
        subject=user_doc.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
