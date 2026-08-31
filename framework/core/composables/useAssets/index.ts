import { computed, ref, ComputedRef } from "vue";
import * as _ from "lodash-es";
import type { ICommonAsset } from "@core/types";
import { createLogger } from "@core/utilities";
import { uploadAssets } from "@core/composables/useAssetsManager/uploadAssets";

const logger = createLogger("use-assets");

export interface UseAssetsReturn {
  upload: (files: FileList, uploadPath: string, startingSortOrder?: number) => Promise<ICommonAsset[]>;
  remove: (filesToDelete: ICommonAsset[], initialAssetArr: ICommonAsset[]) => ICommonAsset[];
  edit: (updatedFiles: ICommonAsset[], initialAssetArr: ICommonAsset[]) => ICommonAsset[];
  loading: ComputedRef<boolean>;
}

/** @deprecated Use UseAssetsReturn instead */
export type IUseAssets = UseAssetsReturn;

export function useAssets(): UseAssetsReturn {
  const loading = ref(false);

  if (import.meta.env?.DEV) {
    console.warn(
      "[useAssets] is deprecated. Use useAssetsManager(ref, options) instead. " + "See migration guide #32.",
    );
  }

  async function upload(files: FileList, uploadPath: string, startingSortOrder?: number): Promise<ICommonAsset[]> {
    try {
      loading.value = true;

      return await uploadAssets<ICommonAsset>(files, { uploadPath, startingSortOrder });
    } catch (error) {
      logger.error("Upload failed:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function remove(filesToDelete: ICommonAsset[], initialAssetArr: ICommonAsset[], assetKey = "url"): ICommonAsset[] {
    try {
      loading.value = true;

      let updatedAssetArr = _.cloneDeep(initialAssetArr) || [];

      if (updatedAssetArr && updatedAssetArr.length && filesToDelete.length > 0) {
        updatedAssetArr = _.differenceWith(updatedAssetArr, filesToDelete, (x, y) => x[assetKey] === y[assetKey]);
      }

      return updatedAssetArr;
    } catch (error) {
      logger.error("Remove failed:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function edit(updatedFiles: ICommonAsset[], initialAssetArr: ICommonAsset[]): ICommonAsset[] {
    // When all items are passed (e.g. reorder), preserve the order of updatedFiles.
    // When a subset is passed (e.g. single asset edit), update in place within initial order.
    if (updatedFiles.length === initialAssetArr.length) {
      return updatedFiles.map((file) => ({ ...file }));
    }

    const updatedAssetArr = _.cloneDeep(initialAssetArr) || [];

    if (updatedAssetArr && updatedAssetArr.length) {
      updatedFiles.forEach((updatedFile) => {
        const index = updatedAssetArr.findIndex((asset) => asset.url === updatedFile.url);
        if (index !== -1) {
          updatedAssetArr[index] = { ...updatedAssetArr[index], ...updatedFile };
        }
      });
    }

    return updatedAssetArr;
  }

  return {
    upload,
    remove,
    edit,
    loading: computed(() => loading.value),
  };
}
