import type { IBaseProperty, IBasePropertyValue, IBasePropertyDictionaryItem, PropertyDisplayValue } from "../types";
import type { PropertyValueStrategy, PropertyInputValue, SetContext } from "./types";
import { isEmptyValue, isMultilanguageProperty, isMultivalueProperty, createValue, cleanEmptyValues } from "../utils";

export const dictionaryStrategy: PropertyValueStrategy = {
  get(property: IBaseProperty, locale: string): PropertyDisplayValue {
    if (isMultilanguageProperty(property)) {
      if (isMultivalueProperty(property)) {
        return (property.values?.filter((v) => v.languageCode === locale) ?? []) as IBasePropertyValue[];
      }
      // Find by locale first, then fallback to value without languageCode
      const val =
        property.values?.find((v) => v.languageCode === locale) ??
        property.values?.find((v) => !v.languageCode);
      return (val?.valueId as string) ?? "";
    }

    if (isMultivalueProperty(property)) {
      return (property.values ?? []) as IBasePropertyValue[];
    }

    return (property.values?.[0]?.valueId as string) ?? "";
  },

  set(property: IBaseProperty, value: PropertyInputValue, context: SetContext): void {
    const { dictionary, locale } = context;

    // Empty value → clean up regardless of dictionary presence
    if (!Array.isArray(value) && isEmptyValue(value)) {
      cleanEmptyValues(property, locale);
      return;
    }

    if (!dictionary?.length) return;

    if (isMultilanguageProperty(property)) {
      setMultilanguageDictionary(property, value, dictionary, locale);
    } else {
      setSingleLanguageDictionary(property, value, dictionary);
    }
  },
};

function setMultilanguageDictionary(
  property: IBaseProperty,
  value: PropertyInputValue,
  dictionary: IBasePropertyDictionaryItem[],
  locale?: string,
): void {
  if (Array.isArray(value)) {
    setMultilanguageMultivalueDictionary(property, value as (IBasePropertyDictionaryItem & { value: string })[], dictionary);
  } else {
    setMultilanguageSingleValueDictionary(property, value as string, dictionary, locale);
  }
}

function setMultilanguageMultivalueDictionary(
  property: IBaseProperty,
  values: (IBasePropertyDictionaryItem & { value: string })[],
  dictionary: IBasePropertyDictionaryItem[],
): void {
  property.values = values.flatMap((item) => {
    const dictItem = dictionary.find(
      (x) => x.id === (item as unknown as IBasePropertyValue).valueId || x.id === item.id,
    );

    if (dictItem?.localizedValues?.length) {
      return dictItem.localizedValues.map((locValue) =>
        createValue({
          propertyId: dictItem.propertyId,
          alias: dictItem.alias,
          languageCode: locValue.languageCode,
          value: locValue.value ?? dictItem.alias,
          valueId: dictItem.id,
          colorCode: dictItem.colorCode,
        }),
      );
    }

    return createValue(item as unknown as Partial<IBasePropertyValue>);
  });
}

function setMultilanguageSingleValueDictionary(
  property: IBaseProperty,
  value: string,
  dictionary: IBasePropertyDictionaryItem[],
  locale?: string,
): void {
  const dictionaryItem = dictionary.find((x) => x.id === value);

  if (!dictionaryItem) {
    property.values = [];
    return;
  }

  if (dictionaryItem.localizedValues?.length) {
    property.values = dictionaryItem.localizedValues.map((locValue) =>
      createValue({
        propertyId: dictionaryItem.propertyId,
        alias: dictionaryItem.alias,
        languageCode: locValue.languageCode,
        value: locValue.value ?? dictionaryItem.alias,
        valueId: dictionaryItem.id,
        colorCode: dictionaryItem.colorCode,
      }),
    );
  } else {
    const existingLanguageCodes = [
      ...new Set((property.values ?? []).map((v) => v.languageCode).filter(Boolean)),
    ];
    const languageCodes = existingLanguageCodes.length > 0 ? existingLanguageCodes : locale ? [locale] : [];

    property.values = languageCodes.map((langCode) =>
      createValue({
        propertyId: dictionaryItem.propertyId,
        alias: dictionaryItem.alias,
        languageCode: langCode,
        value: dictionaryItem.alias,
        valueId: dictionaryItem.id,
        colorCode: dictionaryItem.colorCode,
      }),
    );
  }
}

function setSingleLanguageDictionary(
  property: IBaseProperty,
  value: PropertyInputValue,
  dictionary: IBasePropertyDictionaryItem[],
): void {
  if (Array.isArray(value)) {
    property.values = (value as (IBasePropertyDictionaryItem & { value: string })[]).flatMap((item) => {
      const dictItem = dictionary.find(
        (x) => x.id === (item as unknown as IBasePropertyValue).valueId || x.id === item.id,
      );

      if (dictItem) {
        return createValue({
          propertyId: dictItem.propertyId,
          alias: dictItem.alias,
          value: item.value ?? dictItem.alias,
          valueId: dictItem.id,
          colorCode: dictItem.colorCode,
        });
      }

      return createValue(item as unknown as Partial<IBasePropertyValue>);
    });
  } else {
    if (isEmptyValue(value)) {
      property.values = [];
      return;
    }

    const dictionaryItem = dictionary.find((x) => x.id === value);
    property.values = [
      createValue({
        propertyId: dictionaryItem?.propertyId,
        alias: dictionaryItem?.alias,
        value: (dictionaryItem as IBasePropertyDictionaryItem & { value: string })?.value ?? dictionaryItem?.alias,
        valueId: value as string,
        colorCode: dictionaryItem?.colorCode,
      }),
    ];
  }
}
