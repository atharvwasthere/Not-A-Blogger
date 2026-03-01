import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from config import get_settings

config = get_settings()

cloudinary.config(
    cloud_name=config.CLOUDINARY_CLOUD_NAME,
    api_key=config.CLOUDINARY_API_KEY,
    api_secret=config.CLOUDINARY_API_SECRET,
    secure=True,
)


async def upload_file(file: UploadFile) -> str:
    # 1. Validate file
    if file.content_type not in [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm",
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only images and standard web videos are allowed.",
        )

    if not config.CLOUDINARY_CLOUD_NAME:
        print("Warning: Cloudinary Credentials missing.")

    try:
        # 2. Read the file into memory
        contents = await file.read()

        # 3. Upload to Cloudinary
        # resource_type="auto" automatically determines if it's an image or video
        upload_result = cloudinary.uploader.upload(
            contents, resource_type="auto", folder="blog_posts"
        )

        # 4. Return Public URL
        return upload_result.get("secure_url")

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
