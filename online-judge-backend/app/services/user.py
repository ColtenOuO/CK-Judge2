from sqlalchemy.orm import Session
from app import crud, schemas

class UserService:
    def register_user(self, db: Session, user_in: schemas.UserCreate):
        return crud.user.create(db, obj_in=user_in)

user_service = UserService()