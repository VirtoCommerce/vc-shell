/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExtractTypes } from "./../../../types/ts-helpers";
import { VNode, PropType } from "vue";

export const dynamicPropertyProps = {
  property: Object as PropType<{
    [x: string]: any;
    displayNames?: { languageCode: string; name: string }[];
    name?: string | undefined;
    dictionary?: string | undefined;
    isDictionary?: string | undefined;
    multivalue?: string | undefined;
    displayName?: string | undefined;
    defaultValue?: string | undefined;
    valueType?: "ShortText" | "Number" | "Integer" | "DateTime" | "LongText" | "Boolean" | "Html" | undefined;
    values?: any | undefined;
    required?: boolean | undefined;
    isRequired?: boolean | undefined;
    validationRule?:
      | {
          charCountMin?: string;
          charCountMax?: string;
          regExp?: string;
        }
      | undefined;
  }>,
  dictionaries: Object as PropType<Record<string, any>>,
  getter: Function as PropType<
    (
      property: Record<string, any>,
      isDictionary?: boolean
    ) => Record<string, any> | string | number | boolean | Date | undefined
  >,
  optionsGetter: Function as PropType<
    (property: Record<string, any>, keyword?: string) => Promise<any[] | undefined> | any[]
  >,
  setter: Function as PropType<
    (
      property: Record<string, any>,
      value: Record<string, any> | string | number | boolean,
      dictionary?: any[]
    ) => void | undefined
  >,
  culture: {
    type: String,
    default: "en-US",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
};

export type VcDynamicPropertyProps = ExtractTypes<typeof dynamicPropertyProps>;

export interface VcDynamicPropertySlots {
  default: () => VNode[];
}
