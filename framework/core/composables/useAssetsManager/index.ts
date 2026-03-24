import { computed, Ref, ComputedRef } from "vue";
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

export function useAssetsManager(
  assetsRef: Ref<AssetLike[]>,
  options: UseAssetsManagerOptions,
): UseAssetsManagerReturn {
  const _loading = false;

  const items = computed(() => assetsRef.value);
  const loading = computed(() => _loading);

  async function upload(_files: FileList, _startingSortOrder?: number): Promise<void> {
    // TODO: implement
  }

  async function remove(_item: AssetLike): Promise<void> {
    // TODO: implement
  }

  async function removeMany(_items: AssetLike[]): Promise<void> {
    // TODO: implement
  }

  function reorder(_items: AssetLike[]): void {
    // TODO: implement
  }

  function updateItem(_item: AssetLike): void {
    // TODO: implement
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
