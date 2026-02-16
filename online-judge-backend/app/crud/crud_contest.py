from typing import List, Optional, Union, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from app.models.contest import Contest, ContestProblem
from app.schemas.contest import ContestCreate, ContestUpdate, ContestProblemCreate

class CRUDContest:
    def get(self, db: Session, id: UUID) -> Optional[Contest]:
        return db.query(Contest).filter(Contest.id == id).first()

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[Contest]:
        return db.query(Contest).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: ContestCreate, created_by_id: Optional[UUID] = None) -> Contest:
        db_obj = Contest(
            title=obj_in.title,
            description=obj_in.description,
            start_time=obj_in.start_time,
            end_time=obj_in.end_time,
            is_active=obj_in.is_active,
            created_by_id=created_by_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        if obj_in.problems:
            for problem_in in obj_in.problems:
                contest_problem = ContestProblem(
                    contest_id=db_obj.id,
                    problem_id=problem_in.problem_id,
                    score=problem_in.score,
                    order=problem_in.order
                )
                db.add(contest_problem)
            db.commit()
            db.refresh(db_obj)
            
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: Contest,
        obj_in: Union[ContestUpdate, Dict[str, Any]]
    ) -> Contest:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        problems_in = update_data.pop("problems", None)
        
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        
        if problems_in is not None:
            db.query(ContestProblem).filter(ContestProblem.contest_id == db_obj.id).delete()
            
            for problem_in in problems_in:
                if isinstance(problem_in, dict):
                    pid = problem_in.get("problem_id")
                    score = problem_in.get("score", 100)
                    order = problem_in.get("order", 0)
                else:
                    pid = problem_in.problem_id
                    score = problem_in.score
                    order = problem_in.order
                    
                contest_problem = ContestProblem(
                    contest_id=db_obj.id,
                    problem_id=pid,
                    score=score,
                    order=order
                )
                db.add(contest_problem)
            db.commit()
            
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: UUID) -> Contest:
        obj = db.query(Contest).get(id)
        db.delete(obj)
        db.commit()
        return obj

contest = CRUDContest()
