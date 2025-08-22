from .. import models, schemas, oauth2
from fastapi import FastAPI, HTTPException, Response, status, Depends, APIRouter
from sqlalchemy.orm import Session 
from ..database import get_db
from sqlalchemy import func, case
from typing import List, Optional
from ..repositories.database.post_repository import PostRepository
from ..repositories.database.feed_repository import FeedRepository
from ..dependencies import get_post_repository, get_feed_repository

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)

@router.get("/", response_model=List[schemas.PostwithVote])
def get_all_posts(post_repo: PostRepository = Depends(get_post_repository),feed_repo: FeedRepository = Depends(get_feed_repository),get_current_user:int = Depends(oauth2.get_current_user), limit: int = 10, skip: int=0, search: Optional[str]= "", feed_type: str = "recommended"):
    if search:
        posts= post_repo.get_posts_with_votes(get_current_user.id,skip, limit, search)
    else:
        posts = feed_repo.get_feed_by_type(get_current_user.id, feed_type, skip=skip, limit=limit)
    # print("route")
    # print(posts)
    return posts
    # posts=db.query(models.Post).filter(models.Post.title.contains(search)).limit(limit).offset(skip).all()
    # posts = db.query(models.Post, func.count(models.Votes.post_id).label("Votes"),func.count(case((models.Votes.dir == 1, 1))).label("Upvotes"),
    #     func.count(case((models.Votes.dir == -1, 1))).label("Downvotes")).join(models.Votes, models.Votes.post_id == models.Post.id, isouter=True).group_by(models.Post.id).filter(models.Post.title.contains(search)).limit(limit).offset(skip).all()
    # cursor.execute("""SELECT * FROM posts""")
    # posts=cursor.fetchall()
@router.get("/profileposts", response_model=List[schemas.PostwithVote])
def get_own_posts(post_repo: PostRepository = Depends(get_post_repository),get_current_user:int = Depends(oauth2.get_current_user), limit: int = 10, skip: int=0, search: Optional[str]= ""):
    posts= post_repo.get_user_posts_with_votes(get_current_user.id,skip,limit)
    return posts
    # posts=db.query(models.Post,  func.count(models.Votes.post_id).label("Votes"),func.count(case((models.Votes.dir == 1, 1))).label("Upvotes"),
    #     func.count(case((models.Votes.dir == -1, 1))).label("Downvotes")).join(models.Votes, models.Votes.post_id == models.Post.id, isouter=True).group_by(models.Post.id).filter(models.Post.user_id== get_current_user.id).limit(limit).offset(skip).all()
    # print(limit)
    # print(posts)
    # cursor.execute("""SELECT * FROM posts""")
    # posts=cursor.fetchall()

@router.get("/{id}", response_model=schemas.PostwithVote)
def get_post(id:int, post_repo: PostRepository = Depends(get_post_repository), get_current_user:int = Depends(oauth2.get_current_user)):
    try:
        print(f"PostId:{id}")
        post = post_repo.get_post_with_votes_by_id(id,get_current_user.id)
        # post=db.query(models.Post,  func.count(models.Votes.post_id).label("Votes"),func.count(case((models.Votes.dir == 1, 1))).label("Upvotes"),
        # func.count(case((models.Votes.dir == -1, 1))).label("Downvotes")).outerjoin(models.Votes, models.Votes.post_id == models.Post.id).filter(models.Post.id==id).group_by(models.Post.id).first()
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
    print(post)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
    # if post.user_id!=get_current_user.id:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return post
    # cursor.execute("""SELECT * FROM posts WHERE id = %s""", (id,))
    # post = cursor.fetchone()
    # print(post)
    # # post=find_post(id)


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.PostResponse)
def create_posts(post: schemas.CreatePost,post_repo: PostRepository = Depends(get_post_repository), get_current_user:int = Depends(oauth2.get_current_user)):
    new_post = post_repo.create_user_post(get_current_user.id, **post.dict())
    print(get_current_user.id)
    # new_post=models.Post(user_id=get_current_user.id, **post.dict()) #unpacking the post dict to match the Post model
    # db.add(new_post)
    # db.commit()
    # db.refresh(new_post)
    return new_post
    # cursor.execute("""INSERT INTO POSTS (title, content, published, category, rating) VALUES (%s,%s, %s, %s, %s) RETURNING *""", (post.title,post.content, post.published, post.category, post.rating))
    # new_post= cursor.fetchone()
    # conn.commit()
    # return {"message": "Succesfully created a post", "title": new_post['title'], "id": new_post['id']}


@router.delete("/{id}")
def delete_post(id:int, post_repo: PostRepository = Depends(get_post_repository),  get_current_user:int = Depends(oauth2.get_current_user)):
    post= post_repo.get_post_with_votes_by_id(id)
    if post == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
    success = post_repo.delete_user_post(id, get_current_user.id)
    # post_query=db.query(models.Post).filter(models.Post.id == id)
    # post = post_query.first()
    if success == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {id} not found or not authorized")
    # if post.user_id != get_current_user.id:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform this action")
    # post_query.delete(synchronize_session=False) #chooses the strategy to update the attributes on objects in the session. See the section orm_expression_update_delete for a discussion of these strategies.
    # db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
    # cursor.execute("""DELETE FROM posts WHERE id = %s RETURNING *""", (id,))
    # deleted_post = cursor.fetchone()
    # conn.commit()


@router.put("/{id}", status_code=status.HTTP_202_ACCEPTED, response_model=schemas.PostResponse)
def update_post(id: int, updated_post: schemas.UpdatePost, post_repo: PostRepository = Depends(get_post_repository), get_current_user:int = Depends(oauth2.get_current_user)):
    post= post_repo.get_post_with_votes_by_id(id)
    if post == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
    post=post_repo.update_user_post(id,get_current_user.id,**updated_post.dict())
    # post_query=db.query(models.Post).filter(models.Post.id == id)
    # post= post_query.first()
    # if post.user_id != get_current_user.id:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform this action")
    # post_query.update(updated_post.dict(), synchronize_session=False)
    # db.commit()
    return post
    # cursor.execute("""UPDATE posts SET title = %s, content = %s, published = %s, category = %s, rating = %s WHERE id = %s RETURNING *""", (post.title, post.content, post.published, post.category, post.rating, id))
    # updated_post = cursor.fetchone()
    # conn.commit()