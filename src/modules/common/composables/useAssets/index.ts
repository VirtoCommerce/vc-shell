import { Ref, computed, ref } from "vue";
import * as _ from "lodash-es";
import { AssetsHandler, useUser } from "@vc-shell/framework";
import { Asset, Image } from "./../../../../api_client/marketplacevendor";

export function useAssets<T extends Asset | Image, A extends Asset | Image>(assetFactory: {
  new (data?: A): T;
}): AssetsHandler<T, A> {
  const { getAccessToken } = useUser();

  const loading = ref(false);

  async function upload(files: FileList, assetArr: T[], uploadCatalog: string, uploadFolder = "catalog") {
    const assetArrCopy = _.cloneDeep(assetArr) || [];
    try {
      loading.value = true;
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const authToken = await getAccessToken();
        const result = await fetch(`/api/assets?folderUrl=/${uploadFolder}/${uploadCatalog}`, {
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
            const lastItemSortOrder = assetArrCopy[assetArrCopy.length - 1].sortOrder;
            asset.sortOrder = lastItemSortOrder + 1;
          } else {
            asset.sortOrder = 0;
          }

          assetArrCopy.push(asset);
        }
      }
      return assetArrCopy;
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function edit(assetsArr: T[], asset: A) {
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
    }
    return assetArrCopy;
  }

  async function removeBulk(assetArr: T[], assetsArrEdited: T[]) {
    let assetArrCopy = _.cloneDeep(assetArr) || [];
    if (assetArrCopy && assetArrCopy.length) {
      assetArrCopy = _.differenceWith(assetArr, assetsArrEdited, (x, y) => _.isEqual({ ...x }, { ...y }));
    }
    return assetArrCopy;
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
