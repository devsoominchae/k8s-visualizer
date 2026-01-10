from fastapi import APIRouter, HTTPException
from fastapi_cache.decorator import cache

router = APIRouter(
    prefix="/env",
    tags=["Environment Information"]
)

from utils.conf import CACHE_TIMEOUT
from resources.env import EnvInfo

@router.get("/info",
         summary="Returns information about the Viya environment",
         description="Sample input: /home/admin/sample/CS0343372_20251215_100140.tgz")
@cache(expire=CACHE_TIMEOUT)
async def get_env_info_dict(file_name: str):
    env_info = EnvInfo(file_name)
    try:
        env_info_dict = env_info.get_env_info_dict()
        return env_info_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"There was an error parsing the environment information: {e}")