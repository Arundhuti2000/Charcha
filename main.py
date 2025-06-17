from typing import Optional
from fastapi import FastAPI, HTTPException, Response, status
from fastapi.params import Body
from pydantic import BaseModel


app = FastAPI()

#title: str, content: str, categpry:str, Bool published:bool = True

class Post(BaseModel):
    title: str
    content: str
    category: str
    published: bool = True
    rating: Optional[int] = None


my_post=[{"title": "title of post 1", "content": "content of post 1", "id":1}, {"title":"title of post 2", "content":"content of post 2", "id":2}]

def find_post(id):
    for p in my_post:
        if p['id'] == id:
            return p
    return "Post not found"


@app.get("/")
def read_root():
    return {"message": "Welcome to my URL"}

@app.get("/posts")
def get_posts():
    return {"data": my_post}


@app.post("/posts", status_code=status.HTTP_201_CREATED)
def create_posts(post: Post):
    post_dict=post.dict()
    las_post_id=len(my_post) 
    las_post_id += 1
    post_dict['id']=  + las_post_id
    my_post.append(post_dict)
    
    return {"message": "Succesfully created a post", "title": post_dict['title'], "id": post_dict['id']}


@app.get("/posts/latest")
def get_latest_post():
    if len(my_post) == 0:
        return {"error": "No posts available"}
    latest_post = my_post[-1]
    return {"latest_post": latest_post}

@app.get("/posts/{id}")
def get_post(id:int, response:  Response):
    post=find_post(id)
    if post == "Post not found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
        # response.status_code = status.HTTP_404_NOT_FOUND
        # return {"error": post}
    return {"post_detail": f"Here is the post with id {id}, my post is {post['title']} and content is {post['content']}"}

