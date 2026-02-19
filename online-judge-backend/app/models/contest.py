from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.session import Base
import enum

class ContestType(str, enum.Enum):
    CONTEST = "Contest"
    HOMEWORK = "Homework"

class ContestProblem(Base):
    __tablename__ = "contest_problems"

    contest_id = Column(UUID(as_uuid=True), ForeignKey("contests.id"), primary_key=True)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"), primary_key=True)
    
    score = Column(Integer, default=100, nullable=False)
    order = Column(Integer, default=0, nullable=False)
    
    contest = relationship("Contest", back_populates="contest_problems")
    problem = relationship("Problem")

class Contest(Base):
    __tablename__ = "contests"

    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        index=True, 
        nullable=False
    )
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, default=ContestType.CONTEST, nullable=False)
    
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    
    is_active = Column(Boolean, default=True)
    is_visible = Column(Boolean, default=True)
    
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    contest_problems = relationship("ContestProblem", back_populates="contest", cascade="all, delete-orphan")
