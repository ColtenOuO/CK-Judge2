from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app import crud, schemas, models
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.UserOut])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """取得所有使用者"""
    users = crud.user.get_multi(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """註冊新帳號"""
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="該電子郵件已在系統中註冊。",
        )
    return crud.user.create(db, obj_in=user_in)

@router.get("/me", response_model=schemas.UserOut)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """取得當前登入使用者的資訊"""
    return current_user

from fastapi import UploadFile, File
import shutil
import os
from datetime import datetime

@router.post("/me/avatar", response_model=schemas.UserOut)
def upload_avatar(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """上傳使用者頭像"""
    # Ensure directory exists
    upload_dir = "static/uploads/avatars"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Generate filename
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    extension = os.path.splitext(file.filename)[1]
    filename = f"{current_user.id}_{timestamp}{extension}"
    file_path = f"{upload_dir}/{filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Update user avatar_url
    # Construct URL (assuming server runs on same host/port, returning relative path or full URL if needed)
    # Here we return relative path which frontend can prepend API_BASE or if served from root
    # Since we mounted /static at root app, the URL is /static/uploads/avatars/...
    # But strictly speaking, it depends on how frontend constructs the image URL.
    # Let's save the absolute URL path from server root.
    avatar_url = f"/static/uploads/avatars/{filename}"
    
    user = crud.user.update(db, db_obj=current_user, obj_in={"avatar_url": avatar_url})
    return user

@router.get("/{user_id}", response_model=schemas.UserOut)
def read_user_by_id(
    user_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """透過 ID 取得特定使用者資訊"""
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="找不到該使用者")
    return user

@router.patch("/{user_id}", response_model=schemas.UserOut)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: UUID,
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """更新使用者資訊"""
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="找不到該使用者")
    
    if not current_user.is_superuser and current_user.id != user_id:
        raise HTTPException(
            status_code=403, 
            detail="權限不足，無法修改他人資料"
        )
    
    user = crud.user.update(db, db_obj=user, obj_in=user_in)
    return user

@router.delete("/{user_id}", response_model=schemas.UserOut)
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: UUID,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """刪除使用者 (僅限管理員操作)"""
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="找不到該使用者")
    return crud.user.remove(db, id=user_id)