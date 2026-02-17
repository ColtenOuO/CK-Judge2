from typing import Optional, List
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.tag import Tag
from app.schemas.tag import TagCreate

class CRUDTag:
    def get(self, db: Session, id: UUID) -> Optional[Tag]:
        return db.query(Tag).filter(Tag.id == id).first()

    def get_by_name(self, db: Session, *, name: str) -> Optional[Tag]:
        return db.query(Tag).filter(Tag.name == name).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[Tag]:
        return db.query(Tag).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: TagCreate) -> Tag:
        db_obj = Tag(name=obj_in.name)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_or_create(self, db: Session, name: str) -> Tag:
        tag = self.get_by_name(db, name=name)
        if not tag:
            tag_in = TagCreate(name=name)
            tag = self.create(db, obj_in=tag_in)
        return tag

tag = CRUDTag()
