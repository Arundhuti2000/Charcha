from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, case
from .base_repository import BaseRepository
from ..interfaces.interfaces import IPostRepository
from ...models import Post, Votes, User

class PostRepository(BaseRepository[Post], IPostRepository):
    def __init__(self, db: Session):
        super().__init__(db, Post)
        
    def get_posts_with_votes(self, current_user_id:int,skip: int = 0, limit: int = 10, search: str = "") -> List[Tuple]: #get_all_posts
        post = self.db.query(
                Post, 
                func.count(Votes.post_id).label("Votes"),
                func.count(case((Votes.dir == 1, 1))).label("Upvotes"),
                func.count(case((Votes.dir == -1, 1))).label("Downvotes"),
                case((func.max(case((Votes.user_id == current_user_id, Votes.dir))).in_([1, -1]), True), else_=False).label("has_liked")                                                                                                                                                                                                                                                                                                                                                    
            ).join(Votes, Votes.post_id == Post.id, isouter=True).group_by(Post.id).order_by(desc(Post.created_at)).filter(Post.title.contains(search)).limit(limit).offset(skip).all()
        return post
    def get_user_posts_with_votes(self, user_id, skip = 0, limit = 10): #get_own_posts
        post=self.db.query(
                Post,
                func.count(Votes.post_id).label("Votes"),
                func.count(case((Votes.dir == 1, 1))).label("Upvotes"),
                func.count(case((Votes.dir == -1, 1))).label("Downvotes"),
                case((func.max(case((Votes.user_id == user_id, Votes.dir))).in_([1, -1]), True), else_=False).label("has_liked")
            ).join(Votes, Votes.post_id == Post.id, isouter=True).group_by(Post.id).filter(Post.user_id == user_id).limit(limit).offset(skip).all()
        return post
    def get_post_with_votes_by_id(self, post_id: int,current_user_id: int)-> Optional[Tuple]: #get_post()
        print(post_id)
        post=self.db.query(
            Post, 
            func.count(Votes.post_id).label("Votes"),
            func.count(case((Votes.dir == 1, 1))).label("Upvotes"),
            func.count(case((Votes.dir == -1, 1))).label("Downvotes"),
            case((func.max(case((Votes.user_id == current_user_id, Votes.dir))).in_([1, -1]), True), else_=False).label("has_liked")
            ).outerjoin(Votes,Votes.post_id==Post.id).filter(Post.id==post_id).group_by(Post.id).first()
        return post
    def get_posts_by_user_id(self, user_id: int) -> List[Post]:
        return self.db.query(Post).filter(Post.user_id == user_id).all()
    
    def create_user_post(self, user_id: int, **post_data) -> Post: #create_posts()
        post_data['user_id'] = user_id
        return self.create(**post_data)
    
    def update_user_post(self, post_id: int, user_id: int, **update_data) -> Optional[Post]:
        post = self.get_by_id(post_id)
        if post and post.user_id == user_id:
            return self.update(post_id, **update_data)
        return None
    
    def delete_user_post(self, post_id: int, user_id: int) -> bool:
        post = self.get_by_id(post_id)
        if post and post.user_id == user_id:
            return self.delete(post_id)
        return False
    
    def search_posts(self, search_term: str, skip: int = 0, limit: int = 10) -> List[Post]:
        post=self.db.query(Post).filter(
                Post.title.contains(search_term) | 
                Post.content.contains(search_term)
            ).offset(skip).limit(limit).all()
        return post