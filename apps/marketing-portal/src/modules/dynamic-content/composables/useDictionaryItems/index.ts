import { computed, Ref, ref, watch } from "vue";
import {
  DynamicPropertiesClient,
  DynamicPropertyDictionaryItem,
  DynamicPropertyDictionaryItemSearchCriteria,
} from "@virtoshell/api-client";
import { useLogger, useUser } from "@virtoshell/core";
import { cloneDeep as _cloneDeep } from "lodash-es";

interface IUseDictionaryItems {
  readonly modified: Ref<boolean>;
  readonly loading: Ref<boolean>;
  readonly stagedDictionaryItems: Ref<DynamicPropertyDictionaryItem[]>;
  dictionaryItemsDetails: Ref<DynamicPropertyDictionaryItem[]>;
  searchDictionaryItems: (
    propertyId: string,
    keyword?: string,
    skip?: number
  ) => Promise<DynamicPropertyDictionaryItem[]>;
  resetDictionaryEntries: () => void;
  deleteDictionaryItems: (args: { ids: string[] }) => void;
  saveDictionaryItems: (items: DynamicPropertyDictionaryItem[]) => void;
  stageDictionaryItems: (items: DynamicPropertyDictionaryItem[]) => void;
}

const stagedDictionaryItems = ref([]);

export default (): IUseDictionaryItems => {
  const logger = useLogger();
  const loading = ref(false);
  const modified = ref(false);
  const dictionaryItems = ref<DynamicPropertyDictionaryItem[]>();
  const dictionaryItemsDetails = ref<DynamicPropertyDictionaryItem[]>([]);
  let dictionaryItemsCopy: DynamicPropertyDictionaryItem[];

  watch(
    () => dictionaryItemsDetails,
    (state) => {
      modified.value =
        JSON.stringify(dictionaryItemsCopy) !== JSON.stringify(state.value);
    },
    { deep: true }
  );

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new DynamicPropertiesClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function searchDictionaryItems(
    propertyId: string,
    keyword?: string,
    skip?: number
  ): Promise<DynamicPropertyDictionaryItem[]> {
    const client = await getApiClient();

    try {
      loading.value = true;
      const result = await client.searchDictionaryItems({
        propertyId,
        keyword,
        skip,
        take: 20,
      } as DynamicPropertyDictionaryItemSearchCriteria);

      dictionaryItems.value = result.results.map(
        (x) => new DynamicPropertyDictionaryItem(x)
      ) as DynamicPropertyDictionaryItem[];
      dictionaryItemsDetails.value = dictionaryItems.value;
      dictionaryItemsCopy = _cloneDeep(dictionaryItemsDetails.value);
      return result.results;
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function resetDictionaryEntries() {
    const clonedItem = _cloneDeep(dictionaryItemsCopy);
    dictionaryItemsDetails.value = clonedItem.map((x) => Object.assign({}, x));
  }

  async function deleteDictionaryItems(args: { ids: string[] }) {
    const client = await getApiClient();

    await client.deleteDictionaryItem(args.ids);
  }

  async function saveDictionaryItems(items: DynamicPropertyDictionaryItem[]) {
    const client = await getApiClient();

    try {
      loading.value = true;
      await client.saveDictionaryItems(items);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function stageDictionaryItems(items: DynamicPropertyDictionaryItem[]) {
    stagedDictionaryItems.value = items;
  }

  return {
    modified: computed(() => modified.value),
    loading: computed(() => loading.value),
    stagedDictionaryItems: computed(() => stagedDictionaryItems.value),
    dictionaryItemsDetails,
    searchDictionaryItems,
    resetDictionaryEntries,
    deleteDictionaryItems,
    saveDictionaryItems,
    stageDictionaryItems,
  };
};
