import type { IBaseProperty, PropertyDisplayValue } from "../types";
import type { PropertyValueStrategy, PropertyInputValue, SetContext } from "./types";
import { isEmptyValue, createValue, cleanEmptyValues } from "../utils";

export const measureStrategy: PropertyValueStrategy = {
  get(property: IBaseProperty, _locale: string): PropertyDisplayValue {
    return (property.values?.[0]?.value as string) ?? "";
  },

  set(property: IBaseProperty, value: PropertyInputValue, context: SetContext): void {
    if (isEmptyValue(value)) {
      cleanEmptyValues(property);
      return;
    }
    property.values = [createValue({ value, unitOfMeasureId: context.unitOfMeasureId })];
  },
};
