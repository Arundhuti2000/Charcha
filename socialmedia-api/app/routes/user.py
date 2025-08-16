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


@router.put("/email", response_model=schemas.UserResponse)
def update_user_email(
    email_request: schemas.UpdateEmailRequest,
    user_repo: UserRepository = Depends(get_user_repository),
    current_user: int = Depends(oauth2.get_current_user)
):
    """Update current user's email"""
    updated_user = user_repo.update_user_email(current_user.id, email_request.new_email)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already exists or user not found"
        )
    return updated_user

@router.put("/phone", response_model=schemas.UserResponse)
def update_user_phone(
    phone_request: schemas.UpdatePhoneRequest,
    user_repo: UserRepository = Depends(get_user_repository),
    current_user: int = Depends(oauth2.get_current_user)
):
    """Update current user's phone number"""
    updated_user = user_repo.update_user_phone(current_user.id, phone_request.phone_number)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user

@router.get("/", response_model=schemas.CurrentUserProfile)
def get_current_user_profile(
    user_repo: UserRepository = Depends(get_user_repository), 
    current_user: int = Depends(oauth2.get_current_user)
):
    """Get comprehensive profile for the current authenticated user"""
    profile = user_repo.get_comprehensive_profile(current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Profile not found"
        )
    return profile

@router.get("/{id}", response_model=schemas.CurrentUserProfile)
def get_user(
    id: int,
    user_repo: UserRepository = Depends(get_user_repository), 
    current_user: int = Depends(oauth2.get_current_user)
):
    """Get profile for any user (with relationship status if viewing another user)"""
    profile = user_repo.get_comprehensive_profile(id, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"User with id {id} not found"
        )
    return profile