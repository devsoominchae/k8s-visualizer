# tar_controller.py


import tarfile

class TarController:
    def __init__(self, tgz_path):
        self.tgz_path = tgz_path
        self.tar = None

    def __enter__(self):
        """Allows use of 'with TarController(...) as ctrl:'"""
        self.tar = tarfile.open(self.tgz_path, "r:gz")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.tar:
            self.tar.close()
    
    def file_exists_in_tar(self, file_to_find):
        with tarfile.open(self.tgz_path, "r:*") as tar:
            # getnames() returns a list of all member names
            if file_to_find in tar.getnames():
                return True
        return False

    def list_files_in_dir(self, folder_path=""):
        """Lists files inside a specific folder within the archive."""
        # 1. Get all paths from the tarball
        if not self.file_exists_in_tar(folder_path):
            folder_path = folder_path.replace("./", "")
        if not self.tar:
            with tarfile.open(self.tgz_path, "r:gz") as tar:
                all_names = tar.getnames()
        else:
            all_names = self.tar.getnames()

        # 2. If no folder_path is provided, return everything
        if not folder_path:
            return all_names

        # 3. Filter names that start with the folder_path
        # We ensure folder_path ends with '/' to avoid matching 'folder_backup' when looking for 'folder'
        search_prefix = folder_path.strip("/") + "/"
        
        contents = [
            name for name in all_names 
            if name.startswith(search_prefix) and name != search_prefix
        ]
        
        return contents
    
    def get_file_content(self, internal_path, as_text=True):
        """
        Reads any file's content.
        :param as_text: If True, returns a string (UTF-8). If False, returns raw bytes.
        """
        if not self.file_exists_in_tar(internal_path):
            internal_path = internal_path.replace("./", "")
        opened_locally = False
        if not self.tar:
            self.tar = tarfile.open(self.tgz_path, "r:gz")
            opened_locally = True

        try:
            file_obj = self.tar.extractfile(internal_path)
            if file_obj:
                content = file_obj.read()
                return content.decode('utf-8') if as_text else content
            return None
        except KeyError:
            print(f"File '{internal_path}' not found.")
            return None
        finally:
            if opened_locally:
                self.tar.close()
                self.tar = None