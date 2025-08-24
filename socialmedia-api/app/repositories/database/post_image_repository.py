from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from .base_repository import BaseRepository
from ...models import PostImage, Post

class PostImageRepository(BaseRepository[PostImage]):
    def __init__(self, db:Session):
        super().__init__(db, PostImage)
    
    def create_post_image(self, post_id: int, blob_name: str, blob_url: str, 
                         original_filename: str, content_type: str, 
                         file_size: Optional[int] = None, 
                         display_order: int = 0, is_primary: bool = False) -> PostImage:
        """Create a new post image record"""
        return self.create(
            post_id=post_id,
            blob_name=blob_name,
            blob_url=blob_url,
            original_filename=original_filename,
            content_type=content_type,
            file_size=file_size,
            display_order=display_order,
            is_primary=is_primary
        )
    
    def get_post_images(self, post_id: int) -> List[PostImage]:
        """Get all images for a post, ordered by display_order"""
        return self.db.query(PostImage).filter(
            PostImage.post_id == post_id
        ).order_by(PostImage.display_order, PostImage.created_at).all()
    
    def get_primary_image(self, post_id: int) -> Optional[PostImage]:
        """Get the primary image for a post"""
        return self.db.query(PostImage).filter(
            and_(PostImage.post_id == post_id, PostImage.is_primary == True)
        ).first()
    
    def set_primary_image(self, post_id: int, image_id: int, user_id: int) -> bool:
        """Set an image as primary for a post"""
        post = self.db.query(Post).filter(
            and_(Post.id == post_id, Post.user_id == user_id)
        ).first()
        
        if not post:
            return False
        
        self.db.query(PostImage).filter(
            PostImage.post_id == post_id
        ).update({PostImage.is_primary: False})

        result = self.db.query(PostImage).filter(
            and_(PostImage.id == image_id, PostImage.post_id == post_id)
        ).update({PostImage.is_primary: True})

        if result:
            self.db.commit()
            return True
        
        self.db.rollback()
        return False
    
    def update_image_order(self, post_id: int, image_id: int, new_order: int, user_id: int) -> bool:
        """Update the display order of an image"""
        post = self.db.query(Post).filter(
            and_(Post.id == post_id, Post.user_id == user_id)
        ).first()
        
        if not post:
            return False
        
        result = self.db.query(PostImage).filter(
            and_(PostImage.id == image_id, PostImage.post_id == post_id)
        ).update({PostImage.display_order: new_order})
        
        if result:
            self.db.commit()
            return True
        
        return False
    
    def delete_post_image(self, image_id: int, user_id: int) -> Optional[PostImage]:
        """Delete a post image (returns the deleted image for cleanup)"""
        image = self.db.query(PostImage).join(Post).filter(
            and_(PostImage.id == image_id, Post.user_id == user_id)
        ).first()
        
        if image:
            self.db.delete(image)
            self.db.commit()
            return image
        
        return None
    
    def bulk_create_post_images(self, post_id: int, image_data: List[Tuple[str, str, str, str, Optional[int]]]) -> List[PostImage]:
        """Bulk create multiple images for a post"""
        images = []
        for i, (blob_name, blob_url, original_filename, content_type, file_size) in enumerate(image_data):
            image = PostImage(
                post_id=post_id,
                blob_name=blob_name,
                blob_url=blob_url,
                original_filename=original_filename,
                content_type=content_type,
                file_size=file_size,
                display_order=i,
                is_primary=(i == 0)
            )
            images.append(image)
        
        self.db.add_all(images)
        self.db.commit()
        
        for image in images:
            self.db.refresh(image)
        
        return images
    
    def get_images_by_blob_names(self, blob_names: List[str]) -> List[PostImage]:
        """Get images by their blob names (for cleanup operations)"""
        return self.db.query(PostImage).filter(
            PostImage.blob_name.in_(blob_names)
        ).all()
    
    def get_post_image_count(self, post_id: int) -> int:
        """Get the total number of images for a post"""
        return self.db.query(PostImage).filter(
            PostImage.post_id == post_id
        ).count()
    
    def reorder_post_images(self, post_id: int, image_orders: List[dict], user_id: int) -> bool:
        """Reorder multiple images for a post
        image_orders: List of {id: int, display_order: int, is_primary: bool}
        """
        post = self.db.query(Post).filter(
            and_(Post.id == post_id, Post.user_id == user_id)
        ).first()
        
        if not post:
            return False
        
        try:
            primary_count = sum(1 for order_data in image_orders if order_data.get('is_primary', False))
            if primary_count != 1:
                return False
            
            for order_data in image_orders:
                self.db.query(PostImage).filter(
                    and_(
                        PostImage.id == order_data['id'],
                        PostImage.post_id == post_id
                    )
                ).update({
                    PostImage.display_order: order_data['display_order'],
                    PostImage.is_primary: order_data.get('is_primary', False)
                })
            
            self.db.commit()
            return True
            
        except Exception:
            self.db.rollback()
            return False
        
    def delete_post_image_by_user(self, image_id: int, user_id: int) -> Optional[PostImage]:
        """Delete a post image with user verification (using tuple pattern)"""
        image = self.db.query(PostImage).join(Post).filter(
            and_(PostImage.id == image_id, Post.user_id == user_id)
        ).first()
        
        if image:
            self.db.delete(image)
            self.db.commit()
            return image
        
        return None
    
    def set_primary_image_by_user(self, post_id: int, image_id: int, user_id: int) -> bool:
        """Set an image as primary for a post with user verification"""
        # Verify user owns the post through tuple pattern
        post_exists = self.db.query(Post).filter(
            and_(Post.id == post_id, Post.user_id == user_id)
        ).first()
        
        if not post_exists:
            return False
        
        # Remove primary status from all images of this post
        self.db.query(PostImage).filter(
            PostImage.post_id == post_id
        ).update({PostImage.is_primary: False})
        
        # Set the selected image as primary
        result = self.db.query(PostImage).filter(
            and_(PostImage.id == image_id, PostImage.post_id == post_id)
        ).update({PostImage.is_primary: True})
        
        if result:
            self.db.commit()
            return True
        
        self.db.rollback()
        return False
    
    def reorder_post_images_by_user(self, post_id: int, image_orders: List[dict], user_id: int) -> bool:
        """Reorder multiple images for a post with user verification
        image_orders: List of {id: int, display_order: int, is_primary: bool}
        """
        # Verify user owns the post
        post_exists = self.db.query(Post).filter(
            and_(Post.id == post_id, Post.user_id == user_id)
        ).first()
        
        if not post_exists:
            return False
        
        try:
            # Ensure only one primary image
            primary_count = sum(1 for order_data in image_orders if order_data.get('is_primary', False))
            if primary_count != 1:
                return False
            
            # Update each image
            for order_data in image_orders:
                self.db.query(PostImage).filter(
                    and_(
                        PostImage.id == order_data['id'],
                        PostImage.post_id == post_id
                    )
                ).update({
                    PostImage.display_order: order_data['display_order'],
                    PostImage.is_primary: order_data.get('is_primary', False)
                })
            
            self.db.commit()
            return True
            
        except Exception:
            self.db.rollback()
            return False