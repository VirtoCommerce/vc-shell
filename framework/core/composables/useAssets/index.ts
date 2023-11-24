import { Ref, computed, ref, ComputedRef } from "vue";
import * as _ from "lodash-es";
import { useUser } from "../useUser";
import { ICommonAsset } from "../../types";

export interface IUseAssets {
  upload: (files: FileList, uploadPath: string, startingSortOrder?: number) => Promise<ICommonAsset[]>;
  remove: (filesToDelete: ICommonAsset[], initialAssetArr: ICommonAsset[]) => ICommonAsset[];
  edit: (updatedFiles: ICommonAsset[], initialAssetArr: ICommonAsset[]) => ICommonAsset[];
  loading: ComputedRef<boolean>;
}

export function useAssets(): IUseAssets {
  const { getAccessToken } = useUser();
  const loading = ref(false);

  async function upload(files: FileList, uploadPath: string, startingSortOrder?: number): Promise<ICommonAsset[]> {
    try {
      loading.value = true;

      const uploadedAssets: Ref<ICommonAsset[]> = ref([]);
      const authToken = await getAccessToken();

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const result = await fetch(`/api/assets?folderUrl=/${uploadPath}`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const response = await result.json();

        if (response?.length) {
          const file = response[0];
          file.createdDate = new Date();
          file.sortOrder = startingSortOrder !== undefined && startingSortOrder >= 0 ? startingSortOrder + i + 1 : 0;

          if ("size" in file) {
            file.size = files[i].size;
          }

          uploadedAssets.value.push(file);
        }
      }

      return uploadedAssets.value;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function remove(filesToDelete: ICommonAsset[], initialAssetArr: ICommonAsset[]): ICommonAsset[] {
    try {
      loading.value = true;

      let updatedAssetArr = _.cloneDeep(initialAssetArr) || [];

      if (updatedAssetArr && updatedAssetArr.length && filesToDelete.length > 0) {
        updatedAssetArr = _.differenceWith(updatedAssetArr, filesToDelete, (x, y) => x.url === y.url);
      }

      return updatedAssetArr;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function edit(updatedFiles: ICommonAsset[], initialAssetArr: ICommonAsset[]): ICommonAsset[] {
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
