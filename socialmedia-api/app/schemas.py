from typing import List, Optional, Annotated
from pydantic import BaseModel, EmailStr, Field
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

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime
    class Config:
        orm_mode = True

    # Future fields to add
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    class Config:
        orm_mode = True

class PostResponse(PostBase):
    id: int
    created_at: datetime
    user_id: int
    owner: UserResponse
    class Config:
        orm_mode = True

class PostwithVote(BaseModel):
    Post: PostResponse
    Votes: int
    Upvotes: int
    Downvotes: int
    has_liked: bool = False
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: EmailStr
    password: str
    phone_number: Optional[str] = None


class CurrentUserProfile(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime
    phone_number: Optional[str] = None

    followers_count: int
    following_count: int
    posts_count: int
    total_votes_received: int
    total_upvotes_received: int
    total_downvotes_received: int

    is_following: Optional[bool] = None  # Am I following this user?
    is_followed_by: Optional[bool] = None  # Does this user follow me?
    is_mutual: Optional[bool] = None

    last_active: Optional[datetime] = None
    most_popular_post: Optional[PostResponse] = None

class CreateUser(UserBase):
    pass



class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None

class Vote(BaseModel):
    post_id: int
    dir: Annotated[int, Field(strict=True, le=1)]

class FollowRequest(BaseModel):
    following_id: int

class FollowerResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime
    followed_at: datetime
    class Config:
        orm_mode = True

class FollowingResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime
    started_following_at: datetime  # When the follow relationship was created
    
    class Config:
        orm_mode = True

class UserWithFollowStats(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime
    followers_count: int
    following_count: int
    
    class Config:
        orm_mode = True

class FollowStatus(BaseModel):
    is_following: bool
    is_followed_by: bool
    is_mutual: bool

class FollowersList(BaseModel):
    followers: List[UserResponse]
    total: int
    skip: int
    limit: int
    has_more: bool

class FollowingList(BaseModel):
    following: List[UserResponse]
    total: int
    skip: int
    limit: int
    has_more: bool

class UserStats(BaseModel):
    user_id: int
    email: EmailStr
    followers_count: int
    following_count: int
    created_at: datetime

class FollowActionResponse(BaseModel):
    success: bool
    message: str
    user_stats: Optional[UserStats] = None

class UpdateEmailRequest(BaseModel):
    new_email: EmailStr

class UpdatePhoneRequest(BaseModel):
    phone_number: str
