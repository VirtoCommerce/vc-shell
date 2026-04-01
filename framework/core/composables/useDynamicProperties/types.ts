import type { ComputedRef } from "vue";

// === Base interfaces (unchanged — used by consumers and VcDynamicProperty) ===

export interface IBaseProperty<TPropertyValue extends IBasePropertyValue = IBasePropertyValue> {
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
  value?: any;
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

// === New clean API types ===

export interface DynamicPropertiesOptions {
  searchDictionary: (
    criteria: IBasePropertyDictionaryItemSearchCriteria,
  ) => Promise<IBasePropertyDictionaryItem[] | undefined>;
  searchMeasurements?: (measureId: string, locale?: string) => Promise<IBaseMeasurementDictionaryItem[] | undefined>;
}

export type PropertyDisplayValue = string | IBasePropertyValue[] | boolean;

export interface SetPropertyValueParams {
  property: IBaseProperty;
  value: string | IBasePropertyValue[] | (IBasePropertyDictionaryItem & { value: string })[];
  dictionary?: IBasePropertyDictionaryItem[];
  locale?: string;
  initialProp?: IBaseProperty;
  unitOfMeasureId?: string;
  colorCode?: string;
}

export interface UseDynamicPropertiesReturn {
  getPropertyValue: (property: IBaseProperty, locale: string) => PropertyDisplayValue;
  setPropertyValue: (params: SetPropertyValueParams) => void;
  loadDictionaries: (
    propertyId: string,
    keyword?: string,
    locale?: string,
  ) => Promise<IBasePropertyDictionaryItem[] | undefined>;
  loadMeasurements: (
    measureId: string,
    keyword?: string,
    locale?: string,
  ) => Promise<IBaseMeasurementDictionaryItem[] | undefined>;
  loading: ComputedRef<boolean>;
}
