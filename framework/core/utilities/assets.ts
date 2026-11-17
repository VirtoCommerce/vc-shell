const imageExtensions = new Set(["png", "jpg", "jpeg", "svg", "gif"]);

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase();
}

function isImage(name: string | undefined) {
  if (!name) return false;
  return imageExtensions.has(getExtension(name) ?? "");
}

function readableSize(bytes: number | undefined, decimals = 2) {
  if (!bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const extensionColors: Record<string, string> = {
  pdf: "#e74c3c",
  doc: "#2b579a",
  docx: "#2b579a",
  xls: "#217346",
  xlsx: "#217346",
  ppt: "#d35230",
  pptx: "#d35230",
  csv: "#16a085",
  zip: "#f39c12",
  mp3: "#e67e22",
  aac: "#e67e22",
  mp4: "#8e44ad",
  avi: "#8e44ad",
};

function getExtensionColor(name: string | undefined): string {
  if (!name) return "var(--neutrals-400)";
  const ext = getExtension(name) ?? "";
  return extensionColors[ext] ?? "var(--neutrals-400)";
}

function getExtensionLabel(name: string | undefined): string {
  if (!name) return "FILE";
  return (getExtension(name) ?? "FILE").toUpperCase();
}

// The API may return a path relative to the platform; always hand out an absolute URL.
function absoluteUrl(url: string): string {
  return new URL(url, window.location.origin).href;
}

function downloadFile({ url, name }: { url: string; name?: string }): void {
  try {
    const link = document.createElement("a");
    link.href = url;
    if (name) link.download = name;
    // A cross-origin url ignores `download` and navigates; a new tab keeps the admin open.
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

export { isImage, readableSize, getExtensionColor, getExtensionLabel, absoluteUrl, downloadFile };
