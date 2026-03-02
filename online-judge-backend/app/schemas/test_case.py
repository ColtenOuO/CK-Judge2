from typing import Optional
from pydantic import BaseModel
from uuid import UUID

class TestCaseBase(BaseModel):
    input_data: Optional[str] = None
    output_data: Optional[str] = None
    group: Optional[int] = 1
    points: Optional[int] = 0
    is_sample: Optional[bool] = False

class TestCaseCreate(TestCaseBase):
    input_data: str
    output_data: str

class TestCaseUpdate(TestCaseBase):
    pass

class TestCaseInDBBase(TestCaseBase):
    id: UUID
    problem_id: UUID

    class Config:
        from_attributes = True
class TestCaseOut(TestCaseInDBBase):
    pass
