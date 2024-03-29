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
} from "@vc-app/api";

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export const useDynamicProperties = () => {
  const { loading: dictionaryItemsLoading, action: searchDictionaryItems } = useAsync<
    IPropertyDictionaryItemSearchCriteria,
    IPropertyDictionaryItem[] | undefined
  >(async (args) => {
    return (await (await getApiClient()).searchPropertyDictionaryItems(new PropertyDictionaryItemSearchCriteria(args)))
      .results;
  });

  function getPropertyValue(property: IProperty, locale: string) {
    if (property.multilanguage) {
      if (property.multivalue) {
        return property.values?.filter((x) => x.languageCode == locale);
      } else if (property.values?.find((x) => x.languageCode == locale) == undefined) {
        property.values?.push(
          new PropertyValue({
            propertyName: property.name,
            propertyId: property.id,
            languageCode: locale,
            valueType: property.valueType as unknown as PropertyValueValueType,
          }),
        );
      }

      const propValue = property.values?.find((x) => x.languageCode == locale);
      if (property.dictionary) {
        return propValue && propValue?.valueId;
      }
      return propValue?.value;
    } else {
      if (property.multivalue) {
        return property.values;
      }
      if (property.dictionary) {
        return property.values && property.values[0] && property.values[0].valueId;
      }
      return property.values && property.values[0] && property.values[0].value;
    }
  }

  async function loadDictionaries(property: IProperty, keyword?: string, locale?: string) {
    if (property.id) {
      let dictionaryItems = await searchDictionaryItems({
        propertyIds: [property.id],
        keyword,
        skip: 0,
      });
      if (locale) {
        dictionaryItems = dictionaryItems?.map((x) =>
          Object.assign(x, { value: x.localizedValues?.find((v) => v.languageCode == locale)?.value ?? x.alias }),
        );
      }
      return dictionaryItems!;
    }
    throw new Error("Could not load dictionary.");
  }

  function handleDictionaryValue(
    property: IProperty,
    valueId: string,
    dictionary: PropertyDictionaryItem[],
    locale?: string,
  ) {
    let valueValue;
    const dictionaryItem = dictionary.find((x) => x.id === valueId);
    if (!dictionaryItem) {
      return undefined;
    }

    if ("value" in dictionaryItem && dictionaryItem["value"]) {
      valueValue = dictionaryItem["value"];
    } else {
      valueValue = dictionaryItem.alias;
    }

    return {
      propertyId: dictionaryItem.propertyId,
      alias: dictionaryItem.alias,
      languageCode: locale,
      value: valueValue,
      valueId: valueId,
    };
  }

  function setPropertyValue(data: {
    property: IProperty;
    value: string | IPropertyValue[];
    dictionary?: IPropertyDictionaryItem[];
    locale?: string;
  }) {
    const { property, value, dictionary, locale } = data;

    if (dictionary && dictionary.length) {
      if (property.multilanguage) {
        if (Array.isArray(value)) {
          property.values = value.map((item) => {
            item.languageCode = locale;
            if (dictionary.find((x) => x.id === item.valueId)) {
              return new PropertyValue(
                handleDictionaryValue(
                  property,
                  item.valueId!,
                  dictionary.map((x) => new PropertyDictionaryItem(x)),
                  locale,
                ),
              );
            } else {
              return new PropertyValue(item);
            }
          });
        } else {
          property.values = [
            new PropertyValue(
              handleDictionaryValue(
                property,
                value,
                dictionary.map((x) => new PropertyDictionaryItem(x)),
                locale,
              ),
            ),
          ];
        }
      } else {
        property.values = Array.isArray(value)
          ? value.map((item) => {
              item.languageCode = locale;
              if (dictionary.find((x) => x.id === item.id)) {
                const handledValue = handleDictionaryValue(
                  property,
                  item.id!,
                  dictionary.map((x) => new PropertyDictionaryItem(x)),
                );
                return new PropertyValue(handledValue);
              } else return new PropertyValue(item);
            })
          : [
              new PropertyValue(
                handleDictionaryValue(
                  property,
                  value,
                  dictionary.map((x) => new PropertyDictionaryItem(x)),
                ),
              ),
            ];
      }
    } else {
      if (property.multilanguage) {
        if (Array.isArray(value)) {
          property.values = property.values && [
            ...property.values.filter((x) => x.languageCode !== locale),
            ...value.map((item) => new PropertyValue({ ...item, languageCode: locale })),
          ];
        } else {
          const propValue = property.values?.find((x) => x.languageCode == locale);
          if (propValue) {
            propValue.value = value;
          } else {
            property.values = [new PropertyValue({ value: value, isInherited: false, languageCode: locale })];
          }
        }
      } else {
        property.values = Array.isArray(value)
          ? value.map((item) => new PropertyValue({ ...item, languageCode: locale }))
          : property.values?.[0]
            ? [Object.assign(property.values[0], { value: value })]
            : [new PropertyValue({ value: value, isInherited: false })];
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
