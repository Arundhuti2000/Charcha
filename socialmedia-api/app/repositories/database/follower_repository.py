from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from .base_repository import BaseRepository
from ..interfaces.interfaces import IFollowerRepository
from ...models import Post, Votes, User, Followers

class FollowerRepository(BaseRepository[Followers], IFollowerRepository):
    def __init__(self, db: Session):
        super().__init__(db, Post)
        
    def is_following(self, follower_id: int, following_id: int) -> bool:
        follow_exists = self.db.query(Followers).filter(
            Followers.follower_id == follower_id,
            Followers.following_id == following_id
        ).first()
        return follow_exists is not None
    
    def follow_user(self, follower_id: int, following_id: int) -> Followers:
        # Check if relationship already exists
        existing_follow = self.is_following(follower_id,following_id)
        if existing_follow:
            raise ValueError("User is already following this user")
        
        if follower_id == following_id:
            raise ValueError("Users cannot follow themselves")
        new_follow = Followers(follower_id=follower_id, following_id=following_id)
        self.db.add(new_follow)
        self.db.commit()
        self.db.refresh(new_follow)
        return new_follow
    
    def unfollow_user(self, follower_id: int, following_id: int) -> bool:
        follow_to_delete = self.db.query(Followers).filter(
            Followers.follower_id == follower_id,
            Followers.following_id == following_id
        ).first()
        
        if follow_to_delete:
            self.db.delete(follow_to_delete)
            self.db.commit()
            return True
        return False
