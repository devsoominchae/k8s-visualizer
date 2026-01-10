// frontend/src/api/pods.ts

export async function fetchPodContainers(fileName: string) {
    const res = await fetch(
        `/api/pod/containers?file_name=${encodeURIComponent(fileName)}`
    );

    if (!res.ok) {
        throw new Error("Failed to fetch pod containers");
    }

    return res.json();
}

export async function fetchPodContainerLog(
    fileName: string,
    podName: string,
    containerName: string
) {
    const res = await fetch(
        `/api/pod/logs?file_name=${encodeURIComponent(fileName)}&pod=${encodeURIComponent(podName)}&container=${encodeURIComponent(containerName)}`
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch logs for container: ${containerName}`);
    }
    return res.json();
}