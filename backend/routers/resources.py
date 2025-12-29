from fastapi import APIRouter


from resources.resources import Resource


router = APIRouter(
    prefix="/api/resource",
    tags=["K8s Resource Information"]
)

@router.get("/status",
         summary="Returns kubectl get <COMPONENT> output.",
         description="""Sample input: 
         \n - file_name: /home/admin/sample/CS0343372_20251215_100140.tgz
         \n - resource_name: configmaps""")
def get_resource_status(file_name: str, resource_name: str):
    resource_info = Resource(file_name, resource_name)
    try:
        resource_status = resource_info.get_resource_status()
        return resource_status
    except Exception as e:
        return {"error": str(e)}
    
@router.get("/describe",
         summary="Returns kubectl describe <COMPONENT> output.",
         description="""Sample input: 
         \n - file_name: /home/admin/sample/CS0343372_20251215_100140.tgz
         \n - resource_name: configmaps""")
def get_resource_describe(file_name: str, resource_name: str):
    resource_info = Resource(file_name, resource_name)
    try:
        resource_describe = resource_info.get_resource_describe()
        return resource_describe
    except Exception as e:
        return {"error": str(e)}
    
@router.get("/describe_section",
         summary="Returns kubectl describe daemonsets output sections.",
         description="Sample input: /home/admin/sample/CS0343372_20251215_100140.tgz")
def get_resource_describe_section(file_name: str, resource_name: str):
    resource_info = Resource(file_name, resource_name)
    try:
        resource_describe_section = resource_info.get_resource_describe_section()
        return resource_describe_section
    except Exception as e:
        return {"error": str(e)}


@router.get("/list_names",
         summary="Returns names of the <COMPONENT> as a list.",
         description="""Sample input: 
         \n - file_name: /home/admin/sample/CS0343372_20251215_100140.tgz
         \n - resource_name: configmaps""")
def get_resource_names(file_name: str, resource_name: str):
    resource_info = Resource(file_name, resource_name)
    try:
        resource_names = resource_info.get_resource_names()
        return resource_names
    except Exception as e:
        return {"error": str(e)}

@router.get("/avail_types",
         summary="Returns available resource types as a list.",
         description="Sample input: /home/admin/sample/CS0343372_20251215_100140.tgz")
def get_available_resource_types(file_name: str):
    resource_info = Resource(file_name)
    try:
        avail_resource_types = resource_info.get_available_resource_types()
        return avail_resource_types
    except Exception as e:
        return {"error": str(e)}