from sqlalchemy.orm import Session
from .database.post_repository import PostRepository
from .database.user_repository import UserRepository
from .database.vote_repository import VoteRepository
from .database.follower_repository import FollowerRepository
from .database.feed_repository import FeedRepository

class RepositoryFactory:
    @staticmethod
    def create_post_repository(db: Session) -> PostRepository:
        return PostRepository(db)
    
    @staticmethod
    def create_user_repository(db: Session) -> UserRepository:
        return UserRepository(db)
    
    @staticmethod
    def create_vote_repository(db: Session) -> VoteRepository:
        return VoteRepository(db)

    @staticmethod
    def create_follower_repository(db:Session) -> FollowerRepository:
        return FollowerRepository(db)
    
    @staticmethod
    def create_feed_repository(db: Session) -> FeedRepository:
        post_repo = PostRepository(db)
        return FeedRepository(db, post_repo)
