"""
Cloudflare R2 Storage Service

S3-compatible object storage for images and files.
Uses boto3 with R2-specific endpoint configuration.
"""
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from typing import Optional, BinaryIO
import uuid
from datetime import datetime

from app.core.config import settings


class R2StorageService:
    """Cloudflare R2 storage service using S3-compatible API."""

    def __init__(self):
        self.bucket_name = settings.R2_BUCKET_NAME
        self.public_url = settings.R2_PUBLIC_URL
        self._client = None

    @property
    def client(self):
        """Lazy initialization of S3 client."""
        if self._client is None:
            if not settings.R2_ACCOUNT_ID:
                raise Exception(
                    "R2 storage not configured. Please set R2_ACCOUNT_ID, "
                    "R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables."
                )
            self._client = boto3.client(
                's3',
                endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                config=Config(
                    signature_version='s3v4',
                    retries={'max_attempts': 3, 'mode': 'standard'}
                ),
                region_name='auto',
            )
        return self._client

    def _generate_key(self, folder: str, filename: str, user_id: Optional[str] = None) -> str:
        """Generate a unique storage key for the file."""
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        unique_id = uuid.uuid4().hex[:8]
        ext = filename.split('.')[-1] if '.' in filename else 'jpg'

        if user_id:
            return f"{folder}/{user_id}/{timestamp}_{unique_id}.{ext}"
        return f"{folder}/{timestamp}_{unique_id}.{ext}"

    def get_public_url(self, key: str) -> str:
        """Get the public URL for a stored object."""
        if self.public_url:
            return f"{self.public_url.rstrip('/')}/{key}"
        # Fallback to R2.dev URL if no custom domain
        return f"https://{self.bucket_name}.{settings.R2_ACCOUNT_ID}.r2.dev/{key}"

    async def upload_file(
        self,
        file: BinaryIO,
        filename: str,
        folder: str = "uploads",
        user_id: Optional[str] = None,
        content_type: str = "image/jpeg",
    ) -> dict:
        """
        Upload a file to R2 storage.

        Args:
            file: File-like object to upload
            filename: Original filename
            folder: Storage folder (e.g., 'instruments', 'cards')
            user_id: Optional user ID for organizing user uploads
            content_type: MIME type of the file

        Returns:
            dict with 'key', 'url', and 'size'
        """
        key = self._generate_key(folder, filename, user_id)

        try:
            # Read file content
            file_content = file.read()
            file_size = len(file_content)

            # Upload to R2
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_content,
                ContentType=content_type,
                CacheControl="public, max-age=31536000",  # 1 year cache
            )

            return {
                "key": key,
                "url": self.get_public_url(key),
                "size": file_size,
            }

        except ClientError as e:
            raise Exception(f"Failed to upload file: {e}")

    async def upload_bytes(
        self,
        data: bytes,
        filename: str,
        folder: str = "uploads",
        user_id: Optional[str] = None,
        content_type: str = "image/jpeg",
    ) -> dict:
        """
        Upload raw bytes to R2 storage.

        Args:
            data: Raw bytes to upload
            filename: Original filename
            folder: Storage folder
            user_id: Optional user ID
            content_type: MIME type

        Returns:
            dict with 'key', 'url', and 'size'
        """
        key = self._generate_key(folder, filename, user_id)

        try:
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=data,
                ContentType=content_type,
                CacheControl="public, max-age=31536000",
            )

            return {
                "key": key,
                "url": self.get_public_url(key),
                "size": len(data),
            }

        except ClientError as e:
            raise Exception(f"Failed to upload file: {e}")

    async def delete_file(self, key: str) -> bool:
        """
        Delete a file from R2 storage.

        Args:
            key: Storage key of the file to delete

        Returns:
            True if deleted successfully
        """
        try:
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=key,
            )
            return True
        except ClientError as e:
            raise Exception(f"Failed to delete file: {e}")

    async def delete_files(self, keys: list[str]) -> bool:
        """
        Delete multiple files from R2 storage.

        Args:
            keys: List of storage keys to delete

        Returns:
            True if all deleted successfully
        """
        if not keys:
            return True

        try:
            # R2 supports batch delete up to 1000 objects
            objects = [{"Key": key} for key in keys]
            self.client.delete_objects(
                Bucket=self.bucket_name,
                Delete={"Objects": objects},
            )
            return True
        except ClientError as e:
            raise Exception(f"Failed to delete files: {e}")

    async def file_exists(self, key: str) -> bool:
        """Check if a file exists in storage."""
        try:
            self.client.head_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError:
            return False

    async def list_files(self, prefix: str, max_keys: int = 100) -> list[dict]:
        """
        List files in a folder.

        Args:
            prefix: Folder prefix to list (e.g., 'cards/user123/')
            max_keys: Maximum number of files to return

        Returns:
            List of dicts with 'key', 'url', 'size', 'last_modified'
        """
        try:
            response = self.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys,
            )

            files = []
            for obj in response.get("Contents", []):
                files.append({
                    "key": obj["Key"],
                    "url": self.get_public_url(obj["Key"]),
                    "size": obj["Size"],
                    "last_modified": obj["LastModified"].isoformat(),
                })

            return files

        except ClientError as e:
            raise Exception(f"Failed to list files: {e}")

    def generate_presigned_upload_url(
        self,
        filename: str,
        folder: str = "uploads",
        user_id: Optional[str] = None,
        content_type: str = "image/jpeg",
        expires_in: int = 3600,
    ) -> dict:
        """
        Generate a presigned URL for direct client upload.

        Args:
            filename: Original filename
            folder: Storage folder
            user_id: Optional user ID
            content_type: Expected MIME type
            expires_in: URL expiration in seconds (default 1 hour)

        Returns:
            dict with 'upload_url', 'key', and 'public_url'
        """
        key = self._generate_key(folder, filename, user_id)

        try:
            upload_url = self.client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key,
                    'ContentType': content_type,
                },
                ExpiresIn=expires_in,
            )

            return {
                "upload_url": upload_url,
                "key": key,
                "public_url": self.get_public_url(key),
            }

        except ClientError as e:
            raise Exception(f"Failed to generate presigned URL: {e}")


# Singleton instance
storage_service = R2StorageService()


def get_storage_service() -> R2StorageService:
    """Dependency injection for storage service."""
    return storage_service
