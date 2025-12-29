# pod.py

import json

from resources.resources import Resource

from utils.dict_utils import deep_get
from utils.tar_controller import TarController

class PodInfo(Resource):
    def __init__(self, file_name):
        super().__init__(file_name)
        
        self.get_resource_path = f"./kubernetes/{self.namespace}/get/pods.txt"
        self.describe_resource_path = f"./kubernetes/{self.namespace}/describe/pods.txt"
        self.json_pods_path = f"./kubernetes/{self.namespace}/json/pods.json"
        self.pods_log_path = f"./kubernetes/{self.namespace}/logs"
        
        self.get_resource_names()
    
    def get_pod_containers(self):
        with TarController(self.file_name) as ctrl:
            json_nodes_text = ctrl.get_file_content(self.json_pods_path)
            pods_json = json.loads(json_nodes_text)
            pod_containers = {}
            for i in range(len(deep_get(pods_json, ["items"], []))):
                name = deep_get(pods_json, ["items", i, "metadata", "name"])
                
                init_containers = {j["name"]: j for j in deep_get(pods_json, ["items", i, "status", "initContainerStatuses"]) or {}}
                containers = {j["name"]: j for j in deep_get(pods_json, ["items", i, "status", "containerStatuses"]) or {}}
                
                pod_containers[name] = {}
                pod_containers[name]["init_containers"] = init_containers
                pod_containers[name]["containers"] = containers
        
        return pod_containers
    
    def get_pods_by_workload_class(self):
        with TarController(self.file_name) as ctrl:
            json_nodes_text = ctrl.get_file_content(self.json_pods_path)
            pods_json = json.loads(json_nodes_text)
            pods_by_workload_class = {}
            for i in range(len(deep_get(pods_json, ["items"], []))):
                name = deep_get(pods_json, ["items", i, "metadata", "name"])
                
                workdload_class = deep_get(pods_json, ["items", i, "metadata", "labels", "workload.sas.com/class"], "undefined")
                
                if workdload_class in pods_by_workload_class.keys():
                    pods_by_workload_class[workdload_class].append(name)
                else:
                    pods_by_workload_class[workdload_class] = [name]
        
        return pods_by_workload_class
    
    def get_pod_container_log(self, pod, container):
        """
        Returns log file content of the container in a pod
        
        Sample input:
            pod: sas-analytics-events-5474d974-shwm7
            container: sas-start-sequencer
        """
        with TarController(self.file_name) as ctrl:
            pod_container_log_path = f"{self.pods_log_path}/{pod}_{container}.log"
            pod_container_log = ctrl.get_file_content(pod_container_log_path)
            
            return pod_container_log