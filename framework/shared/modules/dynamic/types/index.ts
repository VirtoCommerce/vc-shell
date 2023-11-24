import { VcField, VcGallery, VcIcon, VcImage, VcInput, VcStatus, VcVideo } from "./../../../../ui/components";
import { ITableColumns, IValidationRules } from "../../../../core/types";
import type { ComponentProps } from "./../../../utilities/vueUtils";

export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type Composable<T> = T[keyof T];

export type DynamicSchema = DynamicGridSchema | DynamicDetailsSchema;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export interface DynamicGridSchema {
  /**
   * @description Blade settings
   */
  settings: SettingsGrid;
  content: [ListContentSchema];
}

export interface DynamicDetailsSchema {
  /**
   * @description Blade settings
   */
  settings: SettingsDetails;
  /**
   * @description Blade content
   */
  content: [FormContentSchema, WidgetsSchema?];
}

export type SettingsSchema = SettingsGrid | SettingsDetails;

export interface SettingsGrid extends SettingsBase {
  component: "DynamicBladeList";
}

export interface SettingsDetails extends SettingsBase {
  component: "DynamicBladeForm";
  status?: {
    component: string;
  };
}

export type IViewComponentName = "DynamicBladeForm" | "DynamicBladeList";

export interface SettingsBase {
  /**
   * Blade url
   */
  url?: string;
  /**
   * Locale key for VueI18n locale files
   */
  localizationPrefix: string;
  /**
   * Required component id
   */
  id: string;
  /**
   * Blade default header title
   */
  titleTemplate: string;
  /**
   * Composable to use at {@link SettingsBase.model } blade component view
   */
  composable: string;
  /**
   * Toolbar items array
   *
   *  Defaults:
   *
   * [`saveChanges`, `remove`] methods in `DynamicBladeForm`
   *
   * [`openAddBlade`, `refresh`, `removeItems`, `save`] methods in `DynamicBladeList`
   */
  toolbar: {
    id: string;
    title: string;
    icon: string;
    method: string;
  }[];
  /**
   * Blade component
   */
  component: IViewComponentName;
  /**
   * Blade permissions
   */
  permissions?: string | string[];
  /**
   * The push notification types associated with the view.
   */
  pushNotificationType?: string | string[];
  /**
   * Indicates whether the view is a workspace.
   * This option is used to determine which view should be the default view.
   */
  isWorkspace?: boolean;
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
   * To show label based on some bound property - use interpolation {} syntax.
   * @example {someProperty}
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

/**
 * Select schema interface.
 * @interface
 */
export interface SelectSchema extends SchemaBase {
  /**
   * Component type for select.
   * @type {"vc-select"}
   */
  component: "vc-select";
  /**
   * Property of optionProperty which holds the `value`
   * @default id
   * @type {string}
   */
  optionValue: string;
  /**
   * Property of optionProperty which holds the `label`
   * @default title
   * @type {string}
   */
  optionLabel: string;
  /**
   * Method that is used to get select options.
   * @description Method should be defined in the blade `scope`.
   * @type {string}
   */
  optionsMethod: string;
  /**
   * Name of custom template to display data in select.
   * Component should be registered globally.
   * @type {{component: string}}
   */
  customTemplate?: {
    component: string;
  };
  /**
   * Whether the select is clearable or not.
   * @type {boolean}
   */
  clearable?: boolean;
  /**
   * Update model with the value of the selected option instead of the whole option
   * @default true
   * @example true
   * only value will be emitted
   * @example false
   * whole option will be emitted
   * {
   *  value: "someValue",
   *  label: "someLabel"
   * }
   */
  emitValue?: boolean;
  /**
   * Whether the select is searchable or not.
   * @type {boolean}
   */
  searchable?: boolean;
}

export interface TextareaSchema extends SchemaBase {
  /**
   * Component type for textarea.
   * @type {"vc-textarea"}
   */
  component: "vc-textarea";
  /**
   * Whether the textarea is clearable or not.
   * @type {boolean}
   */
  clearable?: boolean;
}

/**
 * Input schema interface.
 * @interface
 */
export interface InputSchema extends SchemaBase {
  /**
   * Component type for input.
   * @type {"vc-input"}
   */
  component: "vc-input";
  /**
   * Input type.
   * @type {"number" | "text" | "password" | "email" | "tel" | "url" | "time" | "date" | "datetime-local"}
   */
  variant?: ComponentProps<typeof VcInput>["type"];
  /**
   * Whether the input is clearable or not.
   * @type {boolean}
   */
  clearable?: boolean;
  /**
   * Schema of component to be displayed before the input.
   * @type {ControlSchema}
   */
  prepend?: ControlSchema;
  /**
   * Schema of component to be displayed after the input
   * @type {ControlSchema}
   */
  append?: ControlSchema;
  /**
   * Schema of component to be displayed inside the input after the value.
   * @type {ControlSchema}
   */
  appendInner?: ControlSchema;
  /**
   * Schema of component to be displayed inside the input before the value.
   * @type {ControlSchema}
   */
  prependInner?: ControlSchema;
}

/**
 *  Video schema interface.
 * @interface
 */
export interface VideoSchema
  extends Pick<SchemaBase, "id" | "property" | "label" | "visibility" | "tooltip" | "update"> {
  /**
   * Component type for video.
   * @type {"vc-video"}
   */
  component: "vc-video";
  /**
   * Video size.
   * @type {"auto" | "xs" | "s" | "m" | "l" | "xl" | "xxl"}
   */
  size?: ComponentProps<typeof VcVideo>["size"];
}

/**
 * Data field schema interface.
 * @interface
 */
export interface FieldSchema extends Pick<SchemaBase, "id" | "property" | "label" | "visibility" | "tooltip"> {
  /**
   * Component type for field.
   * @type {"vc-field"}
   */
  component: "vc-field";
  /**
   * Field variant.
   * @type {"text" | "normal" | "date" | "date-ago" | "link"}
   */
  variant?: ComponentProps<typeof VcField>["type"];
  /**
   * Whether the field is copyable or not.
   * @type {boolean}
   */
  copyable?: boolean;
}

/**
 * Image schema interface.
 * @interface
 */
export interface ImageSchema extends Pick<SchemaBase, "id" | "property" | "visibility" | "update"> {
  /**
   * Component type for image.
   * @type {"vc-image"}
   */
  component: "vc-image";
  /**
   * Image aspect ratio.
   * @type {"1x1" | "16x9" | "4x3" | "3x2"}
   */
  aspect?: ComponentProps<typeof VcImage>["aspect"];
  /**
   * Image size.
   * @type {"auto" | "xs" | "s" | "m" | "l" | "xl" | "xxl"}
   */
  size?: ComponentProps<typeof VcImage>["size"];
  /**
   * Size of the element's background image. Accepts auto, cover, contain CSS background-size value.
   * @type {"auto" | "contain" | "cover"}
   */
  background?: ComponentProps<typeof VcImage>["background"];
  /**
   * Whether the image is rounded or not.
   * @type {boolean}
   */
  rounded?: boolean;
  /**
   * Whether the image is bordered or not.
   * @type {boolean}
   */
  bordered?: boolean;
  /**
   * Whether the image has preview on click or not.
   * @type {boolean}
   */
  clickable?: boolean;
}

/**
 * Status schema interface.
 * @interface
 */
export interface StatusSchema extends Pick<SchemaBase, "id" | "visibility"> {
  /**
   * Component type for status.
   * @type {"vc-status"}
   */
  component: "vc-status";
  /**
   * Whether the status is outlined or not.
   * @type {boolean}
   */
  outline?: boolean;
  /**
   * Whether the status is extendable or not.
   * @type {boolean}
   */
  extend?: boolean;
  /**
   * Status variant.
   * @type {"info" | "warning" | "danger" | "success" | "light-danger"}
   */
  variant?: ComponentProps<typeof VcStatus>["variant"];
  /**
   * Status icon.
   * @type {string}
   */
  icon?: string;
  /**
   * Status icon size.
   * @type {"xs" | "s" | "m" | "l" | "xl" | "xxl" | "xxxl"}
   */
  iconSize?: ComponentProps<typeof VcIcon>["size"];
  /**
   * Status icon variant.
   * @type {"warning" | "danger" | "success"}
   */
  iconVariant?: ComponentProps<typeof VcIcon>["variant"];
  /**
   * Status title.
   * @type {string}
   */
  title?: string;
  /**
   * Method to call to get status content.
   * @description Method should be defined in the blade `scope`.
   * @type {{ method: string }}
   */
  content: {
    method: string;
  };
}

/**
 * Input-currency schema interface.
 * @interface
 */
export interface InputCurrencySchema extends Omit<SchemaBase, "multilanguage"> {
  /**
   * Component type for input-currency.
   * @type {"vc-input-currency"}
   */
  component: "vc-input-currency";
  /**
   * Property that holds available currency options.
   * @type {string}
   */
  optionProperty: string;
  /**
   * Property of optionProperty which holds the `value`
   * @default id
   * @type {string}
   */
  optionValue?: string;
  /**
   * Property of optionProperty which holds the `label`
   * @default title
   * @type {string}
   */
  optionLabel?: string;
  /**
   * Whether the input-currency is clearable or not.
   * @type {boolean}
   */
  clearable?: boolean;
}

/**
 * Editor schema interface.
 * @interface
 */
export interface EditorSchema extends SchemaBase {
  /**
   * Component type for editor.
   * @type {"vc-editor"}
   */
  component: "vc-editor";
}

/**
 * Interface for dynamic properties schema.
 * @interface
 */
export interface DynamicPropertiesSchema extends Pick<SchemaBase, "id" | "disabled" | "property" | "visibility"> {
  /**
   * The component type for dynamic properties.
   * @type {"vc-dynamic-properties"}
   */
  component: "vc-dynamic-properties";
  /**
   * An array of property names to exclude from the dynamic properties schema.
   * @type {string[]}
   */
  exclude?: string[];
  /**
   * An array of property names to include in the dynamic properties schema.
   * @type {string[]}
   */
  include?: string[];
}

/**
 * Gallery schema interface.
 * @interface
 */
export interface GallerySchema extends Omit<SchemaBase, "placeholder" | "multilanguage"> {
  /**
   * Component type for the gallery.
   * @type {"vc-gallery"}
   */
  component: "vc-gallery";
  /**
   * Gallery type
   * @type {"gallery" | "file-upload"}
   */
  variant?: ComponentProps<typeof VcGallery>["variant"];
  /**
   * Whether the gallery has multiple files upload or not.
   * @type {boolean}
   */
  multiple?: boolean;
  /**
   * Gallery item button actions on hover.
   * @type {{
      preview: boolean;
      edit: boolean;
      remove: boolean;
    }}
   */
  actions?: ComponentProps<typeof VcGallery>["itemActions"];
  /**
   * Whether the upload is hides after upload or not.
   * @type {boolean}
   */
  hideAfterUpload?: boolean;
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

export interface CheckboxSchema extends Omit<SchemaBase, "multilanguage" | "placeholder"> {
  component: "vc-checkbox";
  content: string;
  trueValue?: boolean;
  falseValue?: boolean;
}

/**
 * Fieldset schema interface.
 * @interface
 */
export interface FieldsetSchema extends PartialBy<Pick<SchemaBase, "id" | "property" | "visibility">, "property"> {
  /**
   * Component type for the fieldset.
   * @type {"vc-fieldset"}
   */
  component: "vc-fieldset";
  /**
   * Number of columns to display the fields in.
   * @type {number}
   */
  columns?: number;
  /**
   * Array of numbers that define the aspect ratio of each column.
   * @example Set to [1, 1] to make all columns equal width.
   * @description Uses CSS flex-grow property.
   * @type {number[]}
   */
  aspectRatio?: number[];
  /**
   * Array of control schemas to be displayed in the fieldset.
   * @type {ControlSchema[]}
   */
  fields: ControlSchema[];
  /**
   * Method to call to remove field from the fieldset. When set - activates remove button.
   *
   * Used for property-based fieldsets.
   *
   * Allows to remove selected fieldset.
   * @description Method should be defined in the blade `scope`.
   * @type {{ method: string }}
   */
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
  method: string;
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
  | ImageSchema
  | TextareaSchema;

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
