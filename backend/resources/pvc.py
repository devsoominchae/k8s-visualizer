# pvc.py

from resources.pv import PVInfo
from resources.resources import Resource

class PVCInfo(Resource):
    def __init__(self, file_name):
        super().__init__(file_name)
        
        self.pv_info = PVInfo(file_name)
        
        self.get_resource_path = f"./kubernetes/{self.namespace}/get/persistentvolumeclaims.txt"
        self.describe_resource_path = f"./kubernetes/{self.namespace}/describe/persistentvolumeclaims.txt"

        self.get_resource_names()
    
    def get_pv_describe(self):
        pv_describe_clusterwide = self.pv_info.get_resource_describe()
        pvc_status = self.get_resource_status()
        pvc_pv_mapping = {pvc: pvc_status[pvc]['VOLUME'] for pvc in pvc_status}
        
        pv_describe = {pvc: pv_describe_clusterwide[pvc_pv_mapping[pvc]] for pvc in self.names}
        
        return pv_describe