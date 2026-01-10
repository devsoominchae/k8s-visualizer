from typing import List
from fastapi import APIRouter, HTTPException, Query
from fastapi_cache.decorator import cache


from resources.pod import PodInfo
from utils.conf import CACHE_TIMEOUT
from utils.log_controller import LogController

router = APIRouter(
    prefix="/pod",
    tags=["Pod Information"]
)

@router.get("/containers",
         summary="Returns InitContainers and Containers of a pod.",
         description="Sample input: /home/admin/sample/CS0343372_20251215_100140.tgz")
@cache(expire=CACHE_TIMEOUT)
async def get_pod_containers(file_name: str):
    pod_info = PodInfo(file_name)
    try:
        pod_containers = pod_info.get_pod_containers()
        return pod_containers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workload_class",
         summary="Returns pods grouped by SAS workload class.",
         description="Sample input: /home/admin/sample/CS0343372_20251215_100140.tgz")
@cache(expire=CACHE_TIMEOUT)
async def get_pods_by_workload_class(file_name: str):
    pod_info = PodInfo(file_name)
    try:
        pods_by_workload_class = pod_info.get_pods_by_workload_class()
        return pods_by_workload_class
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/logs",
         summary="Returns parsed output each pod and containers",
         description="""
         Sample input: 
         \n - file_name: /home/admin/sample/CS0343372_20251215_100140.tgz
         \n - pod: sas-transformations-5c95d977dd-82kl5
         \n - container: sas-transformations
         """)
@cache(expire=CACHE_TIMEOUT)
async def get_pod_container_log(file_name: str, pod: str, container: str):
    pod_info = PodInfo(file_name)
    try:
        pod_container_log = pod_info.get_pod_container_log(pod, container)
        return pod_container_log
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))