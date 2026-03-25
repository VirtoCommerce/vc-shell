import { computed, ref, watch, Ref, ComputedRef } from "vue";
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
  items: Ref<AssetLike[]>;
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
  source: Ref<AssetLike[] | undefined | null>,
  options: UseAssetsManagerOptions,
): UseAssetsManagerReturn {
  const _loading = ref(false);

  // Internal ref owns the data. Synced from source via watch,
  // written back to source after every mutation.
  // This avoids reactivity issues when source is a WritableComputed
  // wrapping deeply nested properties (e.g. item.value.productData.assets).
  const _items = ref<AssetLike[]>(source.value ?? []);

  // Sync: source → internal (e.g. when parent reloads data)
  watch(
    () => source.value,
    (newVal) => {
      _items.value = newVal ?? [];
    },
    { deep: true, immediate: true },
  );

  /** Write internal state back to source */
  function _sync() {
    source.value = _items.value;
  }

  const items: Ref<AssetLike[]> = _items;
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
      _items.value = [..._items.value, ...successfulUploads];
      _sync();
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

    const keysToRemove = new Set(itemsToRemove.map((i) => i[assetKey]));
    _items.value = _items.value.filter((i) => !keysToRemove.has(i[assetKey]));
    _sync();
  }

  function reorder(newOrder: AssetLike[]): void {
    _items.value = newOrder.map((item) => ({ ...item }));
    _sync();
  }

  function updateItem(item: AssetLike): void {
    const index = _items.value.findIndex((existing) => existing[assetKey] === item[assetKey]);
    if (index !== -1) {
      const updated = [..._items.value];
      updated[index] = { ..._items.value[index], ...item };
      _items.value = updated;
      _sync();
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
