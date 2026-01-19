"""
Storage API Endpoints

Handles file uploads and management via Cloudflare R2.
"""
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query
from typing import Optional
from pydantic import BaseModel

from app.core.security import get_current_user_id
from app.services.storage import get_storage_service, R2StorageService


router = APIRouter()


# Response schemas
class UploadResponse(BaseModel):
    key: str
    url: str
    size: int


class PresignedUploadResponse(BaseModel):
    upload_url: str
    key: str
    public_url: str


class FileInfo(BaseModel):
    key: str
    url: str
    size: int
    last_modified: str


class DeleteResponse(BaseModel):
    success: bool
    message: str


# Allowed content types
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/heic": ".heic",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Query(default="cards", description="Storage folder"),
    user_id: str = Depends(get_current_user_id),
    storage: R2StorageService = Depends(get_storage_service),
):
    """
    Upload a file to storage.

    - **file**: Image file to upload (JPEG, PNG, WebP, HEIC)
    - **folder**: Storage folder ('cards', 'instruments', 'profiles')

    Returns the storage key and public URL.
    """
    # Validate content type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES.keys())}",
        )

    # Read and validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)} MB",
        )

    # Validate folder
    allowed_folders = ["cards", "instruments", "profiles"]
    if folder not in allowed_folders:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid folder. Allowed: {', '.join(allowed_folders)}",
        )

    try:
        result = await storage.upload_bytes(
            data=content,
            filename=file.filename or "image.jpg",
            folder=folder,
            user_id=user_id,
            content_type=file.content_type,
        )

        return UploadResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/presigned-upload", response_model=PresignedUploadResponse)
async def get_presigned_upload_url(
    filename: str = Query(..., description="Original filename"),
    folder: str = Query(default="cards", description="Storage folder"),
    content_type: str = Query(default="image/jpeg", description="File MIME type"),
    user_id: str = Depends(get_current_user_id),
    storage: R2StorageService = Depends(get_storage_service),
):
    """
    Get a presigned URL for direct client-side upload.

    This allows the mobile app to upload directly to R2 without
    proxying through the API server.

    - **filename**: Original filename
    - **folder**: Storage folder
    - **content_type**: MIME type of the file

    Returns a presigned upload URL valid for 1 hour.
    """
    # Validate content type
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES.keys())}",
        )

    # Validate folder
    allowed_folders = ["cards", "instruments", "profiles"]
    if folder not in allowed_folders:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid folder. Allowed: {', '.join(allowed_folders)}",
        )

    try:
        result = storage.generate_presigned_upload_url(
            filename=filename,
            folder=folder,
            user_id=user_id,
            content_type=content_type,
            expires_in=3600,  # 1 hour
        )

        return PresignedUploadResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete")
async def delete_file(
    key: str = Query(..., description="Storage key to delete"),
    user_id: str = Depends(get_current_user_id),
    storage: R2StorageService = Depends(get_storage_service),
):
    """
    Delete a file from storage.

    - **key**: Storage key of the file to delete

    Users can only delete their own files.
    """
    # Security: Verify user owns this file
    user_prefix = f"/{user_id}/"
    if user_prefix not in key and not key.startswith(f"cards/{user_id}/"):
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own files",
        )

    try:
        await storage.delete_file(key)
        return DeleteResponse(success=True, message="File deleted successfully")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list", response_model=list[FileInfo])
async def list_files(
    folder: str = Query(default="cards", description="Storage folder"),
    user_id: str = Depends(get_current_user_id),
    storage: R2StorageService = Depends(get_storage_service),
):
    """
    List files in a user's folder.

    - **folder**: Storage folder to list

    Returns files owned by the current user.
    """
    prefix = f"{folder}/{user_id}/"

    try:
        files = await storage.list_files(prefix=prefix)
        return [FileInfo(**f) for f in files]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
