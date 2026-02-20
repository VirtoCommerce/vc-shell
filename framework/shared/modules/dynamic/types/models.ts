/* eslint-disable @typescript-eslint/no-explicit-any */
import { Raw } from "vue";
import {
  VcButton,
  VcCard,
  VcCheckbox,
  VcDynamicProperty,
  VcEditor,
  VcField,
  VcGallery,
  VcImage,
  VcInput,
  VcInputCurrency,
  VcSelect,
  VcStatus,
  VcVideo,
  VcTextarea,
  VcMultivalue,
  VcSwitch,
  VcTable,
  VcRating,
  VcRadioButton,
} from "@ui/components";
import type { ComponentProps, ComponentEmit, ComponentSlots } from "vue-component-type-helpers";

type FromGenericEventsToProps<T extends Record<string, any>> =
  T extends Record<string, any>
    ? {
        [K in string & `on${Capitalize<string & keyof T>}`]?: K extends `on${infer C}`
          ? (...args: T[Uncapitalize<C>]) => any
          : never;
      }
    : never;

interface FieldOpts<T> {
  component?: ComponentType<T>;
  id?: string | number;
  props?: Record<string, any>;
}

export type ComponentType<T> = Raw<T>;

export type FormFields = {
  [key: string]: ControlType & IFieldset;
};

export type ControlType =
  | ISelectField
  | IInputField
  | ICardCollection
  | IEditorField
  | IGallery
  | IDynamicProperties
  | ICheckbox
  | IButton
  | IInputCurrency
  | IStatusField
  | IContentField
  | IImageField
  | ITextareaField
  | IVideoField
  | IMultivalueField;

export type ControlTypeWithSlots = Extract<
  ControlType,
  ISelectField | ICardCollection | ICheckbox | IButton | IStatusField
>;
export type ControlTypeCtr = Extract<ControlType, ISelectField | IInputField | IInputCurrency | IEditorField>;

/** @deprecated Legacy dynamic module interface. New components should use IFormFieldProps / ITextFieldProps from @ui/types/form-field. */
export interface IControlBaseProps {
  key?: string | number | symbol;
  rules?: Record<string, unknown>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  modelValue?: any;
  tooltip?: string;
  "onUpdate:modelValue"?: (event: any) => void;
  multilanguage?: boolean;
  classNames?: string;
}

export type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

export type IMultivalueField = {
  props: ComponentProps<typeof VcMultivalue> | IControlBaseProps;
  slots?: Partial<ComponentSlots<typeof VcMultivalue>>;
} & FieldOpts<typeof VcMultivalue>;

export type ISelectField = {
  props: ComponentProps<typeof VcSelect> | IControlBaseProps;
  slots?: Partial<ComponentSlots<typeof VcSelect>>;
} & FieldOpts<typeof VcSelect>;

export type IStatusField = {
  props: ComponentProps<typeof VcStatus>;
  slots?: Partial<Pick<ComponentSlots<typeof VcButton>, "default">>;
} & FieldOpts<typeof VcStatus>;

export type IInputField = {
  props: ComponentProps<typeof VcInput> | IControlBaseProps;

  slots?: Partial<Pick<ComponentSlots<typeof VcInput>, "append" | "prepend" | "append-inner" | "prepend-inner">>;
} & FieldOpts<typeof VcInput>;

export type IContentField = {
  props: ComponentProps<typeof VcField> | IControlBaseProps;
} & FieldOpts<typeof VcField>;

export type IVideoField = {
  props: ComponentProps<typeof VcVideo> | IControlBaseProps;
} & FieldOpts<typeof VcVideo>;

export type IImageField = {
  props: ComponentProps<typeof VcImage> | IControlBaseProps;
} & FieldOpts<typeof VcImage>;

export type IInputCurrency = {
  props: Partial<ComponentProps<typeof VcInputCurrency>> | IControlBaseProps;
} & FieldOpts<typeof VcInputCurrency>;

export type ICardCollection = {
  props: ComponentProps<typeof VcCard> | IControlBaseProps;

  slots?: Partial<Pick<ComponentSlots<typeof VcCard>, "default" | "actions">>;
} & FieldOpts<typeof VcCard>;

export type ICheckbox = {
  props: ComponentProps<typeof VcCheckbox> | IControlBaseProps;

  slots?: Partial<Pick<ComponentSlots<typeof VcCheckbox>, "default" | "error">>;
} & FieldOpts<typeof VcCheckbox>;

export type IRadioButton = {
  props: ComponentProps<typeof VcRadioButton> | IControlBaseProps;
} & FieldOpts<typeof VcRadioButton>;

export type IDynamicProperties = {
  props:
    | (ComponentProps<typeof VcDynamicProperty> & FromGenericEventsToProps<ComponentEmit<typeof VcDynamicProperty>>)
    | (ComponentProps<typeof VcDynamicProperty> &
        Omit<IControlBaseProps, keyof ComponentProps<typeof VcDynamicProperty> | "onUpdate:modelValue" | "rules">);
} & FieldOpts<typeof VcDynamicProperty>;

export type IEditorField = {
  props: ComponentProps<typeof VcEditor> | IControlBaseProps;
} & FieldOpts<typeof VcEditor>;

export type IGallery = {
  props: (ComponentProps<typeof VcGallery> & { rules: Record<string, unknown> }) | IControlBaseProps;
} & FieldOpts<typeof VcGallery>;

export type IButton = {
  props: ComponentProps<typeof VcButton>;

  slots?: Partial<Pick<ComponentSlots<typeof VcButton>, "default">>;
} & FieldOpts<typeof VcButton>;

export type IFieldset = {
  columns?: number;
  property?: string;
  remove?: { method?: string };
  fields?: ControlType[];
};

export type ITextareaField = {
  props: ComponentProps<typeof VcTextarea> | IControlBaseProps;
} & FieldOpts<typeof VcTextarea>;

export type ISwitch = {
  props: ComponentProps<typeof VcSwitch> | IControlBaseProps;
} & FieldOpts<typeof VcSwitch>;

export type ITable = {
  props: ComponentProps<typeof VcTable> | IControlBaseProps;
  slots: Partial<
    Pick<ComponentSlots<typeof VcTable>, `item_${string}` | "notfound" | "mobile-item" | "empty" | "footer">
  >;
} & FieldOpts<typeof VcTable>;

export type IRating = {
  props: ComponentProps<typeof VcRating> | IControlBaseProps;
} & FieldOpts<typeof VcRating>;
