# resource.py

import os
import difflib

from resources.env import EnvInfo

from utils.tar_controller import TarController

K8S_ABBREVIATIONS = {
    "po": "pods",
    "deploy": "deployments",
    "svc": "services",
    "ns": "namespaces",
    "cm": "configmaps",
    "sec": "secrets",
    "ing": "ingresses",
    "pv": "persistentvolumes",
    "pvc": "persistentvolumeclaims",
    "sts": "statefulsets",
    "ds": "daemonsets",
    "no": "nodes",
    "rs": "replicasets",
    "cj": "cronjobs"
}

class Resource:
    def __init__(self, file_name, resource_name=""):
        self.file_name = file_name
        self.ctrl = TarController(self.file_name)
        
        self.env_info = EnvInfo(file_name)
        self.env_info_dict = self.env_info.get_env_info_dict()
        self.namespace = self.env_info_dict["namespace"]
        self.get_folder_path = f"./kubernetes/{self.namespace}/get"
        
        if resource_name:
            self.get_available_resource_types()
            if resource_name in K8S_ABBREVIATIONS.keys():
                resource_name = K8S_ABBREVIATIONS[resource_name]
            elif resource_name not in self.available_resource_types:
                resource_name = difflib.get_close_matches(resource_name, self.available_resource_types, n=1, cutoff=0.6)[0]
                print(f"{resource_name} is not in available resources list. Using closest match: {resource_name}")
                
            self.get_resource_path = f"./kubernetes/{self.namespace}/get/{resource_name}.txt"
            self.describe_resource_path = f"./kubernetes/{self.namespace}/describe/{resource_name}.txt"
                
            self.names = self.get_resource_names()
    
    def get_available_resource_types(self):
        available_resource_paths = self.ctrl.list_files_in_dir(self.get_folder_path)
        self.available_resource_types = [os.path.basename(os.path.splitext(i)[0]) for i in available_resource_paths]
            
        return self.available_resource_types
    
    def get_resource_names(self):
        get_resource_text = self.ctrl.get_file_content(self.get_resource_path)
        self.names = self.get_names_from_get_output(get_resource_text)

        return self.names
    
    def get_resource_status(self):
        get_resource_text = self.ctrl.get_file_content(self.get_resource_path)            
        get_resource = self.parse_get_output(get_resource_text)
            
        return get_resource

    def get_resource_describe(self):
        describe_resource_text = self.ctrl.get_file_content(self.describe_resource_path)
        
        describe = self.parse_describe_output(describe_resource_text)
        
        describe_sections = []
        for each_describe in describe:
            describe_by_section = {}
            for line in each_describe.split('\n'):
                if not line.startswith(' ') and line:
                    section_name = line.split(':')[0]
                if section_name not in describe_by_section.keys():
                    describe_by_section[section_name] = line
                else:
                    describe_by_section[section_name] = "\n".join((describe_by_section[section_name], line))
            describe_sections.append(describe_by_section)

        describe_section_dict = dict(zip(self.names, describe_sections))
        
        return describe_section_dict

    
    def parse_get_output(self, get_text):
        get_output = {}
        columns = []
        get_text_split = get_text.split('\n')
        for line in get_text_split:
            if line.startswith("NAME"):
                columns = [i.strip() for i in line.split("  ")[1:] if i]
                continue
            line_split = [i.strip() for i in line.split("  ") if i]
            if line_split and columns:
                name = line_split[0]
                get_output[name] = dict(zip(columns, line_split[1:]))
        
        return get_output

    def get_names_from_get_output(self, get_text):
        names = []
        get_text_split = get_text.split('\n')
        for line in get_text_split:
            if line.startswith("NAME"):
                columns = [i.strip() for i in line.split("  ")[1:] if i]
                continue
            line_split = [i.strip() for i in line.split("  ") if i]
            if line_split and columns:
                name = line_split[0]
                names.append(name)
        
        return names
    
    def parse_describe_output(self, describe_text):
        describe_split_text = describe_text.split('\n')
        describe = []
        current_group = ""
        name_line = ""
        
        for line in describe_split_text:
            if line.startswith("Name:"):
                name_line = line
                if current_group:
                    describe.append(current_group)
                    current_group = ""
            else:
                if name_line:
                    current_group = '\n'.join([name_line, line])
                else:
                    current_group = '\n'.join([current_group, line])
                name_line = ""
        
        if current_group:
            describe.append(current_group)
        
        return describe