from fastapi import APIRouter, UploadFile, File, Depends, HTTPException

from middleware.auth import require_authentication
from services.storage import upload_file

upload_router = APIRouter(prefix="/upload", tags=["Upload"])


@upload_router.post("/", response_model=dict)
async def upload_image(
    file: UploadFile = File(...), auth: dict = Depends(require_authentication)
):
    url = await upload_file(file)
    return {"url": url}
