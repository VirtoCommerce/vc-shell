/**
 * The asset upload transport, shared by `useAssets` and `useAssetsManager`.
 *
 * The two composables differ only in who owns the resulting array — the caller
 * or the composable — but each carried its own copy of the POST, the sortOrder
 * assignment and the batching. One endpoint with two places to change it.
 */

/** Default number of uploads in flight at once. */
export const DEFAULT_UPLOAD_CONCURRENCY = 4;

export interface UploadAssetsOptions {
  /** Folder the files are uploaded into. A leading slash is optional. */
  uploadPath: string;
  /**
   * `sortOrder` of the last existing item. Uploads continue the sequence from
   * there; omitted or negative means every upload gets 0.
   */
  startingSortOrder?: number;
  /** Uploads in flight at once. Defaults to {@link DEFAULT_UPLOAD_CONCURRENCY}. */
  concurrency?: number;
}

/** Shape the endpoint returns and both composables narrow to their own type. */
interface UploadedAsset {
  url?: string;
  size?: number;
  createdDate?: Date;
  sortOrder?: number;
}

async function uploadOne<T extends UploadedAsset>(
  file: File,
  uploadPath: string,
  index: number,
  startingSortOrder?: number,
): Promise<T | null> {
  const formData = new FormData();
  formData.append("file", file);

  // The path is interpolated after a slash, so a leading one would produce
  // `folderUrl=//path`.
  const normalizedPath = uploadPath.startsWith("/") ? uploadPath.slice(1) : uploadPath;

  const result = await fetch(`/api/assets?folderUrl=/${normalizedPath}`, {
    method: "POST",
    body: formData,
  });

  const response = await result.json();
  if (!response?.length) return null;

  const uploadedFile = response[0] as T;
  uploadedFile.createdDate = new Date();
  uploadedFile.sortOrder =
    startingSortOrder !== undefined && startingSortOrder >= 0 ? startingSortOrder + index + 1 : 0;
  // The endpoint returns the URL percent-encoded; everything downstream expects it decoded.
  uploadedFile.url = uploadedFile.url ? decodeURI(uploadedFile.url) : "";

  if ("size" in uploadedFile) {
    uploadedFile.size = file.size;
  }

  return uploadedFile;
}

/**
 * Upload `files`, preserving their order in the returned array.
 *
 * Files are sent in batches of `concurrency`. A file the endpoint answers
 * without a body is dropped from the result rather than failing the batch — a
 * partial upload is reported by returning fewer assets than files.
 */
export async function uploadAssets<T extends UploadedAsset>(
  files: FileList | File[],
  { uploadPath, startingSortOrder, concurrency = DEFAULT_UPLOAD_CONCURRENCY }: UploadAssetsOptions,
): Promise<T[]> {
  const fileArray = Array.from(files);
  const results: (T | null)[] = [];

  for (let i = 0; i < fileArray.length; i += concurrency) {
    const batch = fileArray.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((file, batchIndex) => uploadOne<T>(file, uploadPath, i + batchIndex, startingSortOrder)),
    );
    results.push(...batchResults);
  }

  return results.filter((asset): asset is T => asset !== null);
}
