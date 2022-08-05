import { useLogger, useUser } from "@virtoshell/core";
import {
  DynamicObjectProperty,
  DynamicPropertyObjectValue,
  IDynamicObjectProperty,
} from "@virtoshell/api-client";
import {
  DynamicContentItem,
  IDynamicContentItem,
  MarketingModuleDynamicContentClient,
} from "../../../../api_client/marketing";
import { computed, Ref, ref, watch } from "vue";
import { cloneDeep as _cloneDeep } from "lodash-es";
import useDynamicProperties from "../useDynamicProperties";

interface IUseContentItem {
  readonly contentItem: Ref<DynamicContentItem>;
  readonly loading: Ref<boolean>;
  readonly modified: Ref<boolean>;
  contentItemDetails: Ref<DynamicContentItem>;
  loadContentItem: (args: { id: string }) => void;
  updateContentItemDetails: (details: IDynamicContentItem) => void;
  createContentItemDetails: (details: IDynamicContentItem) => void;
  deleteContentItemDetails: (args: { id: string }) => void;
  handleContentItemCreate: () => void;
  resetEntries: () => void;
}

export default (): IUseContentItem => {
  const logger = useLogger();
  const { getDynamicProperties, dynamicProperties } = useDynamicProperties({
    take: 20000,
  });
  const loading = ref(false);
  const contentItem = ref<DynamicContentItem>();
  const contentItemDetails = ref(new DynamicContentItem());
  let contentItemDetailsCopy: IDynamicContentItem;
  const modified = ref(false);

  watch(
    () => contentItemDetails,
    (state) => {
      modified.value =
        JSON.stringify(contentItemDetailsCopy) !== JSON.stringify(state.value);
    },
    { deep: true }
  );

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new MarketingModuleDynamicContentClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function loadContentItem(args: { id: string }) {
    const client = await getApiClient();

    try {
      loading.value = true;
      contentItem.value = await client.getDynamicContentById(args.id);

      await getDynamicProperties({
        objectType: contentItem.value.objectType,
      });

      let rawDynamicProperties = dynamicProperties.value;

      rawDynamicProperties = rawDynamicProperties.map(
        (prop: IDynamicObjectProperty) => {
          prop.values = [];
          const filteredProperty = contentItem.value.dynamicProperties.find(
            (x) => x.id === prop.id
          );

          if (filteredProperty) {
            prop.values = filteredProperty.values;
          }
          return new DynamicObjectProperty(prop);
        }
      );

      contentItem.value = new DynamicContentItem({
        ...contentItem.value,
        dynamicProperties: rawDynamicProperties,
      });

      contentItemDetails.value = contentItem.value;
      contentItemDetailsCopy = _cloneDeep(contentItemDetails.value);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateContentItemDetails(details: IDynamicContentItem) {
    const client = await getApiClient();
    const command = new DynamicContentItem(details);

    try {
      loading.value = true;
      await client.updateDynamicContent(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createContentItemDetails(details: IDynamicContentItem) {
    const client = await getApiClient();
    const command = new DynamicContentItem({
      ...details,
      dynamicProperties: details.dynamicProperties.map(
        (x) => new DynamicObjectProperty(x)
      ),
    });

    try {
      loading.value = true;
      await client.createDynamicContent(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteContentItemDetails(args: { id: string }) {
    const client = await getApiClient();

    try {
      loading.value = true;
      await client.deleteDynamicContents([args.id]);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function handleContentItemCreate() {
    try {
      loading.value = true;
      await getDynamicProperties({
        objectType:
          "VirtoCommerce.MarketingModule.Core.Model.DynamicContentItem",
      });
      const rawDynamicContentItems = dynamicProperties.value;
      rawDynamicContentItems.forEach((item) => {
        (item as DynamicObjectProperty).values = [
          new DynamicPropertyObjectValue({ value: "" }),
        ];
      });
      contentItemDetails.value.dynamicProperties = rawDynamicContentItems;
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function resetEntries() {
    const clonedItem = _cloneDeep(contentItemDetailsCopy);
    contentItemDetails.value = Object.assign(
      {},
      clonedItem
    ) as DynamicContentItem;
  }

  return {
    contentItem: computed(() => contentItem.value),
    loading: computed(() => loading.value),
    modified: computed(() => modified.value),
    contentItemDetails,
    resetEntries,
    loadContentItem,
    updateContentItemDetails,
    createContentItemDetails,
    deleteContentItemDetails,
    handleContentItemCreate,
  };
};
