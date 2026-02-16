from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.test_case import TestCase
from app.schemas.test_case import TestCaseCreate, TestCaseUpdate

class CRUDTestCase:
    def get(self, db: Session, id: UUID) -> Optional[TestCase]:
        return db.query(TestCase).filter(TestCase.id == id).first()

    def get_by_problem(
        self, db: Session, problem_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[TestCase]:
        return db.query(TestCase).filter(TestCase.problem_id == problem_id).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: TestCaseCreate, problem_id: UUID) -> TestCase:
        db_obj = TestCase(
            problem_id=problem_id,
            input_data=obj_in.input_data,
            output_data=obj_in.output_data,
            is_sample=obj_in.is_sample
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: TestCase, obj_in: TestCaseUpdate
    ) -> TestCase:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: UUID) -> TestCase:
        obj = db.query(TestCase).get(id)
        db.delete(obj)
        db.commit()
        return obj

test_case = CRUDTestCase()
