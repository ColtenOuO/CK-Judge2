from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class ContestProblemBase(BaseModel):
    problem_id: UUID
    score: int = 100
    order: int = 0

class ContestProblemCreate(ContestProblemBase):
    pass

class ContestProblemUpdate(ContestProblemBase):
    pass

class MinimalProblem(BaseModel):
    title: str

class ContestProblemOut(ContestProblemBase):
    problem: Optional[MinimalProblem] = None

    class Config:
        from_attributes = True

from app.models.contest import ContestType

class ContestBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: ContestType = ContestType.CONTEST
    start_time: datetime
    end_time: datetime
    is_active: bool = True
    is_visible: bool = True

class ContestCreate(ContestBase):
    problems: List[ContestProblemCreate] = []

class ContestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    is_active: Optional[bool] = None
    is_visible: Optional[bool] = None
    problems: Optional[List[ContestProblemCreate]] = None

class ContestInDBBase(ContestBase):
    id: UUID
    created_by_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class ContestOut(ContestInDBBase):
    contest_problems: List[ContestProblemOut] = []
