import { useLogger, useUser } from "@virtoshell/core";
import {
  DynamicContentFolder,
  IDynamicContentFolder,
  MarketingModuleDynamicContentClient,
} from "@virtoshell/api-client";
import { computed, Ref, ref, watch } from "vue";
import { cloneDeep as _cloneDeep } from "lodash-es";

interface IUseContentItemFolder {
  readonly loading: Ref<boolean>;
  readonly modified: Ref<boolean>;
  readonly folder: Ref<DynamicContentFolder>;
  folderDetails: Ref<IDynamicContentFolder>;
  createContentFolder: (details: IDynamicContentFolder) => void;
  deleteContentFolder: (args: { id: string }) => void;
  getDynamicContentFolderById: (args: { id: string }) => void;
  updateContentFolder: (folder: IDynamicContentFolder) => void;
  resetEntries: () => void;
}

export default (): IUseContentItemFolder => {
  const logger = useLogger();
  const loading = ref(false);
  const folder = ref<DynamicContentFolder>();
  const folderDetails = ref(new DynamicContentFolder());
  let folderDetailsCopy: IDynamicContentFolder;
  const modified = ref(false);

  watch(
    () => folderDetails,
    (state) => {
      modified.value =
        JSON.stringify(folderDetailsCopy) !== JSON.stringify(state.value);
    },
    { deep: true }
  );

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new MarketingModuleDynamicContentClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function createContentFolder(details: IDynamicContentFolder) {
    const client = await getApiClient();
    const command = new DynamicContentFolder(details);

    try {
      loading.value = true;
      await client.createDynamicContentFolder(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteContentFolder(args: { id: string }) {
    const client = await getApiClient();

    try {
      loading.value = true;
      await client.deleteDynamicContentFolders([args.id]);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateContentFolder(folder: IDynamicContentFolder) {
    const client = await getApiClient();

    const command = new DynamicContentFolder(folder);

    try {
      loading.value = true;

      await client.updateDynamicContentFolder(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function getDynamicContentFolderById(args: { id: string }) {
    const client = await getApiClient();

    try {
      loading.value = true;

      folder.value = await client.getDynamicContentFolderById(args.id);

      folderDetails.value = Object.assign({}, folder.value);

      folderDetailsCopy = _cloneDeep(folderDetails.value);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function resetEntries() {
    const clonedItem = _cloneDeep(folderDetailsCopy);
    folderDetails.value = Object.assign({}, clonedItem) as DynamicContentFolder;
  }

  return {
    loading: computed(() => loading.value),
    modified: computed(() => modified.value),
    folder: computed(() => folder.value),
    folderDetails,
    createContentFolder,
    deleteContentFolder,
    updateContentFolder,
    getDynamicContentFolderById,
    resetEntries,
  };
};
