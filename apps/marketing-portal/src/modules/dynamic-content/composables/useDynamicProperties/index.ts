import { useLogger, useUser } from "@virtoshell/core";
import { cloneDeep as _cloneDeep } from "lodash-es";
import {
  DynamicPropertiesClient,
  DynamicProperty,
  DynamicPropertyName,
  DynamicPropertySearchCriteria,
  DynamicPropertySearchResult,
  DynamicPropertyValueType,
  IDynamicProperty,
  IDynamicPropertySearchCriteria,
  SettingClient,
} from "@virtoshell/api-client";
import { computed, ref, Ref, watch } from "vue";

interface IUseDynamicProperties {
  readonly dynamicProperties: Ref<DynamicProperty[]>;
  readonly loading: Ref<boolean>;
  readonly modified: Ref<boolean>;
  readonly currentPage: Ref<number>;
  readonly pages: Ref<number>;
  readonly totalCount: Ref<number>;
  readonly searchQuery: Ref<IDynamicPropertySearchCriteria>;
  readonly valueTypes: Ref<{ id: string; title: string }[]>;
  propertyDetails: Ref<DynamicProperty>;
  getDynamicProperties: (query: IDynamicPropertySearchCriteria) => void;
  handlePropertyDetailsItem: (property: DynamicProperty) => void;
  resetPropertyEntries: () => void;
  saveDynamicProperty: (property: IDynamicProperty) => void;
  removeDynamicProperties: (args: { ids: string[] }) => void;
  handleInitialProperty: (objectType: string) => void;
  createDynamicProperty: (
    property: IDynamicProperty
  ) => Promise<DynamicProperty>;
}

interface IUseDynamicPropertiesOptions {
  take?: number;
  objectType?: string;
  skip?: number;
}

export default (
  options?: IUseDynamicPropertiesOptions
): IUseDynamicProperties => {
  const logger = useLogger();
  const dynamicProperties = ref<DynamicPropertySearchResult>();
  const loading = ref(false);
  const searchQuery = ref<IDynamicPropertySearchCriteria>({
    take: options?.take,
    objectType: options?.objectType,
    skip: options?.skip,
  });
  const currentPage = ref(1);
  const languages = ref<string[]>([]);
  const modified = ref(false);
  const propertyDetails = ref(new DynamicProperty());
  let propertyDetailsCopy: DynamicProperty;
  const valueTypes = [
    {
      id: DynamicPropertyValueType.ShortText,
      title: "Short text",
    },
    {
      id: DynamicPropertyValueType.LongText,
      title: "Long text",
    },
    {
      id: DynamicPropertyValueType.Integer,
      title: "Integer",
    },
    {
      id: DynamicPropertyValueType.Decimal,
      title: "Decimal Number",
    },
    {
      id: DynamicPropertyValueType.DateTime,
      title: "Date time",
    },
    {
      id: DynamicPropertyValueType.Boolean,
      title: "Boolean",
    },
    {
      id: DynamicPropertyValueType.Html,
      title: "HTML",
    },
    {
      id: DynamicPropertyValueType.Image,
      title: "Image",
    },
  ];

  watch(
    () => propertyDetails,
    (state) => {
      modified.value =
        JSON.stringify(propertyDetailsCopy) !== JSON.stringify(state.value);
    },
    { deep: true }
  );

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new DynamicPropertiesClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function getDynamicProperties(query: IDynamicPropertySearchCriteria) {
    const client = await getApiClient();
    searchQuery.value = { ...searchQuery.value, ...query };

    const command = new DynamicPropertySearchCriteria(searchQuery.value);

    try {
      loading.value = true;
      dynamicProperties.value = await client.searchDynamicProperties(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function saveDynamicProperty(property: IDynamicProperty) {
    const client = await getApiClient();
    const command = new DynamicProperty({
      ...property,
      displayNames: property.displayNames.map(
        (x) => new DynamicPropertyName(x)
      ),
    });

    try {
      loading.value = true;
      await client.updateProperty(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createDynamicProperty(
    property: IDynamicProperty
  ): Promise<DynamicProperty> {
    const client = await getApiClient();
    const command = new DynamicProperty({
      ...property,
      displayNames: property.displayNames.map(
        (x) => new DynamicPropertyName(x)
      ),
    });

    try {
      loading.value = true;
      return await client.createProperty(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeDynamicProperties(args: { ids: string[] }) {
    const client = await getApiClient();

    try {
      loading.value = true;
      await client.deleteProperty(args.ids);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function getLanguages() {
    const { getAccessToken } = useUser();
    const client = new SettingClient();
    client.setAuthToken(await getAccessToken());

    try {
      loading.value = true;
      const langSetting = await client.getGlobalSetting(
        "VirtoCommerce.Core.General.Languages"
      );
      languages.value = langSetting.allowedValues;
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function handleInitialProperty(objectType: string) {
    try {
      await getLanguages();

      propertyDetails.value.objectType = objectType;
      propertyDetails.value.displayNames = [];
      languages.value.forEach((lang) => {
        propertyDetails.value.displayNames.push(
          new DynamicPropertyName({
            locale: lang,
            name: undefined,
          })
        );
        propertyDetailsCopy = _cloneDeep(propertyDetails.value);
      });
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  async function handlePropertyDetailsItem(property: DynamicProperty) {
    try {
      await getLanguages();

      propertyDetails.value = Object.assign({}, property);
      propertyDetails.value.displayNames =
        propertyDetails.value.displayNames.filter((x) =>
          languages.value.includes(x.locale)
        );

      propertyDetailsCopy = _cloneDeep(propertyDetails.value);
    } catch (e) {
      logger.error(e);
    }
  }

  function resetPropertyEntries() {
    const clonedItem = _cloneDeep(propertyDetailsCopy);
    propertyDetails.value = Object.assign({}, clonedItem) as DynamicProperty;
  }

  return {
    dynamicProperties: computed(() => dynamicProperties.value?.results),
    loading: computed(() => loading.value),
    totalCount: computed(() => dynamicProperties.value?.totalCount),
    pages: computed(() => Math.ceil(dynamicProperties.value?.totalCount / 20)),
    currentPage: computed(() => currentPage.value),
    searchQuery: computed(() => searchQuery.value),
    valueTypes: computed(() => valueTypes),
    modified: computed(() => modified.value),
    propertyDetails,
    getDynamicProperties,
    handlePropertyDetailsItem,
    resetPropertyEntries,
    saveDynamicProperty,
    removeDynamicProperties,
    handleInitialProperty,
    createDynamicProperty,
  };
};
