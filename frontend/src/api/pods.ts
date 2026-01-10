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