/* ---------------- Node list ---------------- */
export async function fetchComponentStatus(
    fileName: string,
    component: string
): Promise<string[]> {
    const res = await fetch(
        `/api/resource/status?file_name=${encodeURIComponent(fileName)}&resource_name=${encodeURIComponent(component)}`
    );

    if (!res.ok) {
        throw new Error("Failed to fetch component status");
    }

    return res.json();
}

export async function fetchComponentDescribe(
    fileName: string,
    component: string
): Promise<string[]> {
    const res = await fetch(
        `/api/resource/describe?file_name=${encodeURIComponent(fileName)}&resource_name=${encodeURIComponent(component)}`
    );

    if (!res.ok) {
        throw new Error("Failed to fetch component describe");
    }

    return res.json();
}