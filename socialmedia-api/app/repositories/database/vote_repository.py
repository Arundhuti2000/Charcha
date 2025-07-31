from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from ..interfaces.interfaces import IVoteRepository
from ...models import Votes, Post

class VoteRepository(IVoteRepository):
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_vote_for_post(self, post_id: int, user_id: int) -> Optional[Votes]: #get vote in vote()
        vote= self.db.query(Votes).filter(Votes.post_id == post_id, Votes.user_id == user_id).first()
        return vote
    
    def create_vote(self, post_id: int, user_id: int, direction: int) -> Votes: #create vote in vote()
        new_vote = Votes(post_id=post_id, user_id=user_id, dir=direction)
        self.db.add(new_vote)
        self.db.commit()
        self.db.refresh(new_vote)
        return new_vote
    
    def update_vote_direction(self, post_id: int, user_id: int, direction: int) -> Optional[Votes]: #update vote in vote()
        vote = self.get_user_vote_for_post(post_id, user_id)
        if vote:
            vote.dir = direction
            self.db.commit()
            self.db.refresh(vote)
            return vote
        return None
    
    def delete_user_vote(self, post_id: int, user_id: int) -> bool: #delete vote in vote()
        vote_query = self.db.query(Votes).filter(
            Votes.post_id == post_id, 
            Votes.user_id == user_id
        )
        vote = vote_query.first()
        if vote:
            vote_query.delete(synchronize_session=False)
            self.db.commit()
            return True
        return False
    
    def get_post_vote_counts(self, post_id: int) -> dict:
        result = (
            self.db.query(
                func.count(Votes.post_id).label("total_votes"),
                func.count(case((Votes.dir == 1, 1))).label("upvotes"),
                func.count(case((Votes.dir == -1, 1))).label("downvotes")
            )
            .filter(Votes.post_id == post_id)
            .first()
        )
        
        return {
            "total_votes": result.total_votes or 0,
            "upvotes": result.upvotes or 0,
            "downvotes": result.downvotes or 0,
            "score": (result.upvotes or 0) - (result.downvotes or 0)
        }
    
    def get_user_votes_for_posts(self, user_id: int, post_ids: list) -> dict:
        """Get user's votes for multiple posts"""
        votes = (
            self.db.query(Votes)
            .filter(Votes.user_id == user_id, Votes.post_id.in_(post_ids))
            .all()
        )
        return {vote.post_id: vote.dir for vote in votes}
    
    def has_user_voted(self, post_id: int, user_id: int) -> bool:
        return self.get_user_vote_for_post(post_id, user_id) is not None