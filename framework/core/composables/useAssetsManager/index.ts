import { computed, ref, watch, Ref, ComputedRef } from "vue";
import { uploadAssets, DEFAULT_UPLOAD_CONCURRENCY } from "@core/composables/useAssetsManager/uploadAssets";
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

/**
 * Normalizes a list's `sortOrder`: orders items by their current `sortOrder`
 * (items without one are kept stable at the end) and reassigns a clean
 * sequential `sortOrder` (0..n). Guarantees every item has a `sortOrder` on
 * load — the source may arrive without it. Idempotent: normalizing an
 * already-normalized list yields the same order and values.
 */
function normalizeSortOrder(list: AssetLike[]): AssetLike[] {
  return list
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const ao = a.item.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.item.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return ao === bo ? a.index - b.index : ao - bo;
    })
    .map(({ item }, index) => ({ ...item, sortOrder: index }));
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
  const _items = ref<AssetLike[]>(normalizeSortOrder(source.value ?? []));

  // Sync: source → internal (e.g. when parent reloads data). Normalize sortOrder
  // on the way in so items always carry a clean sequential sortOrder, even when
  // the source provides them without one. Idempotent, so it does not loop on the
  // writeback that mutations perform via _sync().
  watch(
    () => source.value,
    (newVal) => {
      _items.value = normalizeSortOrder(newVal ?? []);
    },
    { deep: true, immediate: true },
  );

  /** Write internal state back to source */
  function _sync() {
    source.value = _items.value;
  }

  const items: Ref<AssetLike[]> = _items;
  const loading = computed(() => _loading.value);

  const concurrency = options.concurrency ?? DEFAULT_UPLOAD_CONCURRENCY;
  const assetKey = options.assetKey ?? "url";

  async function upload(files: FileList, startingSortOrder?: number): Promise<void> {
    try {
      _loading.value = true;

      const uploadPath = options.uploadPath();

      const successfulUploads = await uploadAssets<AssetLike>(files, { uploadPath, startingSortOrder, concurrency });
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
