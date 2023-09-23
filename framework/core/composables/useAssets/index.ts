import { Ref, computed, ref } from "vue";
import { useUser } from "../useUser";
import * as _ from "lodash-es";

interface GenericAsset {
  createdDate?: Date;
  sortOrder?: number;
  id?: string;
  url?: string;
}

interface IUseAssets<T, A> {
  loading: Ref<boolean>;
  upload: (files: FileList, assetArr: T[], uploadCatalog: string) => Promise<T[]>;
  edit: (assetsArr: T[], asset: A) => T[];
  editBulk: (assets: A[]) => T[];
  remove: (assetArr: T[], asset: A) => Promise<T[]>;
  removeBulk: (assetArr: T[], assetsArrEdited: T[]) => Promise<T[]>;
}

export function useAssets<T extends GenericAsset, A extends GenericAsset>(assetFactory: {
  new (data?: A): T;
}): IUseAssets<T, A> {
  const { getAccessToken } = useUser();

  const loading = ref(false);

  async function upload(files: FileList, assetArr: T[], uploadCatalog: string) {
    const assetArrCopy = _.cloneDeep(assetArr) || [];
    try {
      loading.value = true;
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const authToken = await getAccessToken();
        const result = await fetch(`/api/assets?folderUrl=/catalog/${uploadCatalog}`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const response = await result.json();
        if (response?.length) {
          const asset = new assetFactory(response[0]);
          asset.createdDate = new Date();

          if ("size" in asset) {
            asset.size = files[i].size;
          }
          if (assetArrCopy && assetArrCopy.length) {
            const lastImageSortOrder = assetArrCopy[assetArrCopy.length - 1].sortOrder;
            asset.sortOrder = lastImageSortOrder + 1;
          } else {
            asset.sortOrder = 0;
          }

          assetArrCopy.push(asset);
        }
        return assetArrCopy;
      }
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function edit(assetsArr: T[], asset: A) {
    const assets = _.cloneDeep(assetsArr) || [];
    const image = new assetFactory(asset);
    if (assets.length) {
      const imageIndex = assets.findIndex((img) => img.id === asset.id);

      assets[imageIndex] = image;

      return assets;
    }
  }

  function editBulk(assets: A[]) {
    return assets.map((item) => new assetFactory(item));
  }

  async function remove(assetArr: T[], asset: A) {
    const assetArrCopy = _.cloneDeep(assetArr) || [];

    if (assetArrCopy && assetArrCopy.length) {
      const imageIndex = assetArr.findIndex((img) => {
        if (img.id && asset.id) {
          return img.id === asset.id;
        } else {
          return img.url === asset.url;
        }
      });
      assetArrCopy.splice(imageIndex, 1);

      return assetArrCopy;
    }
  }

  async function removeBulk(assetArr: T[], assetsArrEdited: T[]) {
    let assetArrCopy = _.cloneDeep(assetArr) || [];

    if (assetArrCopy && assetArrCopy.length) {
      assetArrCopy = assetArrCopy?.filter((asset) => !assetsArrEdited.includes(asset));

      return assetArrCopy;
    }
  }

  return {
    loading: computed(() => loading.value),
    upload,
    edit,
    editBulk,
    remove,
    removeBulk,
  };
}
