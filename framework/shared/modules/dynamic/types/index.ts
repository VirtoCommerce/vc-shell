import { VcButton, VcField, VcIcon, VcImage, VcInput, VcStatus, VcVideo } from "./../../../../ui/components";
import { ITableColumns, IValidationRules } from "../../../../core/types";
import type { ComponentProps, ComponentEmit, ComponentSlots } from "vue-component-type-helpers";

export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type Composable<T> = T[keyof T];

export type DynamicSchema = DynamicGridSchema | DynamicDetailsSchema;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

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

export interface ListContentSchema {
  id: string;
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

export interface FormContentSchema {
  id: string;
  component: "vc-form";
  children: ControlSchema[];
}

export interface GridTemplateOverride {
  component?: string;
}

/**
 * Base component schema interface.
 */
export interface SchemaBase {
  /** Unique identifier for component.
   * @type {string}
   */
  id: string;
  /** Control label.
   * @type {string}
   */
  label?: string;
  /** Property name to populate the component with data.
   * @type {string}
   */
  property: string;
  /** Vee-validate and custom validation rules for the schema.
   *
   * Available rules - {@link IValidationRules}
   * @type {IValidationRules}
   */
  rules?: IValidationRules;
  /** Placeholder text for component.
   * @type {string}
   */
  placeholder?: string;
  /** Disabled state for component.
   * @description Method should be defined in the blade `scope`.
   * Method should return boolean value.
   * @type {{ method: string }}
   */
  disabled?: { method: string };
  /** Tooltip text for component.
   * @type {string}
   */
  tooltip?: string;
  /** Visibility options for component.
   * @description Method should be defined in the blade `scope`.
   * Method should return boolean value.
   * @type {{ method: string }}
   */
  visibility?: {
    method: string;
  };
  /** Flag to indicate if the component supports multilanguage.
   * @type {boolean}
   */
  multilanguage?: boolean;
  /** Additional method that is called when the modelValue of the component changes
   * @description Method should be defined in the blade `scope`.
   * @type {{ method: string }}
   */
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
  prepend?: ControlSchema;
  append?: ControlSchema;
  appendInner?: ControlSchema;
  prependInner?: ControlSchema;
}

export interface VideoSchema
  extends Pick<SchemaBase, "id" | "property" | "label" | "visibility" | "tooltip" | "update"> {
  component: "vc-video";
  size?: ComponentProps<typeof VcVideo>["size"];
  rounded?: boolean;
  bordered?: boolean;
  clickable?: boolean;
}

export interface FieldSchema extends Pick<SchemaBase, "id" | "property" | "label" | "visibility" | "tooltip"> {
  component: "vc-field";
  variant?: ComponentProps<typeof VcField>["type"];
  copyable?: boolean;
}

export interface ImageSchema extends Pick<SchemaBase, "id" | "property" | "visibility" | "update"> {
  component: "vc-image";
  aspect?: ComponentProps<typeof VcImage>["aspect"];
  size?: ComponentProps<typeof VcImage>["size"];
  background?: ComponentProps<typeof VcImage>["background"];
  rounded?: boolean;
  bordered?: boolean;
  clickable?: boolean;
}

export interface StatusSchema extends Pick<SchemaBase, "id" | "visibility"> {
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

export interface InputCurrencySchema extends Omit<SchemaBase, "multilanguage"> {
  component: "vc-input-currency";
  optionProperty: string;
  optionValue?: string;
  optionLabel?: string;
  clearable?: boolean;
}

export interface EditorSchema extends SchemaBase {
  component: "vc-editor";
}

export interface DynamicPropertiesSchema extends Omit<SchemaBase, "rules" | "placeholder"> {
  component: "vc-dynamic-properties";
  exclude?: string[];
  include?: string[];
}

export interface GallerySchema extends Omit<SchemaBase, "placeholder" | "multilanguage"> {
  component: "vc-gallery";
  uploadFolder: string;
}

/**
 * Interface for a card schema.
 * @interface
 */
export interface CardSchema extends RequiredBy<Pick<SchemaBase, "id" | "label" | "visibility">, "label"> {
  /**
   * Component type for the card.
   * @type {"vc-card"}
   */
  component: "vc-card";
  /**
   * Array of control schemas for the fields in the card.
   * @type {ControlSchema[]}
   */
  fields: ControlSchema[];
  /**
   * Button schema for the action button in the card, along with the action method to use.
   * @type {ButtonSchema & { method: string }}
   */
  action?: ButtonSchema & { method: string };
  /**
   * Whether the card is collapsible or not.
   * @type {boolean}
   */
  collapsible?: boolean;
}

export interface WidgetsSchema extends Pick<SchemaBase, "id"> {
  component: "vc-widgets";
  children: string[];
}

export interface CheckboxSchema extends Omit<SchemaBase, "multilanguage"> {
  component: "vc-checkbox";
  content: string;
  trueValue?: boolean;
  falseValue?: boolean;
}

export interface FieldsetSchema extends PartialBy<Pick<SchemaBase, "id" | "property" | "visibility">, "property"> {
  component: "vc-fieldset";
  columns?: number;
  aspectRatio?: number[];
  fields: Exclude<ControlSchema[], FieldsetSchema>;
  remove?: {
    method: string;
  };
}

/**
 * Button schema interface.
 */
export interface ButtonSchema extends Pick<SchemaBase, "id" | "disabled" | "visibility"> {
  /**
   * Component type.
   * @type {"vc-button"}
   */
  component: "vc-button";
  /**
   * Button inner text.
   * @type {string}
   */
  content: string;
  /**
   * Small sized button.
   * @type {boolean}
   */
  small?: boolean;
  /**
   * Button icon.
   * @type {string}
   */
  icon?: string;
  /**
   * Size of the button icon.
   * @type {ComponentProps<typeof VcIcon>["size"]}
   */
  iconSize?: ComponentProps<typeof VcIcon>["size"];
  /**
   * Button as text without overlay.
   * @type {boolean}
   */
  text?: boolean;
  /**
   * Method to be called when the button is clicked.
   * @description Method should be defined in the blade `scope`.
   * @type {string}
   */
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
