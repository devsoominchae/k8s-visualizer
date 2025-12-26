# file_manager.py

import os
import time
import shutil


UPLOAD_DIR = '/tmp'

def upload_file(file):
    """
    Receives a .tgz file, saves it to /tmp, and measures duration.
    """
    start_time = time.perf_counter()

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    end_time = time.perf_counter()
    
    duration = end_time - start_time
        
    return {
        "info": f"File '{file.filename}' saved at '{file_location}'",
        "content_type": file.content_type,
        "upload_time_seconds": round(duration, 4) # Rounded for readability
    }
    
def delete_file(filename: str):
    """
    Deletes a specific file from the UPLOAD_DIR.
    """
    assert filename.endswith(".tgz"), "File type must be .tgz"
    file_location = os.path.join(UPLOAD_DIR, filename)

    assert os.path.exists(file_location), f"File '{filename}' not found."

    os.remove(file_location)
    return {"message": f"File '{filename}' deleted successfully."}