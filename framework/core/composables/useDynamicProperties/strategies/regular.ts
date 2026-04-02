import type { IBaseProperty, IBasePropertyValue, PropertyDisplayValue } from "../types";
import type { PropertyValueStrategy, PropertyInputValue, SetContext } from "./types";
import { isEmptyValue, isMultilanguageProperty, isMultivalueProperty, createValue, cleanEmptyValues } from "../utils";

export const regularStrategy: PropertyValueStrategy = {
  get(property: IBaseProperty, locale: string): PropertyDisplayValue {
    if (isMultilanguageProperty(property)) {
      if (isMultivalueProperty(property)) {
        return (property.values?.filter((v) => v.languageCode === locale) ?? []) as IBasePropertyValue[];
      }
      // Find by locale first, then fallback to value without languageCode
      const val =
        property.values?.find((v) => v.languageCode === locale) ?? property.values?.find((v) => !v.languageCode);
      return (val?.value as string) ?? "";
    }

    if (isMultivalueProperty(property)) {
      return (property.values ?? []) as IBasePropertyValue[];
    }

    return (property.values?.[0]?.value as string) ?? "";
  },

  set(property: IBaseProperty, value: PropertyInputValue, context: SetContext): void {
    if (!Array.isArray(value) && isEmptyValue(value)) {
      cleanEmptyValues(property, context.locale);
      return;
    }

    if (isMultilanguageProperty(property)) {
      if (Array.isArray(value)) {
        const otherLocales = property.values?.filter((v) => v.languageCode !== context.locale) ?? [];
        const newValues = (value as IBasePropertyValue[]).map((item) =>
          createValue({ ...item, languageCode: context.locale }),
        );
        property.values = [...otherLocales, ...newValues];
      } else {
        const existing = property.values?.find((v) => v.languageCode === context.locale);
        if (existing) {
          existing.value = value as string;
        } else {
          if (!property.values) property.values = [];
          property.values.push(createValue({ value: value as string, languageCode: context.locale }));
        }
      }
      return;
    }

    if (Array.isArray(value)) {
      property.values = (value as IBasePropertyValue[]).map((item) => createValue(item));
      return;
    }

    if (property.values?.[0]) {
      Object.assign(property.values[0], { value });
    } else {
      property.values = [createValue({ value: value as string })];
    }
  },
};
