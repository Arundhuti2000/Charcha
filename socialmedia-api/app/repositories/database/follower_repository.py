from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from .base_repository import BaseRepository
from ..interfaces.interfaces import IFollowerRepository
from ...models import Post, Votes, User, Followers

class FollowerRepository(BaseRepository[Followers], IFollowerRepository):
    def __init__(self, db: Session):
        super().__init__(db, Followers)
        
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

    #Get followers
    def get_followers(self, user_id: int, skip: int = 0, limit: int = 100) -> List[User]:
        followers = self.db.query(User).join(
            Followers, User.id == Followers.follower_id
        ).filter(
            Followers.following_id == user_id
        ).offset(skip).limit(limit).all()
        
        return followers
    
    #Get following users
    def get_following(self, user_id: int, skip: int = 0, limit: int = 100) -> List[User]:
        following = self.db.query(User).join(
            Followers, User.id == Followers.following_id
        ).filter(
            Followers.follower_id == user_id
        ).offset(skip).limit(limit).all()
        
        return following
    #Get total no of followers
    def get_follower_count(self, user_id: int) -> int:
        count = self.db.query(Followers).filter(
            Followers.following_id == user_id
        ).count()
        return count
    
    #Get total no of following
    def get_following_count(self, user_id: int) -> int:
        count = self.db.query(Followers).filter(
            Followers.follower_id == user_id
        ).count()
        return count
    
    #Get follower and following counts for a user
    def get_user_stats(self, user_id: int) -> Dict:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        follower_count = self.get_follower_count(user_id)
        following_count = self.get_following_count(user_id)
        
        return {
            "user_id": user_id,
            "email": user.email,
            "followers_count": follower_count,
            "following_count": following_count,
            "created_at": user.created_at
        }
    
    #Get users who follow each other mutually
    def get_mutual_follows(self, user_id: int) -> List[User]:
        # Find users where:
        # 1. user_id follows them AND
        # 2. they follow user_id back
        
        mutual_users = self.db.query(User).join(
            Followers, User.id == Followers.following_id
        ).filter(
            Followers.follower_id == user_id
        ).intersect(
            self.db.query(User).join(
                Followers, User.id == Followers.follower_id
            ).filter(
                Followers.following_id == user_id
            )
        ).all()
        
        return mutual_users
    
    #Get followers with pagination information
    def get_followers_with_pagination_info(self, user_id: int, skip: int = 0, limit: int = 100) -> Dict:
        total_followers = self.get_follower_count(user_id)
        followers = self.get_followers(user_id, skip, limit)
        
        return {
            "followers": followers,
            "total": total_followers,
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_followers
        }
    
    #Get following with pagination information
    def get_following_with_pagination_info(self, user_id: int, skip: int = 0, limit: int = 100) -> Dict:
        total_following = self.get_following_count(user_id)
        following = self.get_following(user_id, skip, limit)
        
        return {
            "following": following,
            "total": total_following,
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_following
        }
    
    #Get comprehensive follow status between two users
    def get_user_follow_status(self, current_user_id: int, target_user_id: int) -> Dict:
        is_following_target = self.is_following(current_user_id, target_user_id)
        is_followed_by_target = self.is_following(target_user_id, current_user_id)
        
        return {
            "is_following": is_following_target,
            "is_followed_by": is_followed_by_target,
            "is_mutual": is_following_target and is_followed_by_target
        }