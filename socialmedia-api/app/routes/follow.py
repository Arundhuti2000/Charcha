from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import schemas, oauth2
from ..repositories.database.follower_repository import FollowerRepository
from ..repositories.database.user_repository import UserRepository
from ..dependencies import get_follower_repository, get_user_repository

router = APIRouter(
    prefix="/follow",
    tags=["Followers"]
)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.FollowActionResponse)
def follow_user(
    follow_request: schemas.FollowRequest,
    follower_repo: FollowerRepository = Depends(get_follower_repository),
    user_repo: UserRepository = Depends(get_user_repository),
    current_user: int = Depends(oauth2.get_current_user)
):
    target_user = user_repo.get_by_id(follow_request.following_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {follow_request.following_id} not found"
        )
    if current_user.id == follow_request.following_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot follow yourself"
        )
    try:
        #Create follow relationship
        follower_repo.follow_user(current_user.id, follow_request.following_id)
        user_stats = follower_repo.get_user_stats(current_user.id)
        
        return {
            "success": True,
            "message": f"Successfully followed {target_user.email}",
            "user_stats": user_stats
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
@router.delete("/{user_id}", response_model=schemas.FollowActionResponse)
def unfollow_user(
    user_id: int,
    follower_repo: FollowerRepository = Depends(get_follower_repository),
    user_repo: UserRepository = Depends(get_user_repository),
    current_user: int = Depends(oauth2.get_current_user)
):
    target_user = user_repo.get_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    if not follower_repo.is_following(current_user.id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not following this user"
        )
    success = follower_repo.unfollow_user(current_user.id, user_id)

    if success:
        user_stats = follower_repo.get_user_stats(current_user.id)
        
        return {
            "success": True,
            "message": f"Successfully unfollowed {target_user.email}",
            "user_stats": user_stats
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unfollow user"
        )

@router.get("/followers", response_model=schemas.FollowersList)
def get_my_followers(
    skip: int = 0,
    limit: int = 20,
    follower_repo: FollowerRepository = Depends(get_follower_repository),
    current_user: int = Depends(oauth2.get_current_user)
):
    followers_data = follower_repo.get_followers_with_pagination_info(
        current_user.id, skip, limit
    )
    return followers_data

@router.get("/following", response_model=schemas.FollowingList)
def get_my_following(
    skip: int = 0,
    limit: int = 20,
    follower_repo: FollowerRepository = Depends(get_follower_repository),
    current_user: int = Depends(oauth2.get_current_user)
):
    following_data = follower_repo.get_following_with_pagination_info(
        current_user.id, skip, limit
    )
    return following_data

@router.get("/mutual", response_model=List[schemas.UserResponse])
def get_mutual_follows(
    follower_repo: FollowerRepository = Depends(get_follower_repository),
    current_user: int = Depends(oauth2.get_current_user)
):
    mutual_users = follower_repo.get_mutual_follows(current_user.id)
    return mutual_users

#Get follow status between current user and target user
@router.get("/status/{user_id}", response_model=schemas.FollowStatus)
def get_follow_status(
    user_id: int,
    follower_repo: FollowerRepository = Depends(get_follower_repository),
    user_repo: UserRepository = Depends(get_user_repository),
    current_user: int = Depends(oauth2.get_current_user)
):
    target_user = user_repo.get_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    follow_status = follower_repo.get_user_follow_status(current_user.id, user_id)
    return follow_status

# Routes for getting other users' public follower information
@router.get("/users/{user_id}/followers", response_model=schemas.FollowersList)
def get_user_followers(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    follower_repo: FollowerRepository = Depends(get_follower_repository),
    user_repo: UserRepository = Depends(get_user_repository),
    current_user: int = Depends(oauth2.get_current_user)
):
    target_user = user_repo.get_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    followers_data = follower_repo.get_followers_with_pagination_info(
        user_id, skip, limit
    )
    return followers_data

@router.get("/users/{user_id}/following", response_model=schemas.FollowingList)
def get_user_following(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    follower_repo: FollowerRepository = Depends(get_follower_repository),
    user_repo: UserRepository = Depends(get_user_repository),
    current_user: int = Depends(oauth2.get_current_user)
):
    target_user = user_repo.get_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    following_data = follower_repo.get_following_with_pagination_info(
        user_id, skip, limit
    )
    return following_data
