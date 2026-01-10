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
         summary="Returns parsed output of a specific container of a pod",
         description="""
         Sample input:
             \n- file_name: /home/admin/sample/CS0343372_20251215_100140.tgz
             \n- pod: sas-configuration-6798fcdb8c-cc6dc
             \n- container: sas-configuration
             \n- requested_items: ['timeStamp', 'level', 'message']
             \n- requested_level: warn
         """)
@cache(expire=CACHE_TIMEOUT)
async def parse_log(
    file_name: str, 
    pod: str, 
    container: str, 
    requested_items: List[str] = Query(default=['timeStamp', 'level', 'message']), 
    requested_level: str = "info"
):
    try:
        pod_info = PodInfo(file_name)
        log_text = pod_info.get_pod_container_log(pod, container)

        if not log_text:
            return f"No logs found for pod '{pod}' in container '{container}'"

        log_ctrl = LogController(
            log_text, 
            requested_items=requested_items, 
            requested_level=requested_level
        )
        
        return log_ctrl.parse_log()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))