import type { BlobEntry } from "./types";

// Provisional: the 404 mapping, forceFileOverwrite and the upload-from-URL route
// are to be confirmed against a live platform.

export class AssetsRequestError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message ?? `Assets request failed with status ${status}`);
    this.name = "AssetsRequestError";
    this.status = status;
  }
}

// URLSearchParams writes a space as "+"; the platform expects "%20". A literal "+" is already "%2B".
const toQuery = (params: URLSearchParams) => params.toString().replace(/\+/g, "%20");

async function request(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, init);
  if (!response.ok) throw new AssetsRequestError(response.status);
  return response;
}

export async function listFolder(folderUrl: string, keyword?: string): Promise<BlobEntry[]> {
  const params = new URLSearchParams({ folderUrl });
  if (keyword?.trim()) params.set("keyword", keyword);

  const response = await fetch(`/api/assets?${toQuery(params)}`);
  if (response.status === 404) return [];
  if (!response.ok) throw new AssetsRequestError(response.status);

  const body = await response.json();
  return (body?.results as BlobEntry[] | undefined) ?? [];
}

export async function createFolder(parentUrl: string, name: string): Promise<void> {
  await request("/api/assets/folder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, parentUrl }),
  });
}

export async function uploadFile(folderUrl: string, file: File, opts?: { overwrite?: boolean }): Promise<void> {
  const params = new URLSearchParams({ folderUrl });
  if (opts?.overwrite) params.set("forceFileOverwrite", "true");

  const formData = new FormData();
  formData.append("file", file);
  await request(`/api/assets?${toQuery(params)}`, { method: "POST", body: formData });
}

export async function uploadFromUrl(folderUrl: string, url: string, name?: string): Promise<void> {
  const params = new URLSearchParams({ folderUrl, url });
  if (name !== undefined) params.set("name", name);
  await request(`/api/assets?${toQuery(params)}`, { method: "POST" });
}

export async function deleteEntries(urls: string[]): Promise<void> {
  const params = new URLSearchParams();
  urls.forEach((u) => params.append("urls", u));
  await request(`/api/assets?${toQuery(params)}`, { method: "DELETE" });
}
