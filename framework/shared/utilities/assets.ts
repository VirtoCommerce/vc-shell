const fileThumbnails = [
  { image: "fas fa-file-pdf", extensions: ["pdf"] },
  { image: "fas fa-file-word", extensions: ["doc", "docx"] },
  { image: "fas fa-file-excel", extensions: ["xls", "xlsx"] },
  { image: "fas fa-file-powerpoint", extensions: ["ppt", "pptx"] },
  { image: "fas fa-file-csv", extensions: ["csv"] },
  { image: "fas fa-file-archive", extensions: ["zip"] },
  { image: "fas fa-file-music", extensions: ["mp3", "aac"] },
  { image: "fas fa-file-video", extensions: ["mp4", "avi"] },
];

const imageExtensions = new Set(["png", "jpg", "jpeg", "svg", "gif"]);

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase();
}

function isImage(name: string | undefined) {
  if (!name) return false;
  return imageExtensions.has(getExtension(name) ?? "");
}

function getFileThumbnail(name: string | undefined) {
  if (!name) return "fas fa-file";
  return (
    fileThumbnails.find((thumb) => thumb.extensions.some((ext) => ext === getExtension(name)))?.image || "fas fa-file"
  );
}

function readableSize(bytes: number | undefined, decimals = 2) {
  if (!bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export { isImage, getFileThumbnail, readableSize };
