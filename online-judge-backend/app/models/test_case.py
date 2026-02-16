import uuid
from sqlalchemy import Column, String, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        index=True, 
        nullable=False
    )
    problem_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("problems.id"), 
        nullable=False
    )
    
    input_data = Column(Text, nullable=False)
    output_data = Column(Text, nullable=False)
    
    is_sample = Column(Boolean, default=False)
    
    problem = relationship("Problem", back_populates="test_cases")
