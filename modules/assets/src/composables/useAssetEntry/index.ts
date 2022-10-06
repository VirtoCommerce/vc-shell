import { computed, ref } from "vue";
import { useUser } from "@vc-shell/core";
import { AssetEntryClient, AssetEntry } from "../../api_client/assets";

export default () => {
  const loading = ref(false);
  const asset = ref<AssetEntry>();

  async function loadAsset(id: string) {
    loading.value = true;
    const { getAccessToken } = useUser();
    const client = new AssetEntryClient();
    try {
      client.setAuthToken((await getAccessToken()) as string);
      asset.value = await client.get(undefined, id);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    asset: computed(() => asset.value),
    assetData: computed(() => asset.value?.blobInfo),
    loading,
    loadAsset,
  };
};
