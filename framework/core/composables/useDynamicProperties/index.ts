import { useLoading } from "../useLoading";
import { useAsync } from "../useAsync";
import * as _ from "lodash-es";
import { ComputedRef } from "vue";

// Base interfaces that can be extended by specific API client types
export interface IBaseProperty<TPropertyValue> {
  id?: string | null;
  name?: string | null;
  values?: TPropertyValue[] | null;
  multilanguage?: boolean | null;
  multivalue?: boolean | null;
  dictionary?: boolean | null;
  valueType?: string | null; // Consider using a more specific enum if possible
}

export interface IBasePropertyValue {
  propertyName?: string | null;
  propertyId?: string | null;
  languageCode?: string | null;
  alias?: string | null;
  valueType?: string | null;
  value?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  valueId?: string | null;
  isInherited?: boolean;
}

export interface IBasePropertyDictionaryItem {
  id?: string | null;
  propertyId?: string | null;
  alias?: string | null;
  localizedValues?: { languageCode?: string | null; value?: string | null }[] | null;
  value?: string;
}

export interface IBasePropertyDictionaryItemSearchCriteria {
  propertyIds?: string[] | null;
  keyword?: string | null;
  skip?: number | null;
  take?: number | null;
}

export interface IBaseMeasurementDictionaryItem {
  code?: string | null;
  name?: string | null;
  symbol?: string | null;
  isDefault?: boolean;
  id?: string | null;
}

export interface IUseDynamicProperties<
  TProperty extends IBaseProperty<TPropertyValue>,
  TPropertyValue extends IBasePropertyValue,
  TPropertyDictionaryItem extends IBasePropertyDictionaryItem,
  TPropertyDictionaryItemSearchCriteria extends IBasePropertyDictionaryItemSearchCriteria,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TMeasurement extends IBaseMeasurementDictionaryItem = Record<string, any>,
> {
  loading: ComputedRef<boolean>;
  loadDictionaries: (
    propertyId: string,
    keyword?: string,
    locale?: string,
  ) => Promise<TPropertyDictionaryItem[] | undefined>;
  getPropertyValue: (
    property: TProperty,
    locale: string,
  ) => string | TPropertyValue[] | (TPropertyDictionaryItem & { value: string })[];
  setPropertyValue: (data: {
    property: TProperty;
    value: string | TPropertyValue[] | (TPropertyDictionaryItem & { value: string })[];
    dictionary?: TPropertyDictionaryItem[];
    locale?: string;
    initialProp?: TProperty;
  }) => void;
  loadMeasurements(measureId: string, keyword?: string, locale?: string): Promise<TMeasurement[] | undefined>;
}

function isEmptyValues(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "number" && isNaN(value)) ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  );
}

export const useDynamicProperties = <
  TProperty extends IBaseProperty<TPropertyValue>,
  TPropertyValue extends IBasePropertyValue,
  TPropertyDictionaryItem extends IBasePropertyDictionaryItem,
  TPropertyDictionaryItemSearchCriteria extends IBasePropertyDictionaryItemSearchCriteria,
  TMeasurement extends IBaseMeasurementDictionaryItem,
>(
  searchDictionaryItemsFunction: (
    criteria: TPropertyDictionaryItemSearchCriteria,
  ) => Promise<TPropertyDictionaryItem[] | undefined>,
  PropertyValueConstructor: new (data?: Partial<TPropertyValue>) => TPropertyValue,
  PropertyDictionaryItemConstructor: new (data?: Partial<TPropertyDictionaryItem>) => TPropertyDictionaryItem,
  searchMeasurementFunction?: (measureId: string, locale?: string) => Promise<TMeasurement[] | undefined>,
): IUseDynamicProperties<TProperty, TPropertyValue, TPropertyDictionaryItem, TPropertyDictionaryItemSearchCriteria> => {
  const { loading: dictionaryItemsLoading, action: searchDictionaryItems } = useAsync<
    TPropertyDictionaryItemSearchCriteria,
    TPropertyDictionaryItem[] | undefined
  >(async (args: TPropertyDictionaryItemSearchCriteria | undefined) => {
    if (args === undefined) {
      return undefined;
    }
    return await searchDictionaryItemsFunction(args);
  });

  function getPropertyValue(property: TProperty, locale: string) {
    if (property.multilanguage) {
      const propValue = property.values?.find((x) => x.languageCode == locale);

      if (property.multivalue) {
        return property.values?.filter((x) => x.languageCode === locale) as TPropertyValue[];
      } else if (!propValue) {
        const aliasProp = property.values?.find((x) => x.propertyId === property.id);

        if (aliasProp) {
          property.values?.push(
            new PropertyValueConstructor({
              propertyName: property.name,
              propertyId: property.id,
              languageCode: locale,
              alias: aliasProp?.alias,
              valueType: property.valueType,
              valueId: aliasProp?.valueId,
            } as unknown as Partial<TPropertyValue>),
          );
        }
      }

      if (property.dictionary) {
        return (propValue && propValue?.valueId) as string;
      }
      return propValue?.value as string;
    } else {
      if (property.multivalue) {
        return property.values as TPropertyValue[];
      }
      if (property.dictionary) {
        return property.values?.[0]?.valueId as string;
      }
      return property.values?.[0]?.value as string;
    }
  }

  async function loadDictionaries(propertyId: string, keyword?: string, locale?: string) {
    if (propertyId) {
      let dictionaryItems = await searchDictionaryItems({
        propertyIds: [propertyId],
        keyword,
        skip: 0,
      } as TPropertyDictionaryItemSearchCriteria);
      if (locale) {
        dictionaryItems = dictionaryItems?.map((x: TPropertyDictionaryItem) => {
          const localizedValue = x.localizedValues?.find(
            (v: { languageCode?: string | null; value?: string | null }) => v.languageCode == locale,
          )?.value;
          return Object.assign(new PropertyDictionaryItemConstructor(x), {
            value: localizedValue ?? x.alias,
          });
        });
      }
      return dictionaryItems;
    }
  }

  async function loadMeasurements(measureId: string, locale?: string) {
    if (!measureId || !searchMeasurementFunction) return undefined;
    return await searchMeasurementFunction(measureId, locale);
  }

  function setPropertyValue(data: {
    property: TProperty;
    value: string | TPropertyValue[] | (TPropertyDictionaryItem & { value: string })[];
    dictionary?: TPropertyDictionaryItem[];
    locale?: string;
    initialProp?: TProperty;
  }) {
    const { property, value, dictionary, locale } = data;

    if (dictionary && dictionary.length > 0) {
      const dict = dictionary.map((x) => new PropertyDictionaryItemConstructor(x));
      if (property.multilanguage) {
        // Multivalue Dictionary Multilanguage
        if (Array.isArray(value)) {
          property.values = (value as (TPropertyDictionaryItem & { value: string })[]).flatMap((item) => {
            const dictItem = dict.find((x) => x.id === (item as unknown as TPropertyValue).valueId || x.id === item.id);
            if (dictItem?.localizedValues?.length) {
              return dictItem.localizedValues.map(
                (x) =>
                  new PropertyValueConstructor({
                    propertyId: dictItem.propertyId,
                    alias: dictItem.alias,
                    languageCode: x.languageCode,
                    value: x.value ?? dictItem.alias,
                    valueId: dictItem.id,
                  } as unknown as Partial<TPropertyValue>),
              );
            }
            return new PropertyValueConstructor(item as unknown as Partial<TPropertyValue>);
          });
        }
        // Single value Dictionary Multilanguage
        else {
          const dictionaryItem = dictionary.find((x) => x.id === (value as string));
          if (dictionaryItem) {
            property.values = dictionaryItem?.localizedValues?.map(
              (x) =>
                new PropertyValueConstructor({
                  propertyId: dictionaryItem.propertyId,
                  alias: dictionaryItem.alias,
                  languageCode: x.languageCode,
                  value: x.value ?? dictionaryItem.alias,
                  valueId: dictionaryItem.id,
                } as unknown as Partial<TPropertyValue>),
            );
          } else {
            property.values = [];
          }
        }
      } else {
        // Multivalue Dictionary
        if (Array.isArray(value)) {
          property.values = (value as (TPropertyDictionaryItem & { value: string })[]).flatMap((item) => {
            const dictItem = dict.find((x) => x.id === (item as unknown as TPropertyValue).valueId || x.id === item.id);
            if (dictItem) {
              return new PropertyValueConstructor({
                propertyId: dictItem.propertyId,
                alias: dictItem.alias,
                value: item.value ?? dictItem.alias,
                valueId: dictItem.id,
              } as unknown as Partial<TPropertyValue>);
            }
            return new PropertyValueConstructor(item as unknown as Partial<TPropertyValue>);
          });
        }
        // Single value Dictionary
        else {
          const dictionaryItem = dictionary.find((x) => x.id === (value as string));

          if (isEmptyValues(value)) {
            property.values = [];
          } else {
            property.values = [
              new PropertyValueConstructor({
                propertyId: dictionaryItem?.propertyId,
                alias: dictionaryItem?.alias,
                value: (dictionaryItem as TPropertyDictionaryItem & { value: string })?.value ?? dictionaryItem?.alias,
                valueId: value as string,
              } as unknown as Partial<TPropertyValue>),
            ];
          }
        }
      }
    } else {
      if (property.multilanguage) {
        // Multivalue Multilanguage
        if (Array.isArray(value)) {
          property.values =
            property.values &&
            ([
              ...property.values.filter((x) => x.languageCode !== locale),
              ...(value as TPropertyValue[]).map(
                (item) =>
                  new PropertyValueConstructor({ ...item, languageCode: locale } as unknown as Partial<TPropertyValue>),
              ),
            ] as TPropertyValue[]);
        }
        // Single value Multilanguage
        else {
          const propValue = property.values?.find((x) => x.languageCode == locale);
          if (propValue) {
            propValue.value = value as string;
          } else {
            property.values = [
              new PropertyValueConstructor({
                value: value as string,
                isInherited: false,
                languageCode: locale,
              } as unknown as Partial<TPropertyValue>),
            ];
          }
        }
      } else {
        // Multivalue
        if (Array.isArray(value)) {
          property.values = (value as TPropertyValue[]).map(
            (item) => new PropertyValueConstructor(item as unknown as Partial<TPropertyValue>),
          );
        }
        // Single value
        else {
          if (typeof value === "boolean") {
            if (data.initialProp?.values?.length) {
              property.values = [
                property.values?.[0]
                  ? Object.assign(property.values[0], { value })
                  : new PropertyValueConstructor({
                      value: value,
                      isInherited: false,
                    } as unknown as Partial<TPropertyValue>),
              ];
            } else {
              if (value) {
                property.values = [
                  new PropertyValueConstructor({
                    value: value,
                    isInherited: false,
                  } as unknown as Partial<TPropertyValue>),
                ];
              } else {
                property.values = [];
              }
            }
          } else if (isEmptyValues(value)) {
            // Ensure we create an empty PropertyValue if the original value was also empty, to signify an explicit clear.
            // Otherwise, if there was a value and now it's empty, we clear the values array.
            const hadOriginalValue = data.initialProp?.values?.find((v) =>
              property.multilanguage ? v.languageCode === locale : true,
            )?.value;
            const originalValueWasEmpty = isEmptyValues(hadOriginalValue);

            if (originalValueWasEmpty) {
              property.values = [
                new PropertyValueConstructor({
                  value: value as string,
                  isInherited: false,
                  languageCode: property.multilanguage ? locale : undefined,
                } as unknown as Partial<TPropertyValue>),
              ];
            } else {
              property.values = [];
            }
          } else {
            property.values = property.values?.[0]
              ? [Object.assign(property.values[0], { value: value as string })]
              : [
                  new PropertyValueConstructor({
                    value: value as string,
                    isInherited: false,
                  } as unknown as Partial<TPropertyValue>),
                ];
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
    loadMeasurements,
  };
};
