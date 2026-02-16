from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.ContestOut])
def read_contests(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve contests.
    """
    contests = crud.contest.get_multi(db, skip=skip, limit=limit)
    return contests

@router.post("/", response_model=schemas.ContestOut)
def create_contest(
    *,
    db: Session = Depends(deps.get_db),
    contest_in: schemas.ContestCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new contest.
    """
    contest = crud.contest.create(db=db, obj_in=contest_in, created_by_id=current_user.id)
    return contest

@router.get("/{contest_id}", response_model=schemas.ContestOut)
def read_contest(
    *,
    db: Session = Depends(deps.get_db),
    contest_id: UUID,
) -> Any:
    """
    Get contest by ID.
    """
    contest = crud.contest.get(db=db, id=contest_id)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    return contest

@router.put("/{contest_id}", response_model=schemas.ContestOut)
def update_contest(
    *,
    db: Session = Depends(deps.get_db),
    contest_id: UUID,
    contest_in: schemas.ContestUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a contest.
    """
    contest = crud.contest.get(db=db, id=contest_id)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    contest = crud.contest.update(db=db, db_obj=contest, obj_in=contest_in)
    return contest

@router.delete("/{contest_id}", response_model=schemas.ContestOut)
def delete_contest(
    *,
    db: Session = Depends(deps.get_db),
    contest_id: UUID,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a contest.
    """
    contest = crud.contest.get(db=db, id=contest_id)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    contest = crud.contest.remove(db=db, id=contest_id)
    return contest
