from typing import List, Optional
from sqlalchemy import Boolean, Tuple, case, func
from sqlalchemy.orm import Session
from .base_repository import BaseRepository
from ..interfaces.interfaces import IUserRepository
from ...models import User, Post, Votes, Followers

class UserRepository(BaseRepository[User], IUserRepository): 
    def __init__(self, db: Session):
        super().__init__(db, User)
    
    def get_by_email(self, email: str) -> Optional[User]:
        #Query from routes/auth.py and routes/user.py
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_username(self, username: str) -> Optional[User]: 
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()
    
    def email_exists(self, email: str) -> bool:
        return self.db.query(User).filter(User.email == email).first() is not None
    
    def username_exists(self, username: str) -> bool: 
        """Check if username already exists"""
        return self.db.query(User).filter(User.username == username).first() is not None
    
    def create_with_hashed_password(self, email: str, hashed_password: str, username: str = None, full_name: str = None,phone_number: str = None) -> User: #create_user()
        return self.create(
            email=email,
            username=username,
            full_name=full_name,
            password=hashed_password,
            phone_number=phone_number
        )
    
    def update_username(self, user_id: int, new_username: str) -> Optional[User]:
        """Update user's username"""
        # Check if username already exists
        if self.username_exists(new_username):
            return None
        return self.update(user_id, username=new_username)
    
    def update_full_name(self, user_id: int, full_name: str) -> Optional[User]: 
        """Update user's full name"""
        return self.update(user_id, full_name=full_name)
    
    def search_users(self, search_term: str, skip: int = 0, limit: int = 10) -> List[User]:
        """Search users by username, full_name, or email"""
        return self.db.query(User).filter(
            (User.username.ilike(f"%{search_term}%")) |
            (User.full_name.ilike(f"%{search_term}%")) |
            (User.email.ilike(f"%{search_term}%"))
        ).offset(skip).limit(limit).all()
    
    def get_user_profile_data(self, user_id: int) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            return user
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
    
    def get_user_vote_statistics(self, user_id: int) -> dict:
        """Get total vote statistics for all user's posts"""
        user_post_ids = self.db.query(Post.id).filter(Post.user_id == user_id).subquery()
        
        vote_stats = (
            self.db.query(
                func.count(Votes.post_id).label("total_votes"),
                func.count(case((Votes.dir == 1, 1))).label("total_upvotes"),
                func.count(case((Votes.dir == -1, 1))).label("total_downvotes")
            )
            .filter(Votes.post_id.in_(user_post_ids))
            .first()
        )
        
        return {
            "total_votes": vote_stats.total_votes or 0,
            "total_upvotes": vote_stats.total_upvotes or 0,
            "total_downvotes": vote_stats.total_downvotes or 0
        }

    def get_user_posts_count(self, user_id: int) -> int:
        """Get total number of posts by user"""
        return self.db.query(Post).filter(Post.user_id == user_id).count()

    def get_most_popular_post(self, user_id: int) -> Optional[dict]:
        """Get the most popular post by vote count"""
        # Get user's posts with vote counts
        most_popular = (
            self.db.query(
                Post,
                func.count(Votes.post_id).label("vote_count")
            )
            .outerjoin(Votes, Votes.post_id == Post.id)
            .filter(Post.user_id == user_id)
            .group_by(Post.id)
            .order_by(func.count(Votes.post_id).desc())
            .first()
        )
        
        if most_popular and most_popular.vote_count > 0:
            post = most_popular.Post
            return {
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "category": post.category,
                "published": post.published,
                "rating": post.rating,
                "created_at": post.created_at,
                "user_id": post.user_id,
                "owner": {
                    "id": post.owner.id,
                    "email": post.owner.email,
                    "username": post.owner.username,  
                    "full_name": post.owner.full_name,
                    "created_at": post.owner.created_at
                }
            }
        
        return None
    
    def get_user_with_stats(self, user_id: int, current_user_id: int = None) -> Optional[Tuple]:
        """Get user with stats using tuple approach similar to posts with votes"""
        is_following = None
        is_followed_by = None
        is_mutual = None
        
        if current_user_id is not None and current_user_id != user_id:
            # Check if current user follows target user
            following_check = self.db.query(Followers).filter(
                Followers.follower_id == current_user_id,
                Followers.following_id == user_id
            ).first()
            is_following = following_check is not None
            
            # Check if target user follows current user
            followed_by_check = self.db.query(Followers).filter(
                Followers.follower_id == user_id,
                Followers.following_id == current_user_id
            ).first()
            is_followed_by = followed_by_check is not None
            
            # Mutual is true if both conditions are true
            is_mutual = is_following and is_followed_by
        result = (
            self.db.query(
                User,
                # Follower count
                func.coalesce(self.db.query(func.count(Followers.follower_id)).filter(Followers.following_id == user_id).scalar_subquery(),0).label('followers_count'),
                # Following count  
                func.coalesce(self.db.query(func.count(Followers.following_id)).filter(Followers.follower_id == user_id).scalar_subquery(),0).label('following_count'),
                # Posts count
                func.coalesce(self.db.query(func.count(Post.id)).filter(Post.user_id == user_id).scalar_subquery(),0).label('posts_count'),
                # Total votes received
                func.coalesce(self.db.query(func.count(Votes.post_id)).join(Post, Post.id == Votes.post_id).filter(Post.user_id == user_id).scalar_subquery(),0).label('total_votes_received'),
                # Total upvotes received
                func.coalesce(self.db.query(func.count(case((Votes.dir == 1, 1)))).join(Post, Post.id == Votes.post_id).filter(Post.user_id == user_id).scalar_subquery(),0).label('total_upvotes_received'),
                # Total downvotes received
                func.coalesce(self.db.query(func.count(case((Votes.dir == -1, 1)))).join(Post, Post.id == Votes.post_id).filter(Post.user_id == user_id).scalar_subquery(),0).label('total_downvotes_received'),
                # Is following (only if current_user_id provided and different)
                func.cast(is_following, Boolean).label('is_following') ,
                func.cast(is_followed_by, Boolean).label('is_followed_by') ,
                func.cast(is_mutual, Boolean).label('is_mutual') 
        ).filter(User.id == user_id)
        .first())
        return result
