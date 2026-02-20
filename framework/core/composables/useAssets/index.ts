import { computed, ref, ComputedRef } from "vue";
import * as _ from "lodash-es";
import { ICommonAsset } from "@core/types";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-assets");

/** Maximum number of concurrent uploads */
const MAX_CONCURRENT_UPLOADS = 4;

export interface IUseAssets {
  upload: (files: FileList, uploadPath: string, startingSortOrder?: number) => Promise<ICommonAsset[]>;
  remove: (filesToDelete: ICommonAsset[], initialAssetArr: ICommonAsset[]) => ICommonAsset[];
  edit: (updatedFiles: ICommonAsset[], initialAssetArr: ICommonAsset[]) => ICommonAsset[];
  loading: ComputedRef<boolean>;
}

/**
 * Uploads a single file and returns the asset
 */
async function uploadSingleFile(
  file: File,
  uploadPath: string,
  index: number,
  startingSortOrder?: number,
): Promise<ICommonAsset | null> {
  const formData = new FormData();
  formData.append("file", file);

  const result = await fetch(`/api/assets?folderUrl=/${uploadPath}`, {
    method: "POST",
    body: formData,
  });

  const response = await result.json();

  if (response?.length) {
    const uploadedFile = response[0];
    uploadedFile.createdDate = new Date();
    uploadedFile.sortOrder = startingSortOrder !== undefined && startingSortOrder >= 0 ? startingSortOrder + index + 1 : 0;
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

export function useAssets(): IUseAssets {
  const loading = ref(false);

  async function upload(files: FileList, uploadPath: string, startingSortOrder?: number): Promise<ICommonAsset[]> {
    try {
      loading.value = true;

      const fileArray = Array.from(files);

      // Upload files in parallel batches
      const uploadResults = await processBatched(
        fileArray,
        (file, index) => uploadSingleFile(file, uploadPath, index, startingSortOrder),
        MAX_CONCURRENT_UPLOADS,
      );

      // Filter out null results and return successful uploads
      return uploadResults.filter((asset): asset is ICommonAsset => asset !== null);
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
