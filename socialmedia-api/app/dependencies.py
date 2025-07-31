from fastapi import Depends
from sqlalchemy.orm import Session
from .database import get_db
from .repositories.repository_factory import RepositoryFactory
from .repositories.database.post_repository import PostRepository
from .repositories.database.user_repository import UserRepository
from .repositories.database.vote_repository import VoteRepository

# Repository Dependencies
def get_post_repository(db: Session = Depends(get_db)) -> PostRepository:
    return RepositoryFactory.create_post_repository(db)

def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return RepositoryFactory.create_user_repository(db)

def get_vote_repository(db: Session = Depends(get_db)) -> VoteRepository:
    return RepositoryFactory.create_vote_repository(db)