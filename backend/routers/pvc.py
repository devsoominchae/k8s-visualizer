from fastapi import APIRouter, HTTPException
from fastapi_cache.decorator import cache

from utils.conf import CACHE_TIMEOUT
from resources.pvc import PVCInfo


router = APIRouter(
    prefix="/pvc",
    tags=["PersistentVolumeClaims Information"]
)
    
@router.get("/describe_pv",
         summary="Returns kubectl describe pv output of the PersistentVolume for the PVCs",
         description="Sample input: /home/admin/sample/CS0343372_20251215_100140.tgz")
@cache(expire=CACHE_TIMEOUT)
async def get_pv_describe(file_name: str):
    pvc_info = PVCInfo(file_name)
    try:
        pv_describe = pvc_info.get_pv_describe()
        return pv_describe
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
