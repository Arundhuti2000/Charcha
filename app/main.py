from fastapi import FastAPI, HTTPException, Response, status, Depends
from fastapi.params import Body
import psycopg2
import time
from typing import Optional, List
from psycopg2.extras import RealDictCursor
from . import models, schemas
from sqlalchemy .orm import Session 
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI()




#title: str, content: str, categpry:str, Bool published:bool = True
while True:
    try:
        conn = psycopg2.connect(host='localhost', database='fastapi', user='postgres', password='admin', cursor_factory=RealDictCursor) #
        cursor= conn.cursor()
        print("Database connection was successful")
        break
    except Exception as error:
        print("Connection to database failed")
        print("Error: ", error)
        time.sleep(2)



@app.get("/")
def read_root():
    return {"message": "Welcome to my URL"}

# @app.get("/sqlalchemy")
# def test_Posts(db: Session = Depends(get_db)):
#     posts=db.query(models.Post).all()
#     return {"data":posts}

@app.get("/posts", response_model=List[schemas.PostResponse])
def get_posts(db: Session = Depends(get_db)):
    posts=db.query(models.Post).all()
    print(posts)
    return posts
    # cursor.execute("""SELECT * FROM posts""")
    # posts=cursor.fetchall()


@app.post("/posts", status_code=status.HTTP_201_CREATED, response_model=schemas.PostResponse)
def create_posts(post: schemas.CreatePost,db: Session = Depends(get_db)):
    new_post=models.Post(**post.dict()) #unpacking the post dict to match the Post model
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post
    # cursor.execute("""INSERT INTO POSTS (title, content, published, category, rating) VALUES (%s,%s, %s, %s, %s) RETURNING *""", (post.title,post.content, post.published, post.category, post.rating))
    # new_post= cursor.fetchone()
    # conn.commit()
    # return {"message": "Succesfully created a post", "title": new_post['title'], "id": new_post['id']}
    

# @app.get("/posts/latest")
# def get_latest_post():
#     if len(my_post) == 0:
#         return {"error": "No posts available"}
#     latest_post = my_post[-1]
#     return {"latest_post": latest_post}

@app.get("/posts/{id}", response_model=schemas.PostResponse)
def get_post(id:int, db: Session = Depends(get_db)):
    post=db.query(models.Post).filter(models.Post.id == id).first()
    print(post)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
    return {"post_detail": f"Here is the post with id {post.id}, Post Title: {post.title} and content is {post.content}"}
    # cursor.execute("""SELECT * FROM posts WHERE id = %s""", (id,))
    # post = cursor.fetchone()
    # print(post)
    # # post=find_post(id)
    

@app.delete("/posts/{id}")
def delete_post(id:int, db: Session = Depends(get_db)):
    post=db.query(models.Post).filter(models.Post.id == id)
    if post.first() == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
    post.delete(synchronize_session=False) #chooses the strategy to update the attributes on objects in the session. See the section orm_expression_update_delete for a discussion of these strategies.
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
    # cursor.execute("""DELETE FROM posts WHERE id = %s RETURNING *""", (id,))
    # deleted_post = cursor.fetchone()
    # conn.commit()


@app.put("/posts/{id}", status_code=status.HTTP_202_ACCEPTED, response_model=schemas.PostResponse)
def update_post(id: int, updated_post: schemas.UpdatePost, db: Session = Depends(get_db)):
    post_query=db.query(models.Post).filter(models.Post.id == id)
    post= post_query.first()
    if post == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
    post_query.update(updated_post.dict(), synchronize_session=False)
    db.commit()
    return {"message": "Post Updated Successfully", "post": post_query.first()}
    # cursor.execute("""UPDATE posts SET title = %s, content = %s, published = %s, category = %s, rating = %s WHERE id = %s RETURNING *""", (post.title, post.content, post.published, post.category, post.rating, id))
    # updated_post = cursor.fetchone()
    # conn.commit()


@app.post("/users", status_code=status.HTTP_201_CREATED, response_model=schemas.UserResponse)
def create_user(user: schemas.CreateUser,db: Session = Depends(get_db)):
    new_user=models.User(**user.dict()) #unpacking the post dict to match the Post model
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user