# node.py

import re
import json
import yaml

from resources.resources import Resource

from utils.tar_controller import TarController
from utils.dict_utils import deep_get

OS_LOGO_DICT = {
    "Amazon": "/home/admin/k8s-visualizer/frontend/src/assets/amazon_linux.png",
    "Red Hat": "/home/admin/k8s-visualizer/frontend/src/assets/rhel.png",
    "Ubuntu": "/home/admin/k8s-visualizer/frontend/src/assets/ubuntu.png",
    "Photon": "/home/admin/k8s-visualizer/frontend/src/assets/vmware_photon.png"
}

DEAFULT_RESOURCES = {
      "non_terminated_pods": "0",
      "cpu_requests": "N/A",
      "cpu_requests_pct": "0",
      "cpu_limits": "N/A",
      "cpu_limits_pct": "0",
      "memory_requests": "N/A",
      "memory_requests_pct": "0",
      "memory_limits": "N/A",
     
}

class NodeInfo(Resource):
    def __init__(self, file_name):
        super().__init__(file_name)
        
        self.file_name = file_name
        self.json_nodes_path = "./kubernetes/clusterwide/json/nodes.json"
        self.yaml_nodes_path = "./kubernetes/clusterwide/yaml/nodes.yaml"
        self.get_resource_path = "./kubernetes/clusterwide/get/nodes.txt"
        self.describe_resource_path = "./kubernetes/clusterwide/describe/nodes.txt"
        
        self.get_resource_names()
    
    def get_node_status(self):
        with TarController(self.file_name) as ctrl:
            nodes_json = ""
            
            if ctrl.file_exists_in_tar(self.json_nodes_path):
                json_nodes_text = ctrl.get_file_content(self.json_nodes_path)
                nodes_json = json.loads(json_nodes_text)
            else:
                node_yaml_text = ctrl.get_file_content(self.yaml_nodes_path)
                nodes_json = yaml.safe_load(node_yaml_text)
            
            describe_nodes_text = ctrl.get_file_content(self.describe_resource_path)
            resources_dict = self.parse_describe_text(describe_nodes_text)
            
            get_node_output = self.get_resource_status()

            node_status = {}
            for i in range(len(deep_get(nodes_json, ["items"], []))):
                name = deep_get(nodes_json, ["items", i, "metadata", "name"], "Node name unavailable")
                # annotations = deep_get(nodes_json, ["items", i, "metadata", "annotations"], "Node annotation unavailable")
                labels = deep_get(nodes_json, ["items", i, "metadata", "labels"], {})
                # taints = deep_get(nodes_json, ["items", i, "spec", "taints"], "Node taints unavailable")
                ip = deep_get(nodes_json, ["items", i, "status", "addresses", 0, "address"], "Node ip unavailable")
                workload_class = deep_get(labels, ["workload.sas.com/class"], "N/A")
                allocatable_pods = deep_get(nodes_json, ["items", i, "status", "allocatable", "pods"], "Allocatable pods unavailable")
                cpu_allocatable = deep_get(nodes_json, ["items", i, "status", "allocatable", "cpu"], "Allocatable node CPU unavailable")
                cpu_capacity = deep_get(nodes_json, ["items", i, "status", "capacity", "cpu"], "Node CPU capacity unavailable")
                memory_allocatable = deep_get(nodes_json, ["items", i, "status", "allocatable", "memory"], "Allocatable node memory unavailable")
                memory_allocatable_gi = int(int(re.findall(r'\d+', memory_allocatable)[0]) / (1024 ** 2))
                memory_capacity = deep_get(nodes_json, ["items", i, "status", "capacity", "memory"], "Node memory capacity unavailable")
                memory_capacity_gi = int(int(re.findall(r'\d+', memory_capacity)[0]) / (1024 ** 2))
                resources = deep_get(resources_dict, [name], DEAFULT_RESOURCES)
                status = get_node_output[name]
                
                
                os_image_logo = "/home/admin/k8s-visualizer/frontend/src/assets/default.png"
                os_image = deep_get(nodes_json, ["items", i, "status", "nodeInfo", "osImage"], "Node OS image unavailable")
                for image_name in OS_LOGO_DICT.keys():
                    if image_name in os_image:
                        os_image_logo = OS_LOGO_DICT[image_name]

                node_status[name] = {}
                node_status[name]["ip"] = ip
                node_status[name]["workload_class"] = workload_class
                node_status[name]["allocatable_pods"] = allocatable_pods
                node_status[name]["cpu_allocatable"] = cpu_allocatable
                node_status[name]["cpu_capacity"] = cpu_capacity
                node_status[name]["memory_allocatable"] = memory_allocatable
                node_status[name]["memory_allocatable_gi"] = f"{memory_allocatable_gi} Gi"
                node_status[name]["memory_capacity"] = memory_capacity
                node_status[name]["memory_capacity_gi"] = f"{memory_capacity_gi} Gi"
                node_status[name]["os_image"] = os_image
                node_status[name]["os_image_logo"] = os_image_logo
                node_status[name]["resources"] = resources
                node_status[name]["status"] = status
        
        return node_status
    

    def parse_describe_text(self, describe_nodes_text):
        line_split_text = describe_nodes_text.split('\n')
        names = [i.split()[1] for i in line_split_text if i.startswith("Name:")]
        non_terminated_pods = [i.split()[2].replace("(", "") for i in line_split_text if i.startswith("Non-terminated Pods:")]
        
        cpu_requests = [i.split()[1] for i in line_split_text if i.startswith("  cpu ")]
        cpu_requests_pct = [i.split()[2].replace("(", "").replace(")", "") for i in line_split_text if i.startswith("  cpu ")]
        
        cpu_limits = [i.split()[3] for i in line_split_text if i.startswith("  cpu ")]
        cpu_limits_pct = [i.split()[4].replace("(", "").replace(")", "") for i in line_split_text if i.startswith("  cpu ")]
        
        memory_requests = [i.split()[1] for i in line_split_text if i.startswith("  memory ")]
        memory_requests_pct = [i.split()[2].replace("(", "").replace(")", "") for i in line_split_text if i.startswith("  memory ")]
        
        memory_limits = [i.split()[3] for i in line_split_text if i.startswith("  memory ")]
        memory_limits_pct = [i.split()[4].replace("(", "").replace(")", "") for i in line_split_text if i.startswith("  memory ")]

        zipped_data = zip(
            names, non_terminated_pods, cpu_requests, cpu_requests_pct, 
            cpu_limits, cpu_limits_pct, memory_requests, 
            memory_requests_pct, memory_limits, memory_limits_pct
        )

        # Map the Name to a sub-dictionary of its metrics
        non_terminated_pods_dict = {
            row[0]: {
                "non_terminated_pods": row[1],
                "cpu_requests": row[2],
                "cpu_requests_pct": row[3],
                "cpu_limits": row[4],
                "cpu_limits_pct": row[5],
                "memory_requests": row[6],
                "memory_requests_pct": row[7],
                "memory_limits": row[8],
                "memory_limits_pct": row[9]
            }
            for row in zipped_data
        }
        
        return non_terminated_pods_dict