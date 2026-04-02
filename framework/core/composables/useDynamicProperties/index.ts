import { useLoading } from "@core/composables/useLoading";
import { useAsync } from "@core/composables/useAsync";
import { resolveStrategy } from "./strategies";
import type {
  DynamicPropertiesOptions,
  UseDynamicPropertiesReturn,
  SetPropertyValueParams,
  IBaseProperty,
  IBasePropertyDictionaryItem,
  IBasePropertyDictionaryItemSearchCriteria,
  PropertyDisplayValue,
} from "./types";

// Re-export all types for backward compatibility
export * from "./types";

export function useDynamicProperties(options: DynamicPropertiesOptions): UseDynamicPropertiesReturn {
  const { searchDictionary, searchMeasurements } = options;

  const { loading: dictionaryItemsLoading, action: searchDictionaryItems } = useAsync<
    IBasePropertyDictionaryItemSearchCriteria,
    IBasePropertyDictionaryItem[] | undefined
  >(async (args) => {
    if (!args) return undefined;
    return await searchDictionary(args);
  });

  async function loadDictionaries(
    propertyId: string,
    keyword?: string,
    locale?: string,
  ): Promise<IBasePropertyDictionaryItem[] | undefined> {
    if (!propertyId) return undefined;

    const items = await searchDictionaryItems({
      propertyIds: [propertyId],
      keyword,
      skip: 0,
    });

    if (!locale || !items) return items;

    return items.map((item) => {
      const localizedValue = item.localizedValues?.find((loc) => loc.languageCode === locale)?.value;
      return { ...item, value: localizedValue ?? item.alias } as IBasePropertyDictionaryItem;
    });
  }

  async function loadMeasurements(measureId: string, _keyword?: string, locale?: string) {
    if (!measureId || !searchMeasurements) return undefined;
    return await searchMeasurements(measureId, locale);
  }

  function getPropertyValue(property: IBaseProperty, locale: string): PropertyDisplayValue {
    return resolveStrategy(property).get(property, locale);
  }

  function setPropertyValue(params: SetPropertyValueParams): void {
    const { property, value, ...context } = params;
    resolveStrategy(property).set(property, value, context);
  }

  return {
    getPropertyValue,
    setPropertyValue,
    loadDictionaries,
    loadMeasurements,
    loading: useLoading(dictionaryItemsLoading),
  };
}
