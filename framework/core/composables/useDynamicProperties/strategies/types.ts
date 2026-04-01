import type { IBaseProperty, IBasePropertyValue, IBasePropertyDictionaryItem, PropertyDisplayValue } from "../types";

export type PropertyInputValue = string | IBasePropertyValue[] | (IBasePropertyDictionaryItem & { value: string })[];

export interface SetContext {
  locale?: string;
  initialProp?: IBaseProperty;
  dictionary?: IBasePropertyDictionaryItem[];
  unitOfMeasureId?: string;
  colorCode?: string;
}

export interface PropertyValueStrategy {
  get(property: IBaseProperty, locale: string): PropertyDisplayValue;
  set(property: IBaseProperty, value: PropertyInputValue, context: SetContext): void;
}
