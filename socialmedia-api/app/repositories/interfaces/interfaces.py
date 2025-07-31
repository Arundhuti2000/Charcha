from abc import ABC, abstractmethod
from typing import List, Optional, Tuple
from ...models import Post, User, Votes

class IPostRepository(ABC):
    @abstractmethod
    def get_posts_with_votes(self, skip: int = 0, limit: int = 10, search: str = "")-> List[Tuple]:
        """Get posts with vote counts and search functionality"""
        pass
    
    @abstractmethod
    def get_user_posts_with_votes(self, user_id: int, skip: int = 0, limit: int = 10) -> List[Tuple]:
        """Get user's posts with vote counts"""
        pass
    
    @abstractmethod
    def get_post_with_votes_by_id(self, post_id: int) -> Optional[Tuple]:
        """Get single post with vote counts"""
        pass
    
    @abstractmethod
    def get_posts_by_user_id(self, user_id: int) -> List[Post]:
        """Get all posts by specific user"""
        pass

class IUserRepository(ABC):
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address"""
        pass
    
    @abstractmethod
    def email_exists(self, email: str) -> bool:
        """Check if email already exists"""
        pass

class IVoteRepository(ABC):
    @abstractmethod
    def get_user_vote_for_post(self, post_id: int, user_id: int) -> Optional[Votes]:
        """Get user's vote for specific post"""
        pass
    
    @abstractmethod
    def create_vote(self, post_id: int, user_id: int, direction: int) -> Votes:
        """Create new vote"""
        pass
    
    @abstractmethod
    def update_vote_direction(self, post_id: int, user_id: int, direction: int) -> Optional[Votes]:
        """Update existing vote direction"""
        pass
    
    @abstractmethod
    def delete_user_vote(self, post_id: int, user_id: int) -> bool:
        """Delete user's vote for post"""
        pass
    
    @abstractmethod
    def get_post_vote_counts(self, post_id: int) -> dict:
        """Get vote counts for a post"""
        pass
