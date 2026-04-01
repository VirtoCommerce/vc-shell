import type { IBaseProperty, IBasePropertyValue } from "./types";

export function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "number" && isNaN(value)) return true;
  if (typeof value === "string" && value.trim().length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
}

export function isMultilanguageProperty(property: IBaseProperty): boolean {
  return Boolean(property.multilanguage);
}

export function isMultivalueProperty(property: IBaseProperty): boolean {
  return Boolean(property.multivalue);
}

export function isDictionaryProperty(property: IBaseProperty): boolean {
  return Boolean(property.dictionary);
}

export function isMeasureProperty(property: IBaseProperty): boolean {
  return property.valueType === "Measure";
}

export function isColorProperty(property: IBaseProperty): boolean {
  return property.valueType === "Color";
}

export function createValue(params: Partial<IBasePropertyValue>): IBasePropertyValue {
  return { isInherited: false, ...params };
}

export function cleanEmptyValues(property: IBaseProperty, locale?: string): void {
  if (!property.values) return;

  if (isMultilanguageProperty(property) && locale) {
    property.values = property.values.filter((v) => v.languageCode !== locale);
  } else {
    property.values = [];
  }

  if (property.values.length > 0 && property.values.every((v) => isEmptyValue(v.value))) {
    property.values = [];
  }
}
