import re
from typing import List, Optional, Annotated
from pydantic import BaseModel, EmailStr, Field, validator
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
    username: Optional[str] = None 
    full_name: Optional[str] = None
    created_at: datetime

    # # Future fields to add
    # bio: Optional[str] = None
    # avatar_url: Optional[str] = None
    # location: Optional[str] = None
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
    username: Optional[str] = None  
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

    @validator('username')
    def validate_username(cls, v):
        if v is not None:
            if not re.match("^[a-zA-Z0-9_]{3,50}$", v):
                raise ValueError('Username must be 3-50 characters and contain only letters, numbers, and underscores')
        return v
    @validator('full_name')
    def validate_full_name(cls, v):
        if v is not None and len(v.strip()) < 2:
            raise ValueError('Full name must be at least 2 characters')
        return v.strip() if v else None

class CreateUser(UserBase):
    pass

class UpdateEmailRequest(BaseModel):
    new_email: EmailStr

class UpdatePhoneRequest(BaseModel):
    phone_number: str

class UpdateUsernameRequest(BaseModel):
    username: str
    
    @validator('username')
    def validate_username(cls, v):
        if not re.match("^[a-zA-Z0-9_]{3,50}$", v):
            raise ValueError('Username must be 3-50 characters and contain only letters, numbers, and underscores')
        return v

class UpdateFullNameRequest(BaseModel):
    full_name: str
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Full name must be at least 2 characters')
        return v.strip()

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
    User: UserResponse
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
    """Complete user profile with stats - matches tuple structure"""
    User: UserResponse  # The User object
    followers_count: int
    following_count: int
    posts_count: int
    total_votes_received: int
    total_upvotes_received: int
    total_downvotes_received: int

class UserWithStats(BaseModel):
    """Complete user profile with stats - matches tuple structure"""
    User: UserResponse  # The User object
    followers_count: int
    following_count: int
    posts_count: int
    total_votes_received: int
    total_upvotes_received: int
    total_downvotes_received: int
    is_following: Optional[bool] = None
    is_followed_by: Optional[bool] = None
    is_mutual: Optional[bool] = None
    # most_popular_post: Optional['PostResponse'] = None
    
    class Config:
        orm_mode = True

class FollowActionResponse(BaseModel):
    success: bool
    message: str
    user_stats: Optional[UserWithFollowStats] = None

