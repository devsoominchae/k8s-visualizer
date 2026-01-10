from fastapi import APIRouter, HTTPException
from fastapi_cache.decorator import cache

router = APIRouter(
    prefix="/node",
    tags=["Node Information"]
)

from utils.conf import CACHE_TIMEOUT
from resources.node import NodeInfo

@router.get("/status",
         summary="Returns detailed information of the nodes in the cluster.",
         description="Sample input: /home/admin/sample/CS0343372_20251215_100140.tgz")
@cache(expire=CACHE_TIMEOUT)
async def get_node_status(file_name: str):
    node_info = NodeInfo(file_name)
    try:
        node_status = node_info.get_node_status()
        return node_status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"There was an error parsing the node status: {e}")

@router.get("/describe",
         summary="Returns kubectl describe output of the nodes in the cluster.",
         description="Sample input: /home/admin/sample/CS0343372_20251215_100140.tgz")
@cache(expire=CACHE_TIMEOUT)
async def get_node_describe(file_name: str):
    node_info = NodeInfo(file_name)
    try:
        node_describe = node_info.get_resource_describe()
        return node_describe
    except Exception as e:
       raise HTTPException(status_code=500, detail=f"There was an error parsing the environment information: {e}")

@router.get("/list_names",
         summary="Returns names of nodes as a list.",
         description="Sample input: /home/admin/sample/CS0343372_20251215_100140.tgz")
@cache(expire=CACHE_TIMEOUT)
async def get_node_names(file_name: str):
    node_info = NodeInfo(file_name)
    try:
        node_names = node_info.get_resource_names()
        return node_names
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"There was an error parsing list of nodes: {e}")
    
@router.get("/describe_section",
         summary="Returns kubectl describe node output sections.",
         description="Sample input: /home/admin/sample/CS0343372_20251215_100140.tgz")
@cache(expire=CACHE_TIMEOUT)
async def get_node_describe_section(file_name: str):
    node_info = NodeInfo(file_name)
    try:
        node_describe_section = node_info.get_resource_describe_section()
        return node_describe_section
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"There was an error parsing sections in describe output: {e}")

@router.get("/get_nodes",
         summary="Returns kubectl get nodes output.",
         description="Sample input: /home/admin/sample/CS0343372_20251215_100140.tgz")
@cache(expire=CACHE_TIMEOUT)
async def get_nodes(file_name: str):
    node_info = NodeInfo(file_name)
    try:
        node_status = node_info.get_resource_status()
        return node_status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"There was an error parsing the get nodes output: {e}")