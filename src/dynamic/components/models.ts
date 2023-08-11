/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  VcButton,
  VcCard,
  VcCheckbox,
  VcCol,
  VcDynamicProperty,
  VcEditor,
  VcGallery,
  VcIcon,
  VcInput,
  VcInputCurrency,
  VcLabel,
  VcRow,
  VcSelect,
} from "@vc-shell/framework";
import { ComputedRef, Raw, Ref, Slots } from "vue";
import type { ComponentProps, ComponentEmit, ComponentSlots, ComponentExposed } from "vue-component-type-helpers";

type FromGenericEventsToProps<T extends Record<string, any>> = T extends Record<string, any>
  ? {
      [K in string & `on${Capitalize<string & keyof T>}`]?: K extends `on${infer C}`
        ? (...args: T[Uncapitalize<C>]) => any
        : never;
    }
  : never;

interface FieldOpts<T> {
  component?: ComponentType<T>;
  rules?: string | Record<string, unknown>;
  rawProperty?: any;
  context?: any;
  name?: string;
  validate?: boolean;
  classNames?: string;
}

interface Collection<T> {
  component: ComponentType<T>;
  title: string;
  children: FormFields;
  classNames?: string;
}

export type ComponentType<T> = Raw<T>;

export type FormFields = {
  [key: string]: ControlType;
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
  | IFieldset;

export interface IControlBase {
  rules?: string | Record<string, unknown>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  context?: any;
  validate?: boolean;
  classNames?: string;
  rawProperty?: string;
  modelValue?: any;
}

export type ISelectField = ComponentProps<typeof VcSelect> & {
  slots?: Partial<ComponentSlots<typeof VcSelect>>;
} & FieldOpts<typeof VcSelect>;

export type IInputField = ComponentProps<typeof VcInput> & FieldOpts<typeof VcInput>;

export type ICardCollection = Collection<typeof VcCard> & {
  slots?: Partial<Pick<ComponentSlots<typeof VcCard>, "default" | "actions">>;
};

export type IDynamicProperties = ComponentProps<typeof VcDynamicProperty> &
  FromGenericEventsToProps<ComponentEmit<typeof VcDynamicProperty>> &
  FieldOpts<typeof VcDynamicProperty> & { noValidation: boolean };

export type IEditorField = ComponentProps<typeof VcEditor> & FieldOpts<typeof VcEditor>;

export type IGallery = ComponentProps<typeof VcGallery> &
  FieldOpts<typeof VcGallery> & { modelValue?: ComponentProps<typeof VcGallery>["images"] };

export type ICheckbox = ComponentProps<typeof VcCheckbox> & {
  slots?: Partial<Pick<ComponentSlots<typeof VcCheckbox>, "default" | "error">>;
} & FieldOpts<typeof VcCheckbox>;

export type IButton = ComponentProps<typeof VcButton> & {
  slots?: Partial<Pick<ComponentSlots<typeof VcButton>, "default">>;
} & FieldOpts<typeof VcButton> & { noValidation: boolean };

export type IInputCurrency = ComponentProps<typeof VcInputCurrency> & FieldOpts<typeof VcInputCurrency>;

export type IFieldset = {
  content?: ComputedRef<
    {
      columns?: number;
      property?: string;
      remove?: { method?: string };
      fields?: FormFields;
    }[]
  >;
};
