from typing import Optional
from pydantic import BaseModel
from uuid import UUID

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagOut(TagBase):
    id: UUID

    class Config:
        from_attributes = True
