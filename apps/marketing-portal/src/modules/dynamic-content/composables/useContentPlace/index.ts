import { useLogger, useUser } from "@virtoshell/core";
import {
  DynamicContentPlace,
  IDynamicContentPlace,
  MarketingModuleDynamicContentClient,
} from "@virtoshell/api-client";
import { computed, Ref, ref, watch } from "vue";
import { cloneDeep as _cloneDeep } from "lodash-es";

interface IUseContentItem {
  readonly contentPlace: Ref<DynamicContentPlace>;
  readonly loading: Ref<boolean>;
  readonly modified: Ref<boolean>;
  contentPlaceDetails: Ref<DynamicContentPlace>;
  loadContentPlace: (args: { id: string }) => void;
  updateContentPlaceDetails: (details: IDynamicContentPlace) => void;
  createContentPlaceDetails: (details: IDynamicContentPlace) => void;
  deleteContentPlaceDetails: (args: { id: string }) => void;
  resetEntries: () => void;
  setImage: (file: IUploadedFile) => void;
}

export interface IUploadedFile {
  contentType?: string;
  createdDate?: string;
  name: string;
  relativeUrl?: string;
  size: number | string;
  type?: string;
  url?: string;
}

export default (): IUseContentItem => {
  const logger = useLogger();
  const loading = ref(false);
  const contentPlace = ref<DynamicContentPlace>();
  const contentPlaceDetails = ref(new DynamicContentPlace());
  let contentPlaceDetailsCopy: IDynamicContentPlace;
  const modified = ref(false);

  watch(
    () => contentPlaceDetails,
    (state) => {
      modified.value =
        JSON.stringify(contentPlaceDetailsCopy) !== JSON.stringify(state.value);
    },
    { deep: true }
  );

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new MarketingModuleDynamicContentClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function loadContentPlace(args: { id: string }) {
    const client = await getApiClient();

    try {
      loading.value = true;
      contentPlace.value = await client.getDynamicContentPlaceById(args.id);

      contentPlace.value = new DynamicContentPlace({
        ...contentPlace.value,
      });

      contentPlaceDetails.value = contentPlace.value;
      contentPlaceDetailsCopy = _cloneDeep(contentPlaceDetails.value);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateContentPlaceDetails(details: IDynamicContentPlace) {
    const client = await getApiClient();
    const command = new DynamicContentPlace(details);

    try {
      loading.value = true;
      await client.updateDynamicContentPlace(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createContentPlaceDetails(details: IDynamicContentPlace) {
    const client = await getApiClient();
    const command = new DynamicContentPlace({
      ...details,
    });

    try {
      loading.value = true;
      await client.createDynamicContentPlace(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteContentPlaceDetails(args: { id: string }) {
    const client = await getApiClient();

    try {
      loading.value = true;
      await client.deleteDynamicContentPlaces([args.id]);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function resetEntries() {
    const clonedItem = _cloneDeep(contentPlaceDetailsCopy);
    contentPlaceDetails.value = Object.assign(
      {},
      clonedItem
    ) as DynamicContentPlace;
  }

  function setImage(file: IUploadedFile) {
    contentPlaceDetails.value.imageUrl = file.url;
  }

  return {
    contentPlace: computed(() => contentPlace.value),
    loading: computed(() => loading.value),
    modified: computed(() => modified.value),
    contentPlaceDetails,
    resetEntries,
    loadContentPlace,
    updateContentPlaceDetails,
    createContentPlaceDetails,
    deleteContentPlaceDetails,
    setImage,
  };
};
