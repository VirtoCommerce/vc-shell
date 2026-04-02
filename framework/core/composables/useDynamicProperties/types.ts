import type { ComputedRef } from "vue";

// === Base interfaces (used by consumers and VcDynamicProperty) ===

export interface IBaseProperty<TPropertyValue extends IBasePropertyValue = IBasePropertyValue> {
  id?: string | undefined;
  name?: string | undefined;
  values?: TPropertyValue[] | undefined;
  multilanguage?: boolean | undefined;
  multivalue?: boolean | undefined;
  dictionary?: boolean | undefined;
  valueType?: string | undefined;
}

export interface IBasePropertyValue {
  propertyName?: string | undefined;
  propertyId?: string | undefined;
  languageCode?: string | undefined;
  alias?: string | undefined;
  valueType?: string | undefined;
  value?: any;
  valueId?: string | undefined;
  isInherited?: boolean;
  unitOfMeasureId?: string | undefined;
  colorCode?: string | undefined;
}

export interface IBasePropertyDictionaryItem {
  id?: string | undefined;
  propertyId?: string | undefined;
  alias?: string | undefined;
  localizedValues?: { languageCode?: string | undefined; value?: string | undefined }[] | undefined;
  value?: string;
  colorCode?: string | undefined;
}

export interface IBasePropertyDictionaryItemSearchCriteria {
  propertyIds?: string[] | undefined;
  keyword?: string | undefined;
  skip?: number | undefined;
  take?: number | undefined;
}

export interface IBaseMeasurementDictionaryItem {
  code?: string | undefined;
  name?: string | undefined;
  symbol?: string | undefined;
  isDefault?: boolean;
  id?: string | undefined;
}

// ===  API types ===

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
