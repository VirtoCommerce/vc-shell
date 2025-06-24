const fileThumbnails = [
  { image: "bi-filetype-pdf", extensions: ["pdf"] },
  { image: "bi-filetype-doc", extensions: ["doc", "docx"] },
  { image: "bi-filetype-xls", extensions: ["xls", "xlsx"] },
  { image: "bi-filetype-ppt", extensions: ["ppt", "pptx"] },
  { image: "bi-filetype-csv", extensions: ["csv"] },
  { image: "bi-file-zip", extensions: ["zip"] },
  { image: "bi-file-music", extensions: ["mp3", "aac"] },
  { image: "bi-file-play", extensions: ["mp4", "avi"] },
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
  if (!name) return "bi-file-earmark";
  return (
    fileThumbnails.find((thumb) => thumb.extensions.some((ext) => ext === getExtension(name)))?.image ||
    "bi-file-earmark"
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
