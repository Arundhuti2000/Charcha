from .. import models, schemas, utils
from fastapi import FastAPI, HTTPException, Response, status, Depends, APIRouter
from sqlalchemy .orm import Session 
from ..database import get_db
from .. import models, schemas, oauth2
from ..repositories.database.user_repository import UserRepository
from ..dependencies import get_user_repository

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/{id}", response_model=schemas.UserResponse)
def get_user(id: int,user_repo: UserRepository = Depends(get_user_repository)):
    # user=db.query(models.User).filter(models.User.id == id).first()
    user=user_repo.get_by_id(id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"user with id {id} not found")
    return user
    # cursor.execute("""SELECT * FROM users WHERE id = %s""", (id,))
    # user = cursor.fetchone()
    # print(user)
    # # post=find_post(id)
@router.get("/", response_model=schemas.UserResponse)
def get_current_user_profile(user_repo: UserRepository = Depends(get_user_repository), get_current_user: int = Depends(oauth2.get_current_user)):
    user = user_repo.get_by_id(get_current_user.id)
    # user=db.query(models.User).filter(models.User.id == get_current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"user with id {get_current_user.user_id} not found")
    return user