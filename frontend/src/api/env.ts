/* Env Info */

export async function fetchEnvInfo(fileName: string) {
  const res = await fetch(
    `/api/env/info?file_name=${encodeURIComponent(fileName)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch env info");
  }

  return res.json();
}

/*Pod Info*/

export async function fetchPodWorkloadClass(fileName: string) {
  const res = await fetch(
    `/api/pod/workload_class?file_name=${encodeURIComponent(fileName)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch pod workload class");
  }

  return res.json();
}
