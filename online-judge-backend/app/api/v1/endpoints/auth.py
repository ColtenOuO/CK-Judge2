from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import secrets
import string

from app import crud, schemas
from app.api import deps
from app.core import security
from app.core.config import settings

router = APIRouter()

@router.post("/login/access-token", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/reset-superuser", response_model=dict)
def reset_superuser(
    db: Session = Depends(deps.get_db),
    admin_key: str = Body(..., embed=True),
) -> Any:
    """
    Reset or create superuser password.
    Requires matching ADMIN_KEY in config.
    Returns the new random password.
    """
    if admin_key != settings.ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")

    alphabet = string.ascii_letters + string.digits
    new_password = ''.join(secrets.choice(alphabet) for i in range(16))
    
    user = crud.user.get_by_email(db, email="admin@example.com")
    if not user:
        user_in = schemas.UserCreate(
            email="admin@example.com",
            username="admin",
            password=new_password,
            is_superuser=True
        )
        crud.user.create(db, obj_in=user_in)
    else:
        user_in = schemas.UserUpdate(password=new_password, is_superuser=True)
        crud.user.update(db, db_obj=user, obj_in=user_in)
        
    return {
        "username": "admin",
        "email": "admin@example.com",
        "password": new_password,
        "note": "Please use 'admin@example.com' as the username field in the login form."
    }