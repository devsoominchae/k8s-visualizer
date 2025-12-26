export async function fetchEnvInfo(fileName: string) {
    const res = await fetch(
      `/api/env/info?file_name=${encodeURIComponent(fileName)}`
    );
  
    if (!res.ok) {
      throw new Error("Failed to fetch env info");
    }
  
    return res.json();
  }
  