# test_main.py
# $ pytest -v

import os
import pytest

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)
UPLOAD_DIR = "/tmp"
TEST_FILE_NAME = "/home/admin/sample/CS0343372_20251215_100140.tgz"
TEST_CONTENT_PATH = "/home/admin/k8s-visualizer/backend/test"

def test_upload_delete():
    """Test uploading a file and then deleting it."""
    file_name = "test_archive.tgz"
    file_content = b"fake tarball content"
    
    response = client.post(
        "/upload",
        files={"file": (file_name, file_content, "application/x-gtar")}
    )
    assert response.status_code == 200
    assert file_name in response.json()["info"]

    assert os.path.exists(f"{UPLOAD_DIR}/{file_name}")

    del_response = client.delete(f"/delete/{file_name}")
    assert del_response.status_code == 200
    assert "deleted successfully" in del_response.json()["message"]

    # 4. Verify file is gone
    assert not os.path.exists(f"{UPLOAD_DIR}/{file_name}")

def test_delete_nonexistent_file():
    """Test that deleting a missing file returns a 400 (due to your assertion)."""
    response = client.delete("/delete/imaginary_file.tgz")
    assert response.status_code == 400
    assert "not found" in response.json()["detail"]



def test_get_node_status():
    params = {
        "file_name": TEST_FILE_NAME
    }
    response = client.get(
        "/api/node/status",
        params = params
    )
    
    assert response.status_code == 200

def test_get_available_resource_types():
    
    params = {
        "file_name": TEST_FILE_NAME
    }
    response = client.get(
        "/api/resource/avail_types",
        params = params
    )
    
    assert response.status_code == 200
    
def test_get_resource_describe():
    params = {
        "file_name": TEST_FILE_NAME,
        "resource_name": "deployments"
    }
    response = client.get(
        "/api/resource/describe",
        params = params
    )
    
    assert response.status_code == 200
    
def test_get_resource():
    params = {
        "file_name": TEST_FILE_NAME,
        "resource_name": "deployments"
    }
    response = client.get(
        "/api/resource/status",
        params = params
    )
    
    assert response.status_code == 200
    
def test_get_resource_describe_section():
    params = {
        "file_name": TEST_FILE_NAME,
        "resource_name": "deployments"
    }
    response = client.get(
        "/api/resource/describe_section",
        params = params
    )
    
    assert response.status_code == 200
    
def test_get_resource_names():
    params = {
        "file_name": TEST_FILE_NAME,
        "resource_name": "deployments"
    }
    response = client.get(
        "/api/resource/list_names",
        params = params
    )
    
    assert response.status_code == 200
    
def test_get_available_resource_types():
    params = {
        "file_name": TEST_FILE_NAME,
        "resource_name": "deployments"
    }
    response = client.get(
        "/api/resource/avail_types",
        params = params
    )
    
    assert response.status_code == 200

def test_get_env_info_dict():
    params = {
        "file_name": TEST_FILE_NAME
    }
    response = client.get(
        "/api/env/info",
        params = params
    )
    
    assert response.status_code == 200

def test_get_pv_describe():
    params = {
        "file_name": TEST_FILE_NAME
    }
    response = client.get(
        "/api/pvc/describe_pv",
        params = params
    )
    
    assert response.status_code == 200

def test_get_pod_containers():
    params = {
        "file_name": TEST_FILE_NAME
    }
    response = client.get(
        "/api/pod/containers",
        params = params
    )
    
    assert response.status_code == 200

def test_parse_log():
    params = {
        "file_name": TEST_FILE_NAME,
        "pod": "sas-configuration-6798fcdb8c-cc6dc",
        "container": "sas-configuration"
    }
    response = client.get(
        "/api/pod/logs",
        params = params
    )
    
    assert response.status_code == 200


    