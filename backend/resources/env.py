# env.py

from utils.tar_controller import TarController

class EnvInfo:
    def __init__(self, file_name):
        self.file_name = file_name
        self.ctrl = TarController(self.file_name)
        
        self.get_k8s_info_log_path = ["./.get-k8s-info/get-k8s-info.log",
                                      ".get-k8s-info/get-k8s-info.log"]
    
    def get_env_info_dict(self):
        parsers = {
            "Namespace:": "namespace",
            "USER_NS:": "namespace",
            "Version:": "version",
            "Order:": "order",
            "Site Number:": "site_number",
            "License Expires:": "license_expires",
            "CAS Mode:": "cas_mode",
            "CAS Disk Cache:": "cas_disk_cache",
            "SAS Work": "sas_work",
            "PostgreSQL Database:": "postgresql_db",
            "TLS Mode:": "tls_mode",
            "Certificate Generator:": "cert_generator",
            "Ingress Host:": "ingress_host",
            "Ingress Certificate:": "ingress_cert"
        }

        self.env_info_dict = {}
        content = None
        for get_k8s_info_log_path in self.get_k8s_info_log_path:                
            temp_content = self.ctrl.get_file_content(get_k8s_info_log_path)
            if temp_content is not None:
                content = temp_content
        
        for line in content.splitlines():
            for prefix, key in parsers.items():
                if line.startswith(prefix) and key not in self.env_info_dict.keys():
                    self.env_info_dict[key] = line[line.find(":") + 1:].strip()
                    break
            
            
        assert 'namespace' in self.env_info_dict.keys(), "The get-k8s-info output file is inavlid."
        return self.env_info_dict
