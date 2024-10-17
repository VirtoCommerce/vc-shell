import { useApiClient, useLoading, useAsync } from "@vc-shell/framework";

import {
  IProperty,
  IPropertyDictionaryItem,
  IPropertyDictionaryItemSearchCriteria,
  IPropertyValue,
  PropertyDictionaryItem,
  PropertyDictionaryItemSearchCriteria,
  PropertyValue,
  PropertyValueValueType,
  VcmpSellerCatalogClient,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import * as _ from "lodash-es";
import { ComputedRef } from "vue";

export interface IUseDynamicProperties {
  loading: ComputedRef<boolean>;
  loadDictionaries: (
    propertyId: string,
    keyword?: string,
    locale?: string,
  ) => Promise<IPropertyDictionaryItem[] | undefined>;
  getPropertyValue: (
    property: IProperty,
    locale: string,
  ) => string | IPropertyValue[] | (IPropertyDictionaryItem & { value: string })[];
  setPropertyValue: (data: {
    property: IProperty;
    value: string | IPropertyValue[] | (IPropertyDictionaryItem & { value: string })[];
    dictionary?: IPropertyDictionaryItem[];
    locale?: string;
  }) => void;
}

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

function isEmptyValues(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "number" && isNaN(value)) ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  );
}

export const useDynamicProperties = (): IUseDynamicProperties => {
  const { loading: dictionaryItemsLoading, action: searchDictionaryItems } = useAsync<
    IPropertyDictionaryItemSearchCriteria,
    IPropertyDictionaryItem[] | undefined
  >(async (args) => {
    return (await (await getApiClient()).searchPropertyDictionaryItems(new PropertyDictionaryItemSearchCriteria(args)))
      .results;
  });

  function getPropertyValue(property: IProperty, locale: string) {
    if ("multilanguage" in property && property.multilanguage) {
      const propValue = property.values?.find((x) => x.languageCode == locale);

      if ("multivalue" in property && property.multivalue) {
        return property.values?.filter((x) => x.languageCode === locale);
      } else if (!propValue) {
        const aliasProp = property.values?.find((x) => x.propertyId === property.id);

        if (aliasProp) {
          property.values?.push(
            new PropertyValue({
              propertyName: property.name,
              propertyId: property.id,
              languageCode: locale,
              alias: aliasProp?.alias,
              valueType: property.valueType as unknown as PropertyValueValueType,
              valueId: aliasProp?.valueId,
            }),
          );
        }
      }

      if ("dictionary" in property && property.dictionary) {
        return propValue && propValue?.valueId;
      }
      return propValue?.value;
    } else {
      if ("multivalue" in property && property.multivalue) {
        return property.values;
      }
      if ("dictionary" in property && property.dictionary) {
        return property.values?.[0]?.valueId;
      }
      return property.values?.[0]?.value;
    }
  }

  async function loadDictionaries(propertyId: string, keyword?: string, locale?: string) {
    if (propertyId) {
      let dictionaryItems = await searchDictionaryItems({
        propertyIds: [propertyId],
        keyword,
        skip: 0,
      });
      if (locale) {
        dictionaryItems = dictionaryItems?.map((x) =>
          Object.assign(x, { value: x.localizedValues?.find((v) => v.languageCode == locale)?.value ?? x.alias }),
        );
      }
      return dictionaryItems;
    }
  }

  function setPropertyValue(data: {
    property: IProperty;
    value: string | IPropertyValue[] | (IPropertyDictionaryItem & { value: string })[];
    dictionary?: IPropertyDictionaryItem[];
    locale?: string;
    initialProp?: IProperty;
  }) {
    const { property, value, dictionary, locale } = data;

    if (dictionary && dictionary.length > 0) {
      const dict = dictionary.map((x) => new PropertyDictionaryItem(x));
      if (property.multilanguage) {
        // Multivalue Dictionary Multilanguage
        if (Array.isArray(value)) {
          property.values = value.flatMap((item) => {
            const dictItem = dict.find((x) => x.id === (item as IPropertyValue).valueId || x.id === item.id);
            if (dictItem?.localizedValues?.length) {
              return dictItem.localizedValues.map(
                (x) =>
                  new PropertyValue({
                    propertyId: dictItem.propertyId,
                    alias: dictItem.alias,
                    languageCode: x.languageCode,
                    value: x.value ?? dictItem.alias,
                    valueId: dictItem.id,
                  }),
              );
            }
            return new PropertyValue(item);
          });
        }
        // Single value Dictionary Multilanguage
        else {
          const dictionaryItem = dictionary.find((x) => x.id === value);
          if (dictionaryItem) {
            property.values = dictionaryItem?.localizedValues?.map(
              (x) =>
                new PropertyValue({
                  propertyId: dictionaryItem.propertyId,
                  alias: dictionaryItem.alias,
                  languageCode: x.languageCode,
                  value: x.value ?? dictionaryItem.alias,
                  valueId: dictionaryItem.id,
                }),
            );
          } else {
            property.values = [];
          }
        }
      } else {
        // Multivalue Dictionary
        if (Array.isArray(value)) {
          property.values = value.flatMap((item) => {
            const dictItem = dict.find((x) => x.id === (item as IPropertyValue).valueId || x.id === item.id);
            if (dictItem) {
              return new PropertyValue({
                propertyId: dictItem.propertyId,
                alias: dictItem.alias,
                value: item.value ?? dictItem.alias,
                valueId: dictItem.id,
              });
            }
            return new PropertyValue(item);
          });
        }
        // Single value Dictionary
        else {
          const dictionaryItem = dictionary.find((x) => x.id === value);

          if (isEmptyValues(value)) {
            property.values = [];
          } else {
            property.values = [
              new PropertyValue({
                propertyId: dictionaryItem?.propertyId,
                alias: dictionaryItem?.alias,
                value: (dictionaryItem as IPropertyDictionaryItem & { value: string })?.value ?? dictionaryItem?.alias,
                valueId: value,
              }),
            ];
          }
        }
      }
    } else {
      if (property.multilanguage) {
        // Multivalue Multilanguage
        if (Array.isArray(value)) {
          property.values = property.values && [
            ...property.values.filter((x) => x.languageCode !== locale),
            ...value.map((item) => new PropertyValue({ ...item, languageCode: locale })),
          ];
        }
        // Single value Multilanguage
        else {
          const propValue = property.values?.find((x) => x.languageCode == locale);
          if (propValue) {
            propValue.value = value;
          } else {
            property.values = [new PropertyValue({ value: value, isInherited: false, languageCode: locale })];
          }
        }
      } else {
        // Multivalue
        if (Array.isArray(value)) {
          property.values = value.map((item) => new PropertyValue(item));
        }
        // Single value
        else {
          if (typeof value === "boolean") {
            if (data.initialProp?.values?.length) {
              property.values = [
                property.values?.[0]
                  ? Object.assign(property.values[0], { value })
                  : new PropertyValue({ value, isInherited: false }),
              ];
            } else {
              if (value) {
                property.values = [new PropertyValue({ value, isInherited: false })];
              } else {
                property.values = [];
              }
            }
          } else if (isEmptyValues(value)) {
            property.values = property.values?.[0] ? [] : [new PropertyValue({ value: value, isInherited: false })];
          } else {
            property.values = property.values?.[0]
              ? [Object.assign(property.values[0], { value: value })]
              : [new PropertyValue({ value: value, isInherited: false })];
          }
        }
      }
    }
  }

  const loading = useLoading(dictionaryItemsLoading);

  return {
    loading,
    loadDictionaries,
    getPropertyValue,
    setPropertyValue,
  };
};
