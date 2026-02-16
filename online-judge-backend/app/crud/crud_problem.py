from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.problem import Problem
from app.schemas.problem import ProblemCreate, ProblemUpdate

class CRUDProblem:
    def get(self, db: Session, id: UUID) -> Optional[Problem]:
        return db.query(Problem).filter(Problem.id == id).first()

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[Problem]:
        return db.query(Problem).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: ProblemCreate) -> Problem:
        db_obj = Problem(
            title=obj_in.title,
            description=obj_in.description,
            input_description=obj_in.input_description,
            output_description=obj_in.output_description,
            hint=obj_in.hint,
            time_limit=obj_in.time_limit,
            memory_limit=obj_in.memory_limit,
            difficulty=obj_in.difficulty,
            is_active=obj_in.is_active,
            is_special_judge=obj_in.is_special_judge,
            checker_code=obj_in.checker_code,
            is_partial=obj_in.is_partial,
            main_code=obj_in.main_code,
            template_code=obj_in.template_code
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: Problem, obj_in: ProblemUpdate
    ) -> Problem:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: UUID) -> Problem:
        obj = db.query(Problem).get(id)
        db.delete(obj)
        db.commit()
        return obj

problem = CRUDProblem()
