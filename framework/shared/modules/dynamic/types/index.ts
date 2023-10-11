import { VcButton, VcIcon, VcInput, VcStatus } from "./../../../../ui/components";
import { ITableColumns, IValidationRules } from "../../../../core/types";
import type { ComponentProps, ComponentEmit, ComponentSlots } from "vue-component-type-helpers";

export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type Composable<T> = T[keyof T];

export type DynamicSchema = DynamicGridSchema | DynamicDetailsSchema;

export interface DynamicGridSchema {
  /**
   * @description Blade settings
   */
  settings: SettingsSchema;
  content: [ListContentSchema];
}

export interface DynamicDetailsSchema {
  /**
   * @description Blade settings
   */
  settings: SettingsSchema;
  /**
   * @description Blade content
   */
  content: [FormContentSchema, WidgetsSchema?];
}

export type SettingsSchema = SettingsWorkspace | SettingsDetails;

export interface SettingsWorkspace extends SettingsBase {
  moduleName: string;
}

export interface SettingsDetails extends SettingsBase {
  status?: {
    component: string;
  };
}

export interface SettingsBase {
  /**
   * @description Blade url
   */
  url?: string;
  /**
   * @description Locale key for VueI18n locale files
   */
  localizationPrefix: string;
  /**
   * @description Required component name
   */
  name: string;
  /**
   * @description Blade default header title
   */
  titleTemplate: string;
  /**
   * @description Composable to use at {@link SettingsBase.model } blade component view
   */
  composable: string;
  /**
   * @description Toolbar items array
   * @default 'save', 'delete' in {@link SettingsDetails}
   * @default 'refresh', 'add' in {@link SettingsWorkspace}
   */
  toolbar: {
    id: string;
    title: string;
    icon: string;
    method: string;
  }[];
  /**
   * @description Blade component view template
   */
  template: string;
  /**
   * @description Blade permissions
   */
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
  mobileTemplate?: {
    component: string;
  };
  notFoundTemplate?: {
    component: string;
  };
  emptyTemplate?: {
    component: string;
  };
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
export interface SchemaBase {
  id: string;
  label?: string;
  property?: string;
  name?: string;
  rules?: IValidationRules;
  placeholder?: string;
  disabled?: { method: string };
  tooltip?: string;
  visibility?: VisibilityOptions;
  multilanguage?: boolean;
  update?: { method: string };
}

export interface SelectSchema extends SchemaBase {
  type: "select";
  optionValue: string;
  optionLabel: string;
  optionsMethod: string;
  customTemplate?: {
    component: string;
  };
  clearable?: boolean;
  emitValue?: boolean;
}

export interface InputSchema extends SchemaBase {
  type: "input";
  variant?: ComponentProps<typeof VcInput>["type"];
  clearable?: boolean;
}

export interface StatusSchema extends SchemaBase {
  type: "status";
  outline?: boolean;
  extend?: boolean;
  variant?: ComponentProps<typeof VcStatus>["variant"];
  icon?: string;
  iconSize?: ComponentProps<typeof VcIcon>["size"];
  iconVariant?: ComponentProps<typeof VcIcon>["variant"];
  title?: string;
  content: {
    method: string;
  };
}

export interface InputCurrencySchema extends SchemaBase {
  type: "input-currency";
  optionProperty: string;
  optionValue?: string;
  optionLabel?: string;
  clearable?: boolean;
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
  uploadFolder: string;
}

export interface CardSchema extends SchemaBase {
  type: "card";
  fields: ControlSchema[];
  action?: ButtonSchema & { method: string };
  collapsible?: boolean;
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
  icon?: string;
  iconSize?: ComponentProps<typeof VcIcon>["size"];
  text?: boolean;
  method?: string;
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
  | ButtonSchema
  | InputCurrencySchema
  | StatusSchema;

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
  value: ControlSchema | SettingsSchema["toolbar"][number];
  name: string;
}

export interface OverridesRemove {
  path: string;
  name: string;
}
