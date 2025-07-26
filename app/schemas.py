from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class PostBase(BaseModel):
    title: str
    content: str
    category: str
    published: bool = True
    rating: Optional[int] = None
    

class CreatePost(PostBase):
    pass

class UpdatePost(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    created_at: datetime
    user_id: int
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: EmailStr
    password: str
    phone_number: Optional[str] = None

class CreateUser(UserBase):
    pass

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime
    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None