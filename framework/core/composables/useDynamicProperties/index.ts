import { useLoading } from "../useLoading";
import { useAsync } from "../useAsync";
import { ComputedRef } from "vue";

// === TYPE DEFINITIONS ===

export interface IBaseProperty<TPropertyValue> {
  id?: string | null;
  name?: string | null;
  values?: TPropertyValue[] | null;
  multilanguage?: boolean | null;
  multivalue?: boolean | null;
  dictionary?: boolean | null;
  valueType?: string | null;
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
  unitOfMeasureId?: string | null;
  colorCode?: string | null;
}

export interface IBasePropertyDictionaryItem {
  id?: string | null;
  propertyId?: string | null;
  alias?: string | null;
  localizedValues?: { languageCode?: string | null; value?: string | null }[] | null;
  value?: string;
  colorCode?: string | null;
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
  setPropertyValue: (data: SetPropertyValueParams<TProperty, TPropertyValue, TPropertyDictionaryItem>) => void;
  loadMeasurements(measureId: string, keyword?: string, locale?: string): Promise<TMeasurement[] | undefined>;
}

export interface SetPropertyValueParams<TProperty, TPropertyValue, TPropertyDictionaryItem> {
  property: TProperty;
  value: string | TPropertyValue[] | (TPropertyDictionaryItem & { value: string })[];
  dictionary?: TPropertyDictionaryItem[];
  locale?: string;
  initialProp?: TProperty;
  unitOfMeasureId?: string;
  colorCode?: string;
}

// === UTILITY FUNCTIONS ===

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "number" && isNaN(value)) return true;
  if (typeof value === "string" && value.trim().length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
}

function isMultilanguageProperty<T extends IBaseProperty<unknown>>(property: T): boolean {
  return Boolean(property.multilanguage);
}

function isMultivalueProperty<T extends IBaseProperty<unknown>>(property: T): boolean {
  return Boolean(property.multivalue);
}

function isDictionaryProperty<T extends IBaseProperty<unknown>>(property: T): boolean {
  return Boolean(property.dictionary);
}

function isMeasureProperty<T extends IBaseProperty<unknown>>(property: T): boolean {
  return property.valueType === "Measure";
}

function isColorProperty<T extends IBaseProperty<unknown>>(property: T): boolean {
  return property.valueType === "Color";
}

// === MAIN COMPOSABLE ===

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
  // === ASYNC OPERATIONS ===

  const { loading: dictionaryItemsLoading, action: searchDictionaryItems } = useAsync<
    TPropertyDictionaryItemSearchCriteria,
    TPropertyDictionaryItem[] | undefined
  >(async (args: TPropertyDictionaryItemSearchCriteria | undefined) => {
    if (!args) return undefined;
    return await searchDictionaryItemsFunction(args);
  });

  async function loadDictionaries(propertyId: string, keyword?: string, locale?: string) {
    if (!propertyId) return undefined;

    const dictionaryItems = await searchDictionaryItems({
      propertyIds: [propertyId],
      keyword,
      skip: 0,
    } as TPropertyDictionaryItemSearchCriteria);

    if (!locale || !dictionaryItems) return dictionaryItems;

    return dictionaryItems.map((item: TPropertyDictionaryItem) => {
      const localizedValue = item.localizedValues?.find((localized) => localized.languageCode === locale)?.value;

      return Object.assign(new PropertyDictionaryItemConstructor(item), {
        value: localizedValue ?? item.alias,
      });
    });
  }

  async function loadMeasurements(measureId: string, locale?: string) {
    if (!measureId || !searchMeasurementFunction) return undefined;
    return await searchMeasurementFunction(measureId, locale);
  }

  // === VALUE GETTERS ===

  function getMultilanguageValue(property: TProperty, locale: string): string | TPropertyValue[] {
    const valueForLocale = property.values?.find((x) => x.languageCode === locale);

    if (isMultivalueProperty(property)) {
      return property.values?.filter((x) => x.languageCode === locale) as TPropertyValue[];
    }

    // Create default value if not exists
    if (!valueForLocale) {
      const aliasValue = property.values?.find((x) => x.propertyId === property.id);
      if (aliasValue) {
        const newValue = new PropertyValueConstructor({
          propertyName: property.name,
          propertyId: property.id,
          languageCode: locale,
          alias: aliasValue.alias,
          valueType: property.valueType,
          valueId: aliasValue.valueId,
        } as unknown as Partial<TPropertyValue>);

        property.values?.push(newValue);
      }
    }

    if (isDictionaryProperty(property)) {
      return valueForLocale?.valueId as string;
    }

    return valueForLocale?.value as string;
  }

  function getSingleLanguageValue(property: TProperty): string | TPropertyValue[] {
    if (isMultivalueProperty(property)) {
      return property.values as TPropertyValue[];
    }

    const firstValue = property.values?.[0];
    if (!firstValue) return "";

    if (isDictionaryProperty(property)) {
      return firstValue.valueId as string;
    }

    return firstValue.value as string;
  }

  function getPropertyValue(property: TProperty, locale: string) {
    if (isMultilanguageProperty(property)) {
      return getMultilanguageValue(property, locale);
    }
    return getSingleLanguageValue(property);
  }

  // === VALUE SETTERS ===

  function createPropertyValue(params: Partial<TPropertyValue>): TPropertyValue {
    return new PropertyValueConstructor({
      isInherited: false,
      ...params,
    } as unknown as Partial<TPropertyValue>);
  }

  function setMeasurePropertyValue(property: TProperty, value: unknown, unitOfMeasureId?: string): void {
    property.values = [
      createPropertyValue({
        value,
        unitOfMeasureId,
      } as Partial<TPropertyValue>),
    ];
  }

  function setColorPropertyValue(property: TProperty, value: unknown, colorCode?: string): void {
    property.values = [
      createPropertyValue({
        value,
        colorCode,
      } as Partial<TPropertyValue>),
    ];
  }

  function setDictionaryPropertyValue(
    property: TProperty,
    value: string | TPropertyValue[] | (TPropertyDictionaryItem & { value: string })[],
    dictionary: TPropertyDictionaryItem[],
  ): void {
    const dict = dictionary.map((x) => new PropertyDictionaryItemConstructor(x));

    if (isMultilanguageProperty(property)) {
      handleMultilanguageDictionary(property, value, dict);
    } else {
      handleSingleLanguageDictionary(property, value, dict);
    }
  }

  function handleMultilanguageDictionary(
    property: TProperty,
    value: string | TPropertyValue[] | (TPropertyDictionaryItem & { value: string })[],
    dict: TPropertyDictionaryItem[],
  ): void {
    if (Array.isArray(value)) {
      handleMultilanguageMultivalueDictionary(
        property,
        value as (TPropertyDictionaryItem & { value: string })[],
        dict,
      );
    } else {
      handleMultilanguageSingleValueDictionary(property, value as string, dict);
    }
  }

  function handleMultilanguageMultivalueDictionary(
    property: TProperty,
    values: (TPropertyDictionaryItem & { value: string })[],
    dict: TPropertyDictionaryItem[],
  ): void {
    property.values = values.flatMap((item) => {
      const dictItem = dict.find((x) => x.id === (item as unknown as TPropertyValue).valueId || x.id === item.id);

      if (dictItem?.localizedValues?.length) {
        return dictItem.localizedValues.map((locValue) =>
          createPropertyValue({
            propertyId: dictItem.propertyId,
            alias: dictItem.alias,
            languageCode: locValue.languageCode,
            value: locValue.value ?? dictItem.alias,
            valueId: dictItem.id,
            colorCode: dictItem.colorCode,
          } as Partial<TPropertyValue>),
        );
      }

      return createPropertyValue(item as unknown as Partial<TPropertyValue>);
    });
  }

  function handleMultilanguageSingleValueDictionary(
    property: TProperty,
    value: string,
    dict: TPropertyDictionaryItem[],
  ): void {
    const dictionaryItem = dict.find((x) => x.id === value);

    if (dictionaryItem?.localizedValues) {
      property.values = dictionaryItem.localizedValues.map((locValue) =>
        createPropertyValue({
          propertyId: dictionaryItem.propertyId,
          alias: dictionaryItem.alias,
          languageCode: locValue.languageCode,
          value: locValue.value ?? dictionaryItem.alias,
          valueId: dictionaryItem.id,
          colorCode: dictionaryItem.colorCode,
        } as Partial<TPropertyValue>),
      );
    } else {
      property.values = [];
    }
  }

  function handleSingleLanguageDictionary(
    property: TProperty,
    value: string | TPropertyValue[] | (TPropertyDictionaryItem & { value: string })[],
    dict: TPropertyDictionaryItem[],
  ): void {
    if (Array.isArray(value)) {
      handleSingleLanguageMultivalueDictionary(
        property,
        value as (TPropertyDictionaryItem & { value: string })[],
        dict,
      );
    } else {
      handleSingleLanguageSingleValueDictionary(property, value as string, dict);
    }
  }

  function handleSingleLanguageMultivalueDictionary(
    property: TProperty,
    values: (TPropertyDictionaryItem & { value: string })[],
    dict: TPropertyDictionaryItem[],
  ): void {
    property.values = values.flatMap((item) => {
      const dictItem = dict.find((x) => x.id === (item as unknown as TPropertyValue).valueId || x.id === item.id);

      if (dictItem) {
        return createPropertyValue({
          propertyId: dictItem.propertyId,
          alias: dictItem.alias,
          value: item.value ?? dictItem.alias,
          valueId: dictItem.id,
          colorCode: dictItem.colorCode,
        } as Partial<TPropertyValue>);
      }

      return createPropertyValue(item as unknown as Partial<TPropertyValue>);
    });
  }

  function handleSingleLanguageSingleValueDictionary(
    property: TProperty,
    value: string,
    dict: TPropertyDictionaryItem[],
  ): void {
    if (isEmptyValue(value)) {
      property.values = [];
      return;
    }

    const dictionaryItem = dict.find((x) => x.id === value);
    property.values = [
      createPropertyValue({
        propertyId: dictionaryItem?.propertyId,
        alias: dictionaryItem?.alias,
        value: (dictionaryItem as TPropertyDictionaryItem & { value: string })?.value ?? dictionaryItem?.alias,
        valueId: value,
        colorCode: dictionaryItem?.colorCode,
      } as Partial<TPropertyValue>),
    ];
  }

  function setRegularPropertyValue(
    property: TProperty,
    value: string | TPropertyValue[] | (TPropertyDictionaryItem & { value: string })[],
    locale?: string,
    initialProp?: TProperty,
  ): void {
    if (isMultilanguageProperty(property)) {
      handleMultilanguageRegularProperty(property, value, locale);
    } else {
      handleSingleLanguageRegularProperty(property, value, locale, initialProp);
    }
  }

  function handleMultilanguageRegularProperty(
    property: TProperty,
    value: string | TPropertyValue[] | (TPropertyDictionaryItem & { value: string })[],
    locale?: string,
  ): void {
    if (Array.isArray(value)) {
      // Multivalue multilanguage
      property.values =
        property.values &&
        ([
          ...property.values.filter((x) => x.languageCode !== locale),
          ...(value as TPropertyValue[]).map((item) =>
            createPropertyValue({ ...item, languageCode: locale } as Partial<TPropertyValue>),
          ),
        ] as TPropertyValue[]);
    } else {
      // Single value multilanguage
      const existingValue = property.values?.find((x) => x.languageCode === locale);
      if (existingValue) {
        existingValue.value = value as string;
      } else {
        property.values = [
          createPropertyValue({
            value: value as string,
            languageCode: locale,
          } as Partial<TPropertyValue>),
        ];
      }
    }
  }

  function handleSingleLanguageRegularProperty(
    property: TProperty,
    value: string | TPropertyValue[] | (TPropertyDictionaryItem & { value: string })[],
    locale?: string,
    initialProp?: TProperty,
  ): void {
    if (Array.isArray(value)) {
      // Multivalue
      property.values = (value as TPropertyValue[]).map((item) => createPropertyValue(item as Partial<TPropertyValue>));
    } else {
      handleSingleValueRegularProperty(property, value, locale, initialProp);
    }
  }

  function handleSingleValueRegularProperty(
    property: TProperty,
    value: string | (TPropertyDictionaryItem & { value: string }),
    locale?: string,
    initialProp?: TProperty,
  ): void {
    if (typeof value === "boolean") {
      handleBooleanValue(property, value, initialProp);
    } else if (isEmptyValue(value)) {
      handleEmptyValue(property, value, locale, initialProp);
    } else {
      handleNonEmptyValue(property, value as string);
    }
  }

  function handleBooleanValue(property: TProperty, value: boolean, initialProp?: TProperty): void {
    if (initialProp?.values?.length) {
      property.values = [
        property.values?.[0]
          ? Object.assign(property.values[0], { value })
          : createPropertyValue({ value } as Partial<TPropertyValue>),
      ];
    } else if (value) {
      property.values = [createPropertyValue({ value } as Partial<TPropertyValue>)];
    } else {
      property.values = [];
    }
  }

  function handleEmptyValue(property: TProperty, value: unknown, locale?: string, initialProp?: TProperty): void {
    const hadOriginalValue = initialProp?.values?.find((v) =>
      isMultilanguageProperty(property) ? v.languageCode === locale : true,
    )?.value;

    const originalWasEmpty = isEmptyValue(hadOriginalValue);

    if (originalWasEmpty) {
      property.values = [
        createPropertyValue({
          value: value as string,
          languageCode: isMultilanguageProperty(property) ? locale : undefined,
        } as Partial<TPropertyValue>),
      ];
    } else {
      property.values = [];
    }
  }

  function handleNonEmptyValue(property: TProperty, value: string): void {
    if (property.values?.[0]) {
      Object.assign(property.values[0], { value });
    } else {
      property.values = [createPropertyValue({ value } as Partial<TPropertyValue>)];
    }
  }

  // === MAIN SET PROPERTY VALUE FUNCTION ===

  function setPropertyValue(params: SetPropertyValueParams<TProperty, TPropertyValue, TPropertyDictionaryItem>): void {
    const { property, value, dictionary, locale, initialProp, unitOfMeasureId, colorCode } = params;

    if (isMeasureProperty(property)) {
      setMeasurePropertyValue(property, value, unitOfMeasureId);
      return;
    }

    if (isColorProperty(property) && !dictionary?.length) {
      setColorPropertyValue(property, value, colorCode);
      return;
    }

    if (dictionary?.length) {
      setDictionaryPropertyValue(property, value, dictionary);
      return;
    }

    setRegularPropertyValue(property, value, locale, initialProp);
  }

  // === RETURN API ===

  const loading = useLoading(dictionaryItemsLoading);

  return {
    loading,
    loadDictionaries,
    getPropertyValue,
    setPropertyValue,
    loadMeasurements,
  };
};
