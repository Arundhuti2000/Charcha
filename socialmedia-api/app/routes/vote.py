from fastapi import FastAPI, HTTPException, Response, status, Depends, APIRouter
from .. import schemas
from .. import database, models, oauth2
from sqlalchemy .orm import Session 
from ..database import get_db
from ..repositories.database.vote_repository import VoteRepository
from ..repositories.database.post_repository import PostRepository
from ..dependencies import get_vote_repository, get_post_repository

router = APIRouter(
    prefix="/vote",
    tags=["Vote"]
)

@router.post("/", status_code= status.HTTP_201_CREATED)
def vote(vote: schemas.Vote, vote_repo: VoteRepository = Depends(get_vote_repository), post_repo: PostRepository = Depends(get_post_repository), get_current_user: int = Depends(oauth2.get_current_user)):
    post = post_repo.get_by_id(vote.post_id)
    # post=db.query(models.Post).filter(models.Post.id==vote.post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with {vote.post_id} does not exist")
    existing_vote = vote_repo.get_user_vote_for_post(vote.post_id, get_current_user.id)
    # vote_query= db.query(models.Votes).filter(models.Votes.post_id== vote.post_id, models.Votes.user_id ==get_current_user.id)
    # found_vote=vote_query.first()
    if(vote.dir == 1 or vote.dir == -1):
        if existing_vote:
            if existing_vote.dir == vote.dir:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"User {get_current_user.id} has already voted on post with {vote.post_id}")
            vote_repo.update_vote_direction(vote.post_id, get_current_user.id, vote.dir)
            # found_vote.dir = vote.dir
            # db.commit()
            return {"message": "Successfully updated your vote"}
        else:
            vote_repo.create_vote(vote.post_id, get_current_user.id, vote.dir)
        # new_vote = models.Votes(post_id=vote.post_id, user_id=get_current_user.id, dir=vote.dir)
        # db.add(new_vote)
        # db.commit()
        return {"message": "Successfully added your vote"}
    elif vote.dir ==0 :
        if not existing_vote:
            raise HTTPException(statuscode=status.HTTP_404_NOT_FOUND)
        vote_repo.delete_user_vote(vote.post_id, get_current_user.id)
        # vote_query.delete(synchronize_session=False)
        # db.commit()
        return {"message":"Successfully deleted your vote"}

# @router.get("/post/{post_id}/stats")
# def get_post_vote_stats(
#     post_id: int,
#     vote_repo: VoteRepository = Depends(get_vote_repository),
#     post_repo: PostRepository = Depends(get_post_repository),
#     current_user: int = Depends(oauth2.get_current_user)
# ):
#     """NEW: Get vote statistics for a post"""
#     # Verify post exists
#     post = post_repo.get_by_id(post_id)
#     if not post:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, 
#             detail=f"Post with id {post_id} not found"
#         )
    
#     # Get vote statistics
#     vote_stats = vote_repo.get_post_vote_counts(post_id)
    
#     # Get current user's vote if any
#     user_vote = vote_repo.get_user_vote_for_post(post_id, current_user.id)
#     vote_stats['user_vote'] = user_vote.dir if user_vote else None
    
#     return vote_stats



#select posts.*, count(votes.post_id) as votes from posts left join votes on posts.id=votes.post_id group by posts.id

# SELECT 
#     posts.*, 
#     COUNT(votes.post_id) as total_votes,
#     COUNT(CASE WHEN votes.dir = 1 THEN 1 END) as upvotes,
#     COUNT(CASE WHEN votes.dir = -1 THEN 1 END) as downvotes
# FROM posts 
# LEFT JOIN votes ON posts.id = votes.post_id  
# GROUP BY posts.id