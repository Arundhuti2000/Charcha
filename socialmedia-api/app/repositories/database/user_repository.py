from typing import Optional
from sqlalchemy.orm import Session
from .base_repository import BaseRepository
from ..interfaces.interfaces import IUserRepository
from ...models import User

class UserRepository(BaseRepository[User], IUserRepository): 
    def __init__(self, db: Session):
        super().__init__(db, User)
    
    def get_by_email(self, email: str) -> Optional[User]:
        #Query from routes/auth.py and routes/user.py
        return self.db.query(User).filter(User.email == email).first()
    
    def email_exists(self, email: str) -> bool:
        return self.db.query(User).filter(User.email == email).first() is not None
    
    def create_with_hashed_password(self, email: str, hashed_password: str, phone_number: str = None) -> User: #create_user()
        return self.create(
            email=email,
            password=hashed_password,
            phone_number=phone_number
        )
    
    def get_user_profile_data(self, user_id: int) -> Optional[dict]:
        user = self.get_by_id(user_id)
        if user:
            new_user= {
                "id": user.id,
                "email": user.email,
                "created_at": user.created_at,
                "phone_number": user.phone_number
            }
            return new_user
        return None
    
    def update_user_email(self, user_id: int, new_email: str) -> Optional[User]:
        current_user = self.get_by_id(user_id)
        if not current_user:
            return None
        if current_user.email == new_email:
            return current_user
        existing_user = self.get_by_email(new_email)
        if existing_user and existing_user.id != user_id:
            return None
        return self.update(user_id, email=new_email)
    
    def update_user_phone(self, user_id: int, phone_number: str) -> Optional[User]:
        return self.update(user_id, phone_number=phone_number)