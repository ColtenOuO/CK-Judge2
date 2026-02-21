from typing import Optional, Any, Dict, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class SubmissionBase(BaseModel):
    problem_id: UUID
    contest_id: Optional[UUID] = None
    language: str
    code: str

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionUpdate(SubmissionBase):
    status: Optional[str] = None
    total_score: Optional[int] = None
    time_used: Optional[int] = None
    memory_used: Optional[int] = None
    details: Optional[Any] = None

class SubmissionOut(SubmissionBase):
    id: UUID
    user_id: UUID
    username: Optional[str] = None
    problem_title: Optional[str] = None
    status: str
    total_score: int
    time_used: int
    memory_used: int
    details: Optional[Any] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
