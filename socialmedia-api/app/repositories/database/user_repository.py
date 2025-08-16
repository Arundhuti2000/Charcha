from typing import List, Optional
from sqlalchemy import case, func
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
    
    def create_with_hashed_password(self, email: str, hashed_password: str, phone_number: str = None) -> User: #create_user()
        return self.create(
            email=email,
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
                    "created_at": post.owner.created_at
                }
            }
        
        return None

    def get_comprehensive_profile(self, user_id: int, current_user_id: int = None) -> Optional[dict]:
        """Get comprehensive user profile with all stats"""
        user = self.get_by_id(user_id)
        if not user:
            return None
        
        # Import here to avoid circular imports
        from .follower_repository import FollowerRepository
        
        # Create follower repository instance
        follower_repo = FollowerRepository(self.db)
        
        # Get social stats
        follower_count = follower_repo.get_follower_count(user_id)
        following_count = follower_repo.get_following_count(user_id)
        
        # Get posts count
        posts_count = self.get_user_posts_count(user_id)
        
        # Get vote statistics
        vote_stats = self.get_user_vote_statistics(user_id)
        
        # Get most popular post
        most_popular_post = self.get_most_popular_post(user_id)
        
        # Get relationship status if viewing another user
        is_following = None
        is_followed_by = None
        is_mutual = None
        
        if current_user_id and current_user_id != user_id:
            follow_status = follower_repo.get_user_follow_status(current_user_id, user_id)
            is_following = follow_status["is_following"]
            is_followed_by = follow_status["is_followed_by"]
            is_mutual = follow_status["is_mutual"]
        
        return {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at,
            "phone_number": user.phone_number,
            "followers_count": follower_count,
            "following_count": following_count,
            "posts_count": posts_count,
            "total_votes_received": vote_stats["total_votes"],
            "total_upvotes_received": vote_stats["total_upvotes"],
            "total_downvotes_received": vote_stats["total_downvotes"],
            "is_following": is_following,
            "is_followed_by": is_followed_by,
            "is_mutual": is_mutual,
            "last_active": user.created_at,  # You can update this with actual last activity later
            "most_popular_post": most_popular_post
        }