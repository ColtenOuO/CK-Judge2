from sqlalchemy import Column, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.session import Base

problem_tags = Table(
    "problem_tags",
    Base.metadata,
    Column("problem_id", UUID(as_uuid=True), ForeignKey("problems.id"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id"), primary_key=True),
)

class Tag(Base):
    __tablename__ = "tags"

    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        index=True, 
        nullable=False
    )
    name = Column(String, unique=True, index=True, nullable=False)
    
    problems = relationship("Problem", secondary=problem_tags, back_populates="tags")
