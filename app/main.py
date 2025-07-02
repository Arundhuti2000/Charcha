from app.Post import Post
from fastapi import FastAPI, HTTPException, Response, status
from fastapi.params import Body
import psycopg2
import time
from psycopg2.extras import RealDictCursor

app = FastAPI()

#title: str, content: str, categpry:str, Bool published:bool = True
while True:
    try:
        conn = psycopg2.connect(host='localhost', database='fastapi', user='postgres', password='admin', cursor_factory=RealDictCursor)
        cursor= conn.cursor()
        print("Database connection was successful")
        break
    except Exception as error:
        print("Connection to database failed")
        print("Error: ", error)
        time.sleep(2)

my_post=[{"title": "title of post 1", "content": "content of post 1", "id":1}, {"title":"title of post 2", "content":"content of post 2", "id":2}]

def find_post(id):
    for p in my_post:
        if p['id'] == id:
            return p
    return "Post not found"

def find_index(id):
    for i, p in enumerate(my_post):
        if p['id']== id:
            return i
    return "Post not found"

@app.get("/")
def read_root():
    return {"message": "Welcome to my URL"}

@app.get("/posts")
def get_posts():
    cursor.execute("""SELECT * FROM posts""")
    posts=cursor.fetchall()
    print(posts)
    return {"data": posts}


@app.post("/posts", status_code=status.HTTP_201_CREATED)
def create_posts(post: Post):
    cursor.execute("""INSERT INTO POSTS (title, content, published, category, rating) VALUES (%s,%s, %s, %s, %s) RETURNING *""", (post.title,post.content, post.published, post.category, post.rating))
    new_post= cursor.fetchone()
    conn.commit()
    return {"message": "Succesfully created a post", "title": new_post['title'], "id": new_post['id']}


@app.get("/posts/latest")
def get_latest_post():
    if len(my_post) == 0:
        return {"error": "No posts available"}
    latest_post = my_post[-1]
    return {"latest_post": latest_post}

@app.get("/posts/{id}")
def get_post(id:int):
    cursor.execute("""SELECT * FROM posts WHERE id = %s""", (id,))
    post = cursor.fetchone()
    print(post)
    # post=find_post(id)
    if post == "Post not found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
        # response.status_code = status.HTTP_404_NOT_FOUND
        # return {"error": post}
    return {"post_detail": f"Here is the post with id {id}, my post is {post['title']} and content is {post['content']}"}

@app.delete("/posts/{id}")
def delete_post(id:int):
    cursor.execute("""DELETE FROM posts WHERE id = %s RETURNING *""", (id,))
    deleted_post = cursor.fetchone()
    conn.commit()
    if deleted_post == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.put("/posts/{id}", status_code=status.HTTP_202_ACCEPTED)
def update_post(id: int, post: Post):
    cursor.execute("""UPDATE posts SET title = %s, content = %s, published = %s, category = %s, rating = %s WHERE id = %s RETURNING *""", (post.title, post.content, post.published, post.category, post.rating, id))
    updated_post = cursor.fetchone()
    conn.commit()
    if updated_post == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
    
    return {"message": "Post Updated Successfully", "post": updated_post}

