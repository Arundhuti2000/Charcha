from fastapi import APIRouter, Depends, status, HTTPException, Response
from fastapi.security.oauth2 import OAuth2,OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, schemas, models,utils, oauth2
from ..repositories.database.user_repository import UserRepository
from ..dependencies import get_user_repository

router= APIRouter(tags=['Authentication'])

@router.post('/login',response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm=Depends(), user_repo: UserRepository = Depends(get_user_repository)):

    #the OAuthPasswordReuestForm returns username and password and not email and password
    user=user_repo.get_by_email(user_credentials.username)
    if not user:
        user = user_repo.get_by_username(user_credentials.username)
    # user=db.query(models.User).filter(models.User.email==user_credentials.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Invalid Credentials")
    if not utils.verify(user_credentials.password, user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Invalid Credentials")
    print(user.id)
    #create a token
    access_token = oauth2.create_access_token(data={"user_id":user.id})
    #return a token
    return {"access_token": access_token,"token_type": "bearer"}

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=schemas.UserResponse)
def create_user(user: schemas.CreateUser,user_repo: UserRepository = Depends(get_user_repository)):
    #hash a password - user.password
    if user_repo.email_exists(user.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )
    if user.username and user_repo.username_exists(user.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken"
        )
    hash_password=utils.hash(user.password)
    # user.password = hash_password
    new_user=user_repo.create_with_hashed_password(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hash_password,
        phone_number=user.phone_number
    )
    # new_user=models.User(**user.dict()) #unpacking the post dict to match the Post model
    # db.add(new_user)
    # db.commit()
    # db.refresh(new_user)
    return new_user