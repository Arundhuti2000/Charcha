from .. import models, schemas, utils
from fastapi import FastAPI, HTTPException, Response, status, Depends, APIRouter
from sqlalchemy .orm import Session 
from ..database import get_db
from .. import models, schemas, oauth2

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.UserResponse)
def create_user(user: schemas.CreateUser,db: Session = Depends(get_db)):
    #hash a password - user.password
    hash_password=utils.hash(user.password)
    user.password = hash_password
    new_user=models.User(**user.dict()) #unpacking the post dict to match the Post model
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/{id}", response_model=schemas.UserResponse)
def get_user(id: int, db: Session = Depends(get_db)):
    user=db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"user with id {id} not found")
    return user
    # cursor.execute("""SELECT * FROM users WHERE id = %s""", (id,))
    # user = cursor.fetchone()
    # print(user)
    # # post=find_post(id)
@router.get("/", response_model=schemas.UserResponse)
def get_user(db: Session = Depends(get_db), get_current_user: int = Depends(oauth2.get_current_user)):
    user=db.query(models.User).filter(models.User.id == get_current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"user with id {get_current_user.user_id} not found")
    return user