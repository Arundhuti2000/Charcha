
import os
import uuid
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from io import BytesIO
from PIL import Image
import logging

from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from azure.core.exceptions import ResourceNotFoundError
from fastapi import HTTPException, UploadFile, status
from .config import settings


logger = logging.getLogger(__name__)

class AzureStorageService:
    def __init__(self):
        self.account_name = settings.azure_storage_account_name
        self.account_key = settings.azure_storage_account_key
        self.container_name = settings.azure_storage_container_name
        self.storage_url = settings.azure_storage_url

        connection_string = f"DefaultEndpointsProtocol=https;AccountName={self.account_name};AccountKey={self.account_key};EndpointSuffix=core.windows.net"
        self.blob_service_client= BlobServiceClient.from_connection_string(connection_string)
        self._ensure_container_exists()

    def _ensure_container_exists(self):
        """Create container if it doesn't exist"""
        try:
            container_client = self.blob_service_client.get_container_client(self.container_name)
            container_client.get_container_properties()
        except ResourceNotFoundError:
            try:
                self.blob_service_client.create_container(
                    self.container_name,
                    public_access=None 
                )
                logger.info(f"Created container: {self.container_name}")
            except Exception as e:
                logger.error(f"Failed to create container: {e}")
                raise HTTPException(status_code=500, detail="Failed to initialize storage")

    def _validate_image(self, file: UploadFile) -> None:
        """Validate Uploaded Image FIle"""
        if file.content_type not in settings.allowed_image_types:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid file type. Allowed types: {settings.allowed_image_types}")
        if hasattr(file,'size') and file.size:
            if file.size>settings.max_image_size_mb*1024*1024:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid File Size, Allowe File Size limit: {settings.max_image_size_mb}MB")
            
    def _generate_unique_filename(self, original_filename: str, user_id: int) -> str:
        """Generate unique filename for blob storage"""
        timestamp= datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        file_extension = os.path.splitext(original_filename)[1].lower()
        return f"posts/{user_id}/{timestamp}_{unique_id}{file_extension}"
    
    async def upload_image(self, file: UploadFile, user_id: int) -> Tuple[str, str]:
        """Upload image to Azure Blob Storage, Returns: (blob_name, blob_url)"""
        try:
            self._validate_image(file)
            file_content= await file.read()
            await file.seek(0)
            optmized_content= await self._optimize_image(file_content, file.content_type)

            blob_name = self._generate_unique_filename(file.filename)
            blob_client= self.blob_service_client.get_blob_client(
                container=self.container_name, 
                blob=blob_name
            )
            blob_client.upload_blob(
                optmized_content,
                content_type=file.content_type,
                overwrite=True,
                metadata={
                    'original_filename': file.filename,
                    'uploaded_by': str(user_id),
                    'upload_timestamp': datetime.utcnow().isoformat()
                }
            )

            blob_url = f"{self.storage_url}/{self.container_name}/{blob_name}"
            logger.info(f"Successfully uploaded image: {blob_name}")
            return blob_name, blob_url
        except Exception as e:
            logger.error(f"Failed to upload image: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload image")
        
    async def _optimize_image(self, file_content: bytes, content_type: str) -> bytes:
        """Optimize image for web (resize, compress)"""
        try:
            if content_type == "image/gif":
                return file_content
            with Image.open(BytesIO(file_content)) as img:
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    if img.mode in ('RGBA', 'LA'):
                        background.paste(img, mask=img.split()[-1])
                        img = background
                max_dimension = 1920
                if max(img.size) > max_dimension:
                    img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                output = BytesIO()
                format_map = {
                    "image/jpeg": "JPEG",
                    "image/png": "PNG",
                    "image/webp": "WEBP"
                }
                save_format = format_map.get(content_type, "JPEG")
                quality = 85 if save_format == "JPEG" else None
                save_kwargs = {"format": save_format}
                if quality:
                    save_kwargs["quality"] = quality
                    save_kwargs["optimize"] = True
                
                img.save(output, **save_kwargs)
                return output.getvalue()
                
        except Exception as e:
            logger.warning(f"Image optimization failed, using original: {e}")
            return file_content
        
    def generate_sas_url(self, blob_name: str, expires_in_hours: int = 24) -> str:
        """Generate SAS URL for temporary access to blob"""
        try:
            sas_token = generate_blob_sas(
                account_name=self.account_name,
                container_name=self.container_name,
                blob_name=blob_name,
                account_key=self.account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=expires_in_hours)
            )
            
            return f"{self.storage_url}/{self.container_name}/{blob_name}?{sas_token}"
            
        except Exception as e:
            logger.error(f"Failed to generate SAS URL: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate image URL")
    
    def delete_blob(self, blob_name: str) -> bool:
        """Delete blob from storage"""
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            blob_client.delete_blob()
            logger.info(f"Deleted blob: {blob_name}")
            return True
            
        except ResourceNotFoundError:
            logger.warning(f"Blob not found for deletion: {blob_name}")
            return False
        except Exception as e:
            logger.error(f"Failed to delete blob: {e}")
            return False
    
    async def upload_multiple_images(self, files: List[UploadFile], user_id: int) -> List[Tuple[str, str]]:
        """Upload multiple images concurrently"""
        max_images = 10 
        
        if len(files) > max_images:
            raise HTTPException(
                status_code=400,
                detail=f"Too many images. Maximum allowed: {max_images}"
            )
        

        upload_tasks = [self.upload_image(file, user_id) for file in files]
        results = await asyncio.gather(*upload_tasks, return_exceptions=True)

        successful_uploads = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Failed to upload file {files[i].filename}: {result}")
                for blob_name, _ in successful_uploads:
                    self.delete_blob(blob_name)
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to upload image: {files[i].filename}"
                )
            else:
                successful_uploads.append(result)
        
        return successful_uploads

azure_storage = AzureStorageService()