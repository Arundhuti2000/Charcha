from fastapi import FastAPI, HTTPException, Response, status, Depends
from fastapi.params import Body
import psycopg2
import time
from typing import Optional, List
from psycopg2.extras import RealDictCursor
from . import models, schemas, utils
from sqlalchemy .orm import Session 
from .database import engine, get_db
from .routes import post, user

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


app.include_router(post.router)
app.include_router(user.router) # go into user file and import all the router types

@app.get("/")
def read_root():
    return {"message": "Welcome to my URL"}

# @app.get("/sqlalchemy")
# def test_Posts(db: Session = Depends(get_db)):
#     posts=db.query(models.Post).all()
#     return {"data":posts}



