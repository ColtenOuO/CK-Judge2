from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.problem import Difficulty

# Shared properties
class ProblemBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    input_description: Optional[str] = None
    output_description: Optional[str] = None
    hint: Optional[str] = None
    time_limit: Optional[int] = 1000
    memory_limit: Optional[int] = 256
    difficulty: Optional[Difficulty] = Difficulty.EASY
    is_active: Optional[bool] = True
    is_special_judge: Optional[bool] = False
    checker_code: Optional[str] = None
    is_partial: Optional[bool] = False
    main_code: Optional[str] = None
    template_code: Optional[str] = None

# Properties to receive on problem creation
class ProblemCreate(ProblemBase):
    title: str
    description: str
    input_description: str
    output_description: str

# Properties to receive on problem update
class ProblemUpdate(ProblemBase):
    pass

# Properties shared by models stored in DB
class ProblemInDBBase(ProblemBase):
    id: UUID
    created_at: Optional[UUID] = None

    class Config:
        from_attributes = True

# Properties to return to client
class ProblemOut(ProblemInDBBase):
    pass
