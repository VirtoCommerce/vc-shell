import { computed, ref, Ref, ComputedRef } from "vue";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-assets-manager");

export interface AssetLike {
  url?: string;
  name?: string;
  sortOrder?: number;
  [key: string]: any;
}

export interface UseAssetsManagerOptions {
  uploadPath: () => string;
  confirmRemove?: () => Promise<boolean> | boolean;
  assetKey?: string;
  concurrency?: number;
}

export interface UseAssetsManagerReturn {
  items: ComputedRef<AssetLike[]>;
  upload: (files: FileList, startingSortOrder?: number) => Promise<void>;
  remove: (item: AssetLike) => Promise<void>;
  removeMany: (items: AssetLike[]) => Promise<void>;
  reorder: (items: AssetLike[]) => void;
  updateItem: (item: AssetLike) => void;
  loading: ComputedRef<boolean>;
}

/** Default concurrency for parallel uploads */
const DEFAULT_CONCURRENCY = 4;

/**
 * Uploads a single file and returns the asset
 */
async function uploadSingleFile(
  file: File,
  uploadPath: string,
  index: number,
  startingSortOrder?: number,
): Promise<AssetLike | null> {
  const formData = new FormData();
  formData.append("file", file);

  const normalizedPath = uploadPath.startsWith("/") ? uploadPath.slice(1) : uploadPath;
  const result = await fetch(`/api/assets?folderUrl=/${normalizedPath}`, {
    method: "POST",
    body: formData,
  });

  const response = await result.json();

  if (response?.length) {
    const uploadedFile = response[0];
    uploadedFile.createdDate = new Date();
    uploadedFile.sortOrder =
      startingSortOrder !== undefined && startingSortOrder >= 0 ? startingSortOrder + index + 1 : 0;
    uploadedFile.url = uploadedFile.url ? decodeURI(uploadedFile.url) : "";

    if ("size" in uploadedFile) {
      uploadedFile.size = file.size;
    }

    return uploadedFile;
  }

  return null;
}

/**
 * Processes items in batches with concurrency limit
 */
async function processBatched<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((item, batchIndex) => processor(item, i + batchIndex)));
    results.push(...batchResults);
  }

  return results;
}

export function useAssetsManager(
  assetsRef: Ref<AssetLike[]>,
  options: UseAssetsManagerOptions,
): UseAssetsManagerReturn {
  const _loading = ref(false);

  const items = computed(() => assetsRef.value ?? []);
  const loading = computed(() => _loading.value);

  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
  const assetKey = options.assetKey ?? "url";

  async function upload(files: FileList, startingSortOrder?: number): Promise<void> {
    try {
      _loading.value = true;

      const fileArray = Array.from(files);
      const uploadPath = options.uploadPath();

      const uploadResults = await processBatched(
        fileArray,
        (file, index) => uploadSingleFile(file, uploadPath, index, startingSortOrder),
        concurrency,
      );

      const successfulUploads = uploadResults.filter((asset): asset is AssetLike => asset !== null);
      assetsRef.value = [...(assetsRef.value ?? []), ...successfulUploads];
    } catch (error) {
      logger.error("Upload failed:", error);
      throw error;
    } finally {
      _loading.value = false;
    }
  }

  async function remove(item: AssetLike): Promise<void> {
    await removeMany([item]);
  }

  async function removeMany(itemsToRemove: AssetLike[]): Promise<void> {
    if (options.confirmRemove) {
      const confirmed = await options.confirmRemove();
      if (!confirmed) return;
    }

    const keysToRemove = new Set(itemsToRemove.map((item) => item[assetKey]));
    assetsRef.value = (assetsRef.value ?? []).filter((item) => !keysToRemove.has(item[assetKey]));
  }

  function reorder(newOrder: AssetLike[]): void {
    assetsRef.value = newOrder.map((item) => ({ ...item }));
  }

  function updateItem(item: AssetLike): void {
    const index = assetsRef.value.findIndex((existing) => existing[assetKey] === item[assetKey]);
    if (index !== -1) {
      const updated = [...assetsRef.value];
      updated[index] = { ...assetsRef.value[index], ...item };
      assetsRef.value = updated;
    }
  }

  return {
    items,
    upload,
    remove,
    removeMany,
    reorder,
    updateItem,
    loading,
  };
}
