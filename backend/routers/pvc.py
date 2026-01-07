from fastapi import APIRouter, HTTPException


from resources.pvc import PVCInfo


router = APIRouter(
    prefix="/api/pvc",
    tags=["PersistentVolumeClaims Information"]
)
    
@router.get("/describe_pv",
         summary="Returns kubectl describe pv output of the PersistentVolume for the PVCs",
         description="Sample input: /home/admin/sample/CS0343372_20251215_100140.tgz")
def get_pv_describe(file_name: str):
    pvc_info = PVCInfo(file_name)
    try:
        pv_describe = pvc_info.get_pv_describe()
        return pv_describe
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
