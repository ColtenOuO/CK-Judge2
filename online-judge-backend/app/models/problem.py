import uuid
from sqlalchemy import Column, String, Boolean, Integer, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum

class Difficulty(str, enum.Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class Problem(Base):
    __tablename__ = "problems"

    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        index=True, 
        nullable=False
    )
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    input_description = Column(Text, nullable=False)
    output_description = Column(Text, nullable=False)
    hint = Column(Text, nullable=True)
    
    time_limit = Column(Integer, default=1000, nullable=False)  # ms
    memory_limit = Column(Integer, default=256, nullable=False)  # KB
    
    difficulty = Column(String, default=Difficulty.EASY, nullable=False)
    
    is_active = Column(Boolean, default=True)
    
    # Special Judge support
    is_special_judge = Column(Boolean, default=False)
    checker_code = Column(Text, nullable=True)
    
    # Partial Code / Template support
    is_partial = Column(Boolean, default=False)
    main_code = Column(Text, nullable=True)
    template_code = Column(Text, nullable=True)
    
    created_at = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"),
        nullable=True
    )
    
    test_cases = relationship("TestCase", back_populates="problem", cascade="all, delete-orphan")
