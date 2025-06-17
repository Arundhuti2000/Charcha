from typing import Optional
from fastapi import FastAPI
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


@app.get("/")
def read_root():
    return {"message": "Welcome to my URL"}

@app.get("/posts")
def get_posts():
    return {"data": "This is a post"}


@app.post("/createposts")
def create_posts(new_post: Post):
    print(new_post)
    return {"data": f"Post created with title: {new_post.title}"}


