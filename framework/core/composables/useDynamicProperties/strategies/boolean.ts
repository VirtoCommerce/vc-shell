import type { IBaseProperty, PropertyDisplayValue } from "../types";
import type { PropertyValueStrategy, PropertyInputValue, SetContext } from "./types";
import { isMultilanguageProperty, createValue } from "../utils";

export const booleanStrategy: PropertyValueStrategy = {
  get(property: IBaseProperty, locale: string): PropertyDisplayValue {
    if (isMultilanguageProperty(property)) {
      const val =
        property.values?.find((v) => v.languageCode === locale) ?? property.values?.find((v) => !v.languageCode);
      return val?.value ?? false;
    }
    return property.values?.[0]?.value ?? false;
  },

  set(property: IBaseProperty, value: PropertyInputValue, _context: SetContext): void {
    if (property.values?.[0]) {
      Object.assign(property.values[0], { value });
    } else {
      property.values = [createValue({ value })];
    }
  },
};
