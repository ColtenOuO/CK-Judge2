from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app import crud, models, schemas
from app.api import deps
from app.worker.tasks import judge_submission

router = APIRouter()

@router.post("/", response_model=schemas.SubmissionOut)
def create_submission(
    *,
    db: Session = Depends(deps.get_db),
    submission_in: schemas.SubmissionCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new submission.
    """
    submission = crud.submission.create(db=db, obj_in=submission_in, user_id=current_user.id)
    
    # Trigger Celery task
    judge_submission.delay(str(submission.id))
    
    return submission

@router.get("/", response_model=List[schemas.SubmissionOut])
def read_submissions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve submissions.
    """
    if current_user.is_superuser:
        submissions = crud.submission.get_multi(db, skip=skip, limit=limit)
    else:
        submissions = crud.submission.get_by_user(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return submissions

@router.get("/{id}", response_model=schemas.SubmissionOut)
def read_submission(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get submission by ID.
    """
    submission = crud.submission.get(db=db, id=id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if not current_user.is_superuser and (submission.user_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return submission
