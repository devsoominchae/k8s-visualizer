# file_manager.py

from fastapi import APIRouter, UploadFile, File, HTTPException

from utils import file_manager

router = APIRouter(
    tags=["Upload file"]
)

UPLOAD_DIR = '/tmp'

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Receives a .tgz file and saves it to the server's '/tmp' directory.
    """
    try:
        return file_manager.upload_file(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"There was an error uploading the file: {e}")
    
@router.delete("/delete/{file_name}")
async def delete_file(file_name: str):
    """
    Deletes a specific file from the UPLOAD_DIR.
    """
    try:
        return file_manager.delete_file(file_name)
    
    except AssertionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {e}")