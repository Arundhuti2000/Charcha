from fastapi import FastAPI, HTTPException, Response, status, Depends, APIRouter
from .. import schemas
from .. import database, models, oauth2
from sqlalchemy .orm import Session 
from ..database import get_db


router = APIRouter(
    prefix="/vote",
    tags=["Vote"]
)

@router.post("/", status_code= status.HTTP_201_CREATED)
def vote(vote: schemas.Vote, db: Session = Depends(get_db), get_current_user: int = Depends(oauth2.get_current_user)):

    post=db.query(models.Post).filter(models.Post.id==vote.post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with {vote.post_id} does not exist")
    vote_query= db.query(models.Votes).filter(models.Votes.post_id== vote.post_id, models.Votes.user_id == models.Votes.user_id==get_current_user.id)
    found_vote=vote_query.first()
    if(vote.dir == 1 or vote.dir == -1):
        if found_vote:
            if found_vote.dir == vote.dir:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"User {get_current_user.id} has already voted on post with {vote.post_id}")
            found_vote.dir = vote.dir
            db.commit()
            return {"message": "Successfully updated your vote"}
        new_vote = models.Votes(post_id=vote.post_id, user_id=get_current_user.id, dir=vote.dir)
        db.add(new_vote)
        db.commit()
        return {"message": "Successfully added your vote"}
    elif vote.dir ==0 :
        if not found_vote:
            raise HTTPException(statuscode=status.HTTP_404_NOT_FOUND)
        vote_query.delete(synchronize_session=False)
        db.commit()
        return {"message":"Successfully deleted your vote"}
        