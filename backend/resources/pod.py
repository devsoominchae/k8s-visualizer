# pod.py

import os
import yaml
import json

from collections import defaultdict

from utils.dict_utils import deep_get
from resources.resources import Resource


class PodInfo(Resource):
    def __init__(self, file_name):
        super().__init__(file_name)
        
        self.get_resource_path = f"./kubernetes/{self.namespace}/get/pods.txt"
        self.describe_resource_path = f"./kubernetes/{self.namespace}/describe/pods.txt"
        self.json_pods_path = f"./kubernetes/{self.namespace}/json/pods.json"
        self.yaml_pods_path = f"./kubernetes/{self.namespace}/yaml/pods.yaml"
        self.pods_log_path = f"./kubernetes/{self.namespace}/logs"
        
        self.get_resource_names()
    
    def get_pod_containers(self):
        pods_json = ""
        
        if self.ctrl.file_exists_in_tar(self.json_pods_path):
            json_nodes_text = self.ctrl.get_file_content(self.json_pods_path)
            pods_json = json.loads(json_nodes_text)
        else:
            node_yaml_text = self.ctrl.get_file_content(self.yaml_pods_path)
            pods_json = yaml.safe_load(node_yaml_text)
            
        pod_containers = {}
        for i in range(len(deep_get(pods_json, ["items"], []))):
            name = deep_get(pods_json, ["items", i, "metadata", "name"])
            
            init_containers = [j["name"] for j in deep_get(pods_json, ["items", i, "status", "initContainerStatuses"]) or ""]
            containers = [j["name"] for j in deep_get(pods_json, ["items", i, "status", "containerStatuses"]) or ""]
            
            pod_containers[name] = init_containers + containers
        
        return pod_containers
    
    def get_pods_by_workload_class(self):
        if self.ctrl.file_exists_in_tar(self.json_pods_path):
            pods_json_text = self.ctrl.get_file_content(self.json_pods_path)
            pods_json = json.loads(pods_json_text)
        else:
            pods_yaml_text = self.ctrl.get_file_content(self.yaml_pods_path)
            pods_json = yaml.safe_load(pods_yaml_text)
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
        log_line_list = []
        pod_log_path  = f"{self.pods_log_path}/{pod}_{container}.log"
        log_content = self.ctrl.get_file_content(pod_log_path)
        if not log_content:
            return [f"No logs in file: {os.path.basename(pod_log_path)}"]
        
        for log_line in log_content.splitlines():
            line = log_line.strip()
            if line:
                try:
                    log_line_list.append(json.loads(line))
                except json.JSONDecodeError:
                    log_line_list.append(line)
  
        return log_line_list