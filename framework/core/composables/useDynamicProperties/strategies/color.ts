import type { IBaseProperty, IBasePropertyValue, PropertyDisplayValue } from "../types";
import type { PropertyValueStrategy, PropertyInputValue, SetContext } from "./types";
import { isEmptyValue, isMultivalueProperty, createValue, cleanEmptyValues } from "../utils";

export const colorStrategy: PropertyValueStrategy = {
  get(property: IBaseProperty, _locale: string): PropertyDisplayValue {
    if (isMultivalueProperty(property)) {
      return (property.values ?? []) as IBasePropertyValue[];
    }
    return (property.values?.[0]?.value as string) ?? "";
  },

  set(property: IBaseProperty, value: PropertyInputValue, context: SetContext): void {
    if (!Array.isArray(value) && isEmptyValue(value)) {
      cleanEmptyValues(property);
      return;
    }

    if (Array.isArray(value)) {
      property.values = (value as IBasePropertyValue[]).map((item) =>
        createValue({ ...item, value: item.value, colorCode: item.colorCode }),
      );
    } else {
      property.values = [createValue({ value, colorCode: context.colorCode })];
    }
  },
};
