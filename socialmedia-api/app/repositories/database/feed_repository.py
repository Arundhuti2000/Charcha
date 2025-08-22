from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_, or_, desc, text
from datetime import datetime, timedelta
from .post_repository import PostRepository
from ..interfaces.interfaces import IFeedRepository
from ...models import Post, Votes, User, Followers

class FeedRepository(IFeedRepository):
    def __init__(self, db: Session, post_repo: PostRepository):
        self.db = db
        self.post_repo = post_repo

    def get_following_feed(self, user_id: int, skip: int = 0, limit: int = 20) -> List[Tuple]:
        """Get posts from users that the current user follows"""
        following_subquery= self.db.query(Followers.following_id).filter(Followers.following_id ==user_id).subquery()
        posts = self.db.query(Post, func.count(Votes.post_id).label("Votes"), func.count(case((Votes.dir == 1, 1))).label("Upvotes"),func.count(case((Votes.dir == -1, 1))).label("Downvotes"),
                case((func.max(case((Votes.user_id == user_id, Votes.dir))).in_([1, -1]), True),else_=False).label("has_liked")
                ).join(
                    Votes, Votes.post_id == Post.id, isouter=True
                ).filter(
                     or_(
                        Post.user_id.in_(following_subquery),
                        Post.user_id == user_id  # Include own posts
                    )
                ).group_by(Post.id).order_by(
                    desc(Post.created_at)
                ).offset(skip).limit(limit).all()
        return posts
    
    def get_trending_feed(self, user_id: int, timeframe: str = "24h", skip: int = 0, limit: int = 20) -> List[Tuple]:
        """Get trending posts based on vote velocity and engagement"""
        timeframe_hours = {
            "1h": 1,
            "6h": 6, 
            "24h": 24,
            "7d": 168,
            "30d": 720
        }.get(timeframe, 24)
        cutoff_time = datetime.utcnow() - timedelta(hours=timeframe_hours)

        posts= self.db.query(
            Post,
            func.count(Votes.post_id).label("Votes"),
            func.count(case((Votes.dir == 1, 1))).label("Upvotes"),
            func.count(case((Votes.dir == -1, 1))).label("Downvotes"),
            case((func.max(case((Votes.user_id==user_id, Votes.dir))).in_([1,-1]), True), else_=False).label("has_liked"),
            ((func.count(case((Votes.dir == 1, 1))) - func.count(case((Votes.dir == -1, 1)))) /
                func.greatest(func.extract('epoch', func.now() - Post.created_at) / 3600.0,1.0  # Prevent division by zero
                )).label("trend_score"),
            # Calculate vote velocity: total_votes / hours_since_creation
            (func.count(Votes.post_id) /func.greatest(func.extract('epoch', func.now() - Post.created_at) / 3600.0,1.0)).label("vote_velocity")
        ).join(Votes, Votes.post_id == Post.id, isouter=True).filter(Post.created_at >= cutoff_time, Post.published == True).group_by(
            func.count(Votes.post_id) >= 2
        ).order_by(
            desc(text("trend_score"))  # Order by trend score
        ).offset(skip).limit(limit).all()
        return posts
    
    def get_recommended_feed(self, user_id: int, skip: int = 0, limit: int = 20) -> List[Tuple]:
        """Get recommended posts based on user behavior and preferences"""
        
        user_preferred_categories = self.db.query(
            Post.category,
            func.count(Votes.post_id).label("interaction_count")
        ).join(
            Votes, Votes.post_id == Post.id
        ).filter(
            Votes.user_id == user_id
        ).group_by(Post.category).order_by(
            desc("interaction_count")
        ).limit(3).subquery()
        
        has_voting_history = self.db.query(Votes).filter(Votes.user_id == user_id).first()
        
        if not has_voting_history:
            recommended_posts = self.db.query(
                Post,
                func.count(Votes.post_id).label("Votes"),
                func.count(case((Votes.dir == 1, 1))).label("Upvotes"),
                func.count(case((Votes.dir == -1, 1))).label("Downvotes"),
                case(
                    (func.max(case((Votes.user_id == user_id, Votes.dir))).in_([1, -1]), True),
                    else_=False
                ).label("has_liked")
            ).join(
                Votes, Votes.post_id == Post.id, isouter=True
            ).filter(
                Post.user_id != user_id,
                Post.published == True
            ).group_by(Post.id).order_by(
                desc(func.count(case((Votes.dir == 1, 1))))
            ).offset(skip).limit(limit).all()
        else:
            recommended_posts = self.db.query(
                Post,
                func.count(Votes.post_id).label("Votes"),
                func.count(case((Votes.dir == 1, 1))).label("Upvotes"),
                func.count(case((Votes.dir == -1, 1))).label("Downvotes"),
                case(
                    (func.max(case((Votes.user_id == user_id, Votes.dir))).in_([1, -1]), True),
                    else_=False
                ).label("has_liked")
            ).join(
                Votes, Votes.post_id == Post.id, isouter=True
            ).filter(
                Post.category.in_(
                    self.db.query(user_preferred_categories.c.category)
                ),
                Post.user_id != user_id, 
                ~Post.id.in_(
                    self.db.query(Votes.post_id).filter(Votes.user_id == user_id)
                ),
                Post.published == True
            ).group_by(Post.id).order_by(
                desc(func.count(case((Votes.dir == 1, 1))))  
            ).offset(skip).limit(limit).all()
        
        return recommended_posts

    def get_feed_by_type(self, user_id: int, feed_type: str, timeframe: str = "24h", 
                        skip: int = 0, limit: int = 20) -> List[Tuple]:
        """Get feed based on specified type"""
        if feed_type == "following":
            return self.get_following_feed(user_id, skip, limit)
        elif feed_type == "trending":
            return self.get_trending_feed(user_id, timeframe, skip, limit)
        else: 
            return self.post_repo.get_posts_with_votes(user_id, skip, limit)
