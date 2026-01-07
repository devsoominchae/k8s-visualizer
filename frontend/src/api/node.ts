/* ---------------- Node list ---------------- */
export async function fetchNodeNames(
  fileName: string
): Promise<string[]> {
  const res = await fetch(
    `/api/node/list_names?file_name=${encodeURIComponent(fileName)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch node names");
  }

  return res.json();
}

/* ---------------- Node table ---------------- */
export async function fetchNodeStatus(fileName: string) {
  const res = await fetch(
    `/api/node/status?file_name=${encodeURIComponent(fileName)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch nodes");
  }

  return res.json();
}

/* ---------------- Get node output ---------------- */
export async function fetchNodeGet(
  fileName: string
) {
  const res = await fetch(
    `/api/node/get_nodes?file_name=${encodeURIComponent(
      fileName
    )}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch get node output");
  }

  return res.json();
}


export async function fetchNodeDescribe(
  fileName: string
): Promise<Record<string, string>> {
  const res = await fetch(
    `/api/node/describe?file_name=${encodeURIComponent(fileName)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch node describe");
  }

  return res.json();
}


export async function fetchNodeDescribeSections(
  fileName: string
): Promise<Record<string, string[]>> {
  const res = await fetch(
    `/api/node/describe_section?file_name=${encodeURIComponent(fileName)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch node describe sections");
  }

  return res.json();
}
