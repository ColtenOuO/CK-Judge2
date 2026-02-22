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

@router.post("/bulk", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_users_bulk(
    *,
    db: Session = Depends(deps.get_db),
    users_in: List[schemas.UserCreate],
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """大量註冊新帳號 (僅限管理員)"""
    created_count = 0
    errors = []
    
    for i, user_in in enumerate(users_in):
        if crud.user.get_by_email(db, email=user_in.email):
            errors.append(f"Row {i+1}: Email {user_in.email} already registered.")
            continue
            
        if db.query(models.User).filter(models.User.username == user_in.username).first():
            errors.append(f"Row {i+1}: Username {user_in.username} already taken.")
            continue
            
        crud.user.create(db, obj_in=user_in)
        created_count += 1
        
    return {
        "success": True,
        "created_count": created_count,
        "errors": errors
    }

@router.get("/me", response_model=schemas.UserOut)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """取得當前登入使用者的資訊"""
    return current_user

from sqlalchemy import func

@router.get("/me/stats")
def read_user_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """取得當前使用者的統計資訊（解題數、提交數、排名）"""
    solved_count = db.query(models.Submission.problem_id)\
        .filter(models.Submission.user_id == current_user.id, models.Submission.status == "Accepted")\
        .distinct().count()
        
    submission_count = db.query(models.Submission)\
        .filter(models.Submission.user_id == current_user.id).count()
        
    user_stats = db.query(
        models.User.id,
        func.count(func.distinct(models.Submission.problem_id)).label('ac_count')
    ).outerjoin(models.Submission, (models.Submission.user_id == models.User.id) & (models.Submission.status == "Accepted"))\
     .group_by(models.User.id)\
     .order_by(func.count(func.distinct(models.Submission.problem_id)).desc())\
     .all()
     
    rank = 1
    current_ac = -1
    tied_offset = 0
    for row in user_stats:
        if current_ac == -1:
            current_ac = row.ac_count
        elif row.ac_count < current_ac:
            current_ac = row.ac_count
            rank += tied_offset + 1
            tied_offset = 0
        else:
            tied_offset += 1
            
        if row.id == current_user.id:
            break
        
        
    return {
        "solved_count": solved_count,
        "submission_count": submission_count,
        "rank": rank
    }

@router.get("/rankings")
def read_users_rankings(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """取得排行榜"""
    user_stats = db.query(
        models.User.id,
        models.User.username,
        models.User.avatar_url,
        func.count(func.distinct(models.Submission.problem_id)).label('ac_count')
    ).outerjoin(models.Submission, (models.Submission.user_id == models.User.id) & (models.Submission.status == "Accepted"))\
     .group_by(models.User.id)\
     .order_by(func.count(func.distinct(models.Submission.problem_id)).desc())\
     .offset(skip).limit(limit).all()
     
    return [
        {
            "id": str(row.id),
            "username": row.username,
            "avatar_url": row.avatar_url,
            "solved_count": row.ac_count
        } for row in user_stats
    ]

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
        
    if user_in.is_superuser is not None and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="權限不足，無法修改管理員權限"
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