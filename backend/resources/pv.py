# pv.py

from resources.resources import Resource

class PVInfo(Resource):
    def __init__(self, file_name):
        super().__init__(file_name)
        
        self.get_resource_path = f"./kubernetes/clusterwide/get/persistentvolumes.txt"
        self.describe_resource_path = f"./kubernetes/clusterwide/describe/persistentvolumes.txt"

        self.get_resource_names()
        