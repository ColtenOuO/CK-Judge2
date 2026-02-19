import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"), nullable=False)
    contest_id = Column(UUID(as_uuid=True), ForeignKey("contests.id"), nullable=True) # Optional link to contest
    
    language = Column(String, nullable=False) # Python, C++, C
    code = Column(Text, nullable=False)
    
    status = Column(String, default="Pending") # Pending, Judging, Accepted, Wrong Answer, etc.
    total_score = Column(Integer, default=0)
    time_used = Column(Integer, default=0) # ms
    memory_used = Column(Integer, default=0) # kb
    
    details = Column(JSON, nullable=True) # Detailed test case results
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="submissions")
    problem = relationship("Problem", backref="submissions")
    contest = relationship("Contest", backref="submissions")

    @property
    def problem_title(self):
        return self.problem.title if self.problem else "Unknown Problem"
