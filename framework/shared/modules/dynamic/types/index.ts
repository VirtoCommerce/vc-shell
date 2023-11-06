import { VcButton, VcField, VcIcon, VcImage, VcInput, VcStatus, VcVideo } from "./../../../../ui/components";
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
  isWorkspace: boolean;
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
   * @description Required component id
   */
  id: string;
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
   * @description Blade component
   */
  component: string;
  /**
   * @description Blade permissions
   */
  permissions?: string | string[];
  pushNotificationType?: string | string[];
}

export interface ListContentSchema extends SchemaBase {
  component: "vc-table";
  filter?: FilterSchema;
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
  reorderableRows?: boolean;
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
  component: "vc-form";
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
  rules?: IValidationRules;
  placeholder?: string;
  disabled?: { method: string };
  tooltip?: string;
  visibility?: VisibilityOptions;
  multilanguage?: boolean;
  update?: { method: string };
}

export interface SelectSchema extends SchemaBase {
  component: "vc-select";
  optionValue: string;
  optionLabel: string;
  optionsMethod: string;
  customTemplate?: {
    component: string;
  };
  clearable?: boolean;
  emitValue?: boolean;
  searchable?: boolean;
}

export interface InputSchema extends SchemaBase {
  component: "vc-input";
  variant?: ComponentProps<typeof VcInput>["type"];
  clearable?: boolean;
}

export interface VideoSchema extends SchemaBase {
  component: "vc-video";
  size?: ComponentProps<typeof VcVideo>["size"];
  rounded?: boolean;
  bordered?: boolean;
  clickable?: boolean;
}

export interface FieldSchema extends SchemaBase {
  component: "vc-field";
  variant?: ComponentProps<typeof VcField>["type"];
  copyable?: boolean;
}

export interface ImageSchema extends SchemaBase {
  component: "vc-image";
  aspect?: ComponentProps<typeof VcImage>["aspect"];
  size?: ComponentProps<typeof VcImage>["size"];
  background?: ComponentProps<typeof VcImage>["background"];
  rounded?: boolean;
  bordered?: boolean;
  clickable?: boolean;
}

export interface StatusSchema extends SchemaBase {
  component: "vc-status";
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
  component: "vc-input-currency";
  optionProperty: string;
  optionValue?: string;
  optionLabel?: string;
  clearable?: boolean;
}

export interface EditorSchema extends SchemaBase {
  component: "vc-editor";
}

export interface DynamicPropertiesSchema extends SchemaBase {
  component: "vc-dynamic-properties";
  exclude?: string[];
  include?: string[];
}

export interface GallerySchema extends SchemaBase {
  component: "vc-gallery";
  uploadFolder: string;
}

export interface CardSchema extends SchemaBase {
  component: "vc-card";
  fields: ControlSchema[];
  action?: ButtonSchema & { method: string };
  collapsible?: boolean;
}

export interface WidgetsSchema extends SchemaBase {
  component: "vc-widgets";
  children: string[];
}

export interface CheckboxSchema extends SchemaBase {
  component: "vc-checkbox";
  content: string;
  trueValue?: boolean;
  falseValue?: boolean;
}

export interface FieldsetSchema extends SchemaBase {
  component: "vc-fieldset";
  columns?: number;
  fields: Exclude<ControlSchema[], FieldsetSchema>;
  remove?: {
    method: string;
  };
}

export interface ButtonSchema extends SchemaBase {
  component: "vc-button";
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
  | StatusSchema
  | FieldSchema
  | VideoSchema
  | ImageSchema;

export interface FilterBase {
  columns: {
    title: string;
    controls: {
      field: string;
      component: InputSchema["component"] | CheckboxSchema["component"];
    }[];
  }[];
}

export type FilterCheckbox = FilterBase & {
  columns: {
    controls: {
      data?: { value: string; displayName: string }[];
    }[];
  }[];
};

export type FilterDateInput = FilterBase & {
  columns: {
    controls: {
      label?: string;
    }[];
  }[];
};

export type FilterSchema = FilterCheckbox | FilterDateInput;

export interface OverridesSchema {
  upsert?: (OverridesUpsert | OverridesReplace)[];
  remove?: OverridesRemove[];
}

export interface OverridesUpsert extends OverridesReplace {
  index: number;
}

export interface OverridesReplace {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: ControlSchema | SettingsSchema["toolbar"][number] | string | boolean;
  id: string;
}

export interface OverridesRemove {
  path: string;
  id: string;
}
