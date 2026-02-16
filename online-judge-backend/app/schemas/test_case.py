from typing import Optional
from pydantic import BaseModel
from uuid import UUID

# Shared properties
class TestCaseBase(BaseModel):
    input_data: Optional[str] = None
    output_data: Optional[str] = None
    is_sample: Optional[bool] = False

# Properties to receive on creation
class TestCaseCreate(TestCaseBase):
    input_data: str
    output_data: str

# Properties to receive on update
class TestCaseUpdate(TestCaseBase):
    pass

# Properties shared by models stored in DB
class TestCaseInDBBase(TestCaseBase):
    id: UUID
    problem_id: UUID

    class Config:
        from_attributes = True

# Properties to return to client
class TestCaseOut(TestCaseInDBBase):
    pass
