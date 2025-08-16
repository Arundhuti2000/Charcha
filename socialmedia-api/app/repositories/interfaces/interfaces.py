from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple
from ...models import Post, User, Votes, Followers

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
    def get_by_username(self, username: str) -> Optional[User]:  # NEW
        pass
    
    @abstractmethod
    def email_exists(self, email: str) -> bool:
        """Check if email already exists"""
        pass

    @abstractmethod
    def username_exists(self, username: str) -> bool:  # NEW
        pass

    
    @abstractmethod
    def create_with_hashed_password(self, email: str, hashed_password: str, phone_number: str = None) -> User:
        """Create a new user with hashed password"""
        pass

    @abstractmethod
    def get_user_profile_data(self, user_id: int) -> Optional[dict]:
        """Get user profile data"""
        pass

    @abstractmethod
    def get_user_with_stats(self, user_id: int, current_user_id: int = None) -> Optional[Tuple]:
        """Get user with comprehensive stats using tuple approach"""
        pass

    @abstractmethod
    def update_user_email(self, user_id: int, new_email: str) -> Optional[User]:
        """Update user's email address"""
        pass

    @abstractmethod
    def update_user_phone(self, user_id: int, phone_number: str) -> Optional[User]:
        """Update user's phone number"""
        pass

    @abstractmethod
    def update_username(self, user_id: int, new_username: str) -> Optional[User]:
        pass

    @abstractmethod
    def update_full_name(self, user_id: int, full_name: str) -> Optional[User]: 
        pass
    
    @abstractmethod
    def search_users(self, search_term: str, skip: int = 0, limit: int = 10) -> List[User]: 
        pass
    
    @abstractmethod
    def get_user_vote_statistics(self, user_id: int) -> dict:
        """Get total vote statistics for all user's posts"""
        pass

    @abstractmethod
    def get_user_posts_count(self, user_id: int) -> int:
        """Get total number of posts by user"""
        pass

    @abstractmethod 
    def get_most_popular_post(self, user_id: int) -> Optional[dict]:
        """Get the most popular post by vote count"""
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
class IFollowerRepository(ABC):
    @abstractmethod
    def follow_user(self, follower_id: int, following_id: int) -> Followers:
        """Create a follow relationship"""
        pass
    
    @abstractmethod
    def unfollow_user(self, follower_id: int, following_id: int) -> bool:
        """Remove a follow relationship"""
        pass
    
    @abstractmethod
    def is_following(self, follower_id: int, following_id: int) -> bool:
        """Check if user A follows user B"""
        pass
    
    @abstractmethod
    def get_followers(self, user_id: int, skip: int = 0, limit: int = 100) -> List[User]:
        """Get list of users who follow this user"""
        pass
    
    @abstractmethod
    def get_following(self, user_id: int, skip: int = 0, limit: int = 100) -> List[User]:
        """Get list of users this user is following"""
        pass
    
    @abstractmethod
    def get_follower_count(self, user_id: int) -> int:
        """Get total number of followers"""
        pass
    
    @abstractmethod
    def get_following_count(self, user_id: int) -> int:
        """Get total number of users being followed"""
        pass
    
    @abstractmethod
    def get_user_stats(self, user_id: int) -> Dict:
        """Get follower and following counts for a user"""
        pass
    
    @abstractmethod
    def get_mutual_follows(self, user_id: int) -> List[User]:
        """Get users who follow each other mutually"""
        pass
    
    # @abstractmethod
    # def get_follow_suggestions(self, user_id: int, limit: int = 10) -> List[User]:
    #     """Get suggested users to follow"""
    #     pass