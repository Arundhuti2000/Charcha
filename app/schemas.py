from typing import Optional
from pydantic import BaseModel
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
    class Config:
        orm_mode = True