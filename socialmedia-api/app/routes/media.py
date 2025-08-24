from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import schemas, oauth2
from ..database import get_db
from ..repositories.database.post_image_repository import PostImageRepository
from ..repositories.database.post_repository import PostRepository
from ..azure_storage_service import azure_storage
from ..dependencies import get_post_repository, get_post_image_repository


router = APIRouter(
    prefix="/media",
    tags=["Media"]
)

@router.post("/upload/{post_id}", response_model=schemas.ImageUploadResponse)
async def upload_post_images(
    post_id: int,
    files: List[UploadFile] = File(...),
    post_repo: PostRepository = Depends(get_post_repository),
    image_repo: PostImageRepository = Depends(get_post_image_repository),
    current_user = Depends(oauth2.get_current_user)
):
    """Upload images for an existing post"""
    post = post_repo.get_post_with_votes_by_id(post_id, current_user.id)
    if not post or post.Post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or not authorized"
        )
    existing_count = image_repo.get_post_image_count(post_id)
    if existing_count + len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot add {len(files)} images. Maximum 10 images per post. Current count: {existing_count}"
        )
    try:
        upload_results = await azure_storage.upload_multiple_images(files, current_user.id)
        created_images = image_repo.bulk_create_post_images(post_id, upload_results, files, existing_count)
        return {
            "success": True,
            "message": f"Successfully uploaded {len(created_images)} images",
            "images": created_images
        }
    except Exception as e:
        for blob_name, _ in upload_results:
            azure_storage.delete_blob(blob_name)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload images"
        )

@router.delete("/images/{image_id}")
async def delete_post_image(
    image_id: int,
    image_repo: PostImageRepository = Depends(get_post_image_repository),
    current_user = Depends(oauth2.get_current_user)
):
    """Delete a specific post image"""
    deleted_image = image_repo.delete_post_image_by_user(image_id, current_user.id)
    
    if not deleted_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found or not authorized"
        )

    azure_storage.delete_blob(deleted_image.blob_name)
    
    return {"success": True, "message": "Image deleted successfully"}

@router.put("/images/{image_id}/primary")
async def set_primary_image(
    image_id: int,
    post_id: int,
    image_repo: PostImageRepository = Depends(get_post_image_repository),
    current_user = Depends(oauth2.get_current_user)
):
    """Set an image as the primary image for a post"""
    success = image_repo.set_primary_image_by_user(post_id, image_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image or post not found, or not authorized"
        )
    
    return {"success": True, "message": "Primary image updated successfully"}

@router.put("/posts/{post_id}/images/reorder")
async def reorder_post_images(
    post_id: int,
    reorder_request: schemas.BulkImageUpdate,
    image_repo: PostImageRepository = Depends(get_post_image_repository),
    post_repo: PostRepository = Depends(get_post_repository),
    current_user = Depends(oauth2.get_current_user)
):
    """Reorder images for a post"""
    post_tuple = post_repo.get_post_with_votes_by_id(post_id, current_user.id)
    if not post_tuple or post_tuple.Post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or not authorized"
        )
    
    success = image_repo.reorder_post_images_by_user(
        post_id, 
        reorder_request.image_updates, 
        current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to reorder images. Ensure exactly one primary image is specified."
        )
    
    return {"success": True, "message": "Images reordered successfully"}

@router.get("/images/{image_id}/url")
async def get_image_url(
    image_id: int,
    expires_in_hours: int = 24,
    image_repo: PostImageRepository = Depends(get_post_image_repository),
    current_user = Depends(oauth2.get_current_user)
):
    """Get a temporary signed URL for an image"""
    image = image_repo.get_by_id(image_id)
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    sas_url = azure_storage.generate_sas_url(image.blob_name, expires_in_hours)
    
    return {
        "image_id": image_id,
        "sas_url": sas_url,
        "expires_in_hours": expires_in_hours,
        "original_filename": image.original_filename
    }

@router.get("/images/{image_id}/redirect")
async def redirect_to_image(
    image_id: int,
    image_repo: PostImageRepository = Depends(get_post_image_repository)
):
    """Redirect to the image with a temporary signed URL (useful for direct image access)"""
    image = image_repo.get_by_id(image_id)
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    sas_url = azure_storage.generate_sas_url(image.blob_name, expires_in_hours=1)
    return RedirectResponse(url=sas_url, status_code=307)

@router.delete("/posts/{post_id}/images")
async def delete_all_post_images(
    post_id: int,
    post_repo: PostRepository = Depends(get_post_repository),
    image_repo: PostImageRepository = Depends(get_post_image_repository),
    current_user = Depends(oauth2.get_current_user)
):
    """Delete all images for a specific post"""
    post_tuple = post_repo.get_post_with_votes_by_id(post_id, current_user.id)
    if not post_tuple or post_tuple.Post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or not authorized"
        )

    images = image_repo.get_post_images(post_id)
    
    if not images:
        return {"success": True, "message": "No images to delete"}
    
    for image in images:
        azure_storage.delete_blob(image.blob_name)
    
    deleted_count = image_repo.delete_all_post_images(post_id)
    
    return {
        "success": True, 
        "message": f"Successfully deleted {deleted_count} images",
        "deleted_count": deleted_count
    }
