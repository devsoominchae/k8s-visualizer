from resources.pod import PodInfo
from resources.pvc import PVCInfo
from resources.node import NodeInfo
from resources.resources import Resource

from utils.log_controller import LogController

file_name = "/home/admin/sample/CS0343372_20251215_100140.tgz"

# pod_info = PodInfo(file_name)
# pod_info.get_pod_describe_section()

resource_info = Resource(file_name, "deployments")
resource_info.get_resource_status()

# pvc_info = PVCInfo(file_name)
# print(pvc_info.get_pv_describe())

# node_info = NodeInfo(file_name)
# node_info.get_node_status()