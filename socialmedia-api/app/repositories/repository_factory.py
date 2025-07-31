from sqlalchemy.orm import Session
from .database.post_repository import PostRepository
from .database.user_repository import UserRepository
from .database.vote_repository import VoteRepository


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

