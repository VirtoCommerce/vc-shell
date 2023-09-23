import { ITableColumns } from "../../../../core/types";

export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type Composable<T> = T[keyof T];

export type DynamicSchema = DynamicGridSchema | DynamicDetailsSchema;

export interface DynamicGridSchema {
  settings: SettingsSchema;
  content: [ListContentSchema];
}

export interface DynamicDetailsSchema {
  settings: SettingsSchema;
  content: [FormContentSchema, WidgetsSchema?];
}

export type SettingsSchema = SettingsWorkspace | SettingsDetails;

export interface SettingsWorkspace extends SettingsBase {
  moduleName: string;
  icon: string;
}

export interface SettingsDetails extends SettingsBase {
  status?: {
    component: string;
  };
  multilanguage?: boolean;
}

export interface SettingsBase {
  url?: string;
  name: string;
  titleTemplate: string;
  composable: string;
  toolbar: {
    id: string;
    title: string;
    icon: string;
    method: string;
  }[];
  model: string;
  permissions?: string | string[];
}

export interface ListContentSchema extends SchemaBase {
  type: "grid";
  filter?: FilterCheckbox | FilterDateInput;
  multiselect?: boolean;
  header?: boolean;
  columns?: (ITableColumns & {
    id: string;
    title: string;
    sortable?: boolean;
    alwaysVisible?: boolean;
    type?: string;
    customTemplate?: GridTemplateOverride;
  })[];
}

export interface FormContentSchema extends SchemaBase {
  type: "form";
  children: ControlSchema[];
}

export interface GridTemplateOverride {
  component?: string;
}

export interface VisibilityOptions {
  method: string;
}

export interface RulesBase {
  [x: string]: boolean | string;
  required?: boolean;
}

export interface SchemaBase {
  id: string;
  label?: string;
  property?: string;
  name?: string;
  rules?: RulesBase;
  placeholder?: string;
  disabled?: { method: string };
}

export interface SelectSchema extends SchemaBase {
  type: "select";
  optionValue: string;
  optionLabel: string;
  method: string;
  tooltip?: string;
  visibility?: VisibilityOptions;
  customTemplate?: {
    component: string;
  };
}

export interface InputSchema extends SchemaBase {
  type: "input";
  variant?: "text" | "password" | "email" | "tel" | "number" | "url" | "time" | "date" | "datetime-local";
}

export interface InputCurrencySchema extends SchemaBase {
  type: "input-currency";
  optionProperty: string;
  optionValue?: string;
  optionLabel?: string;
}

export interface EditorSchema extends SchemaBase {
  type: "editor";
}

export interface DynamicPropertiesSchema extends SchemaBase {
  type: "dynamic-properties";
  exclude?: string[];
  include?: string[];
}

export interface GallerySchema extends SchemaBase {
  type: "gallery";
}

export interface CardSchema extends SchemaBase {
  type: "card";
  children: ControlSchema[];
  action?: ButtonSchema & { method: string };
}

export interface WidgetsSchema extends SchemaBase {
  type: "widgets";
  children: string[];
}

export interface CheckboxSchema extends SchemaBase {
  type: "checkbox";
  content: string;
  trueValue?: boolean;
  falseValue?: boolean;
}

export interface FieldsetSchema extends SchemaBase {
  type: "fieldset";
  columns?: number;
  fields: Exclude<ControlSchema[], FieldsetSchema>;
  remove?: {
    method: string;
  };
}

export interface ButtonSchema extends SchemaBase {
  type: "button";
  content: string;
  small?: boolean;
}

export type ControlSchema =
  | SelectSchema
  | InputSchema
  | EditorSchema
  | DynamicPropertiesSchema
  | GallerySchema
  | CardSchema
  | WidgetsSchema
  | CheckboxSchema
  | FieldsetSchema
  | InputCurrencySchema;

interface FilterBase {
  columns: {
    title: string;
    controls: {
      field: string;
      type: string;
    }[];
  }[];
}

type FilterCheckbox = FilterBase & {
  columns: {
    controls: {
      data?: { value: string; displayName: string }[];
    }[];
  }[];
};

type FilterDateInput = FilterBase & {
  columns: {
    controls: {
      label?: string;
    }[];
  }[];
};

export interface OverridesSchema {
  upsert?: (OverridesUpsert | OverridesReplace)[];
  remove?: OverridesRemove[];
}

export interface OverridesUpsert extends OverridesReplace {
  index: number;
}

export interface OverridesReplace {
  path: string;
  value: ControlSchema;
}

export interface OverridesRemove {
  path: string;
}
