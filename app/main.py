from fastapi import FastAPI
from . import models
from .database import engine
from .routes import post, user, auth, vote
from .config import settings

models.Base.metadata.create_all(bind=engine)
app = FastAPI()


#title: str, content: str, categpry:str, Bool published:bool = True
app.include_router(post.router)
app.include_router(user.router) # goes into user file and import all the router types
app.include_router(auth.router)
app.include_router(vote.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to my URL"}

# @app.get("/sqlalchemy")
# def test_Posts(db: Session = Depends(get_db)):
#     posts=db.query(models.Post).all()
#     return {"data":posts}



