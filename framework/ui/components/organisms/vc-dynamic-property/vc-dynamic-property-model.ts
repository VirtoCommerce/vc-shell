import { VNode } from "vue";

export interface VcDynamicPropertyProps {
  property?: Record<string, any> | undefined;
  dictionaries?: Record<string, any> | undefined;
  getter?: (
    property: Record<string, any>,
    isDictionary?: boolean
  ) => Record<string, any> | string | number | boolean | Date | undefined;
  optionsGetter?: (
    property: Record<string, any>,
    keyword?: string
  ) => Promise<any[] | undefined>;
  setter?: (
    property: Record<string, any>,
    value: Record<string, any> | string | number | boolean,
    dictionary?: any[]
  ) => void | undefined;
  culture?: string | undefined;
  disabled?: boolean | undefined;
}

export interface VcDynamicPropertySlots {
  default: () => VNode[];
}
