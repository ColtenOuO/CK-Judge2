from typing import List, Optional, Any, Dict, Union
from sqlalchemy.orm import Session
from app.models.submission import Submission
from app.schemas.submission import SubmissionCreate, SubmissionUpdate
from uuid import UUID

class CRUDSubmission:
    def get(self, db: Session, id: UUID) -> Optional[Submission]:
        return db.query(Submission).filter(Submission.id == id).first()

    def get_by_user(self, db: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Submission]:
        return db.query(Submission).filter(Submission.user_id == user_id).offset(skip).limit(limit).all()

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Submission]:
        return db.query(Submission).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: SubmissionCreate, user_id: UUID) -> Submission:
        db_obj = Submission(
            user_id=user_id,
            problem_id=obj_in.problem_id,
            contest_id=obj_in.contest_id,
            language=obj_in.language,
            code=obj_in.code,
            status="Pending"
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_status(self, db: Session, submission_id: UUID, status: str) -> Optional[Submission]:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if submission:
            submission.status = status
            db.commit()
            db.refresh(submission)
        return submission

    def update_result(
        self, 
        db: Session, 
        submission_id: UUID, 
        status: str, 
        total_score: int, 
        time_used: int, 
        memory_used: int, 
        details: List[Dict[str, Any]]
    ) -> Optional[Submission]:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if submission:
            submission.status = status
            submission.total_score = total_score
            submission.time_used = time_used
            submission.memory_used = memory_used
            submission.details = details
            db.commit()
            db.refresh(submission)
        return submission

submission = CRUDSubmission()
