import type { BlobEntry } from "./types";

// The API may return a path relative to the platform; always hand out an absolute URL.
export function absoluteUrl(url: string): string {
  return new URL(url, window.location.origin).href;
}

export function download(entry: BlobEntry): void {
  try {
    const link = document.createElement("a");
    link.href = entry.url;
    link.download = entry.name;
    // A cross-origin url ignores `download` and navigates; a new tab keeps the admin open.
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch {
    window.open(entry.url, "_blank", "noopener");
  }
}
