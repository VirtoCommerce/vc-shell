import {
  VcButton,
  VcCard,
  VcField,
  VcGallery,
  VcIcon,
  VcImage,
  VcInput,
  VcMultivalue,
  VcRating,
  VcStatus,
  VcVideo,
} from "./../../../../ui/components";
import { ITableColumns, IValidationRules, MenuItemConfig } from "../../../../core/types";
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
  /**
   * Blade default header title
   */
  titleTemplate: string;
}

export interface SettingsDetails extends SettingsBase {
  component: "DynamicBladeForm";
  status?: {
    component: string;
  };
}

export type IViewComponentName = "DynamicBladeForm" | "DynamicBladeList";

export type ToolbarSchema = {
  id: string;
  title?: string;
  icon?: string;
  method: string;
  /**
   * Permissions for the toolbar button. If the user does not have the required permissions, the toolbar button will not be displayed.
   * @type {string | string[]}
   */
  permissions?: string | string[];
};

export interface SettingsBase {
  /**
   * Blade url
   */
  url?: string;
  /**
   * Determines whether you can navigate to the blade directly
   * without parameters or options.
   *
   * @example Blade is not workspace and use context (passed `options` or `params` in openBlade method) to load data - then set `routable` to `false`
   *
   * @default true
   */
  routable?: boolean;
  /**
   * Locale key for VueI18n locale files
   */
  localizationPrefix: string;
  /**
   * Required component id
   */
  id: string;
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
   *
   * If not set - toolbar data will try to consume from composable, if not found - toolbar will not be added
   */
  toolbar?: ToolbarSchema[];
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
  /**
   * Blade menu item
   * @description If not set - blade will not be added to the menu
   *
   * @example
   * {
   *  title: "Products",
   *  icon: "fas fa-box-open",
   *  group: "Products",
   * }
   * @type {{title: string, icon: string, path: string/string}}
   * @default undefined
   */
  menuItem?: MenuItemConfig;
  /**
   * Collapsed blade width in percentage
   * @default "50%"
   */
  width?: `${number}%`;
}

export interface ListContentSchema {
  id: string;
  component: "vc-table";
  filter?: FilterSchema;
  multiselect?: boolean;
  header?: boolean;
  footer?: boolean;
  columns?: (Omit<ITableColumns, "visible"> & {
    id: string;
    title: string;
    sortable?: boolean;
    alwaysVisible?: boolean;
    type?: string;
    customTemplate?: GridTemplateOverride;
    /** Additional method that is called when the focus is lost from the cell when editing.
     * @description Method should be defined in the blade `scope`.
     * @argument ({ row: number, field: string })
     * @type {{ method: string }}
     */
    onCellBlur?: {
      method: string;
    };
    visible?:
      | boolean
      | {
          method: string;
        };
  })[];
  reorderableRows?: boolean;
  // TODO Add to documentation
  selectAll?: boolean;
  // TODO Add to documentation
  actions?: (Partial<TableSchema> &
    Required<Pick<ToolbarSchema, "title" | "icon">> & {
      position: "right" | "left";
      type: "danger" | "success";
      disabled?: {
        method: string;
      };
      method: string;
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
  footerTemplate?: {
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
   * Data can be defined in either the `item` or the `scope`.
   * Dot notation can also be used for nested properties, e.g. `address.city` or `addresses[1].city`.
   * You can also use a `function` or `writable computed` to set the property in the `scope`, which receives the modified data as an argument.
   * @type {string}
   */
  property: string;
  /** Vee-validate and custom validation rules for the schema.
   *
   * Available rules - {@link IValidationRules}
   * @type {IValidationRules}
   */
  rules?: IValidationRules;
  /** Placeholder text for the component.
   * @type {string}
   */
  placeholder?: string;
  /** Disabled state for component.
   * @description Method should be defined in the blade `scope`.
   * Method should return boolean value.
   * @type {{ method: string }}
   */
  disabled?: { method: string };
  /** Tooltip text for the component.
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
  /**
   * Method that is called when component emits `blur` event.
   * @description Method should be defined in the blade `scope`.
   * @type {{ method: string }}
   */
  onBlur?: {
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
  /**
   * Adds horizontal separator after component.
   */
  horizontalSeparator?: boolean;
  /**
   * Permissions for the component. If the user does not have the required permissions, the component will not be displayed.
   * @type {string | string[]}
   */
  permissions?: string | string[];
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
   * Property which holds the `value`
   * @default id
   * @type {string}
   */
  optionValue: string;
  /**
   * Property which holds the `label`
   * @default title
   * @type {string}
   */
  optionLabel: string;
  /** Method that is used to get select options.
   *  @description Method should be defined in the blade \`scope\` and could be:
   *  1) async method with the following arguments: (\`keyword: string\`, \`skip\`, \`ids?: string[]\`).
   *  2) any array
   *  3) composable returning array
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
   * @type {boolean}
   * @default true
   */
  mapOptions?: boolean;
  /**
   * Whether the select is searchable or not.
   * @type {boolean}
   */
  searchable?: boolean;
  /**
   * Select multiple values.
   * @type {boolean}
   */
  multiple?: boolean;
  /**
   * Text below control.
   */
  hint?: string;
}

export interface MultivalueSchema extends SchemaBase {
  /**
   * Component type for multivalue.
   * @type {"vc-multivalue"}
   */
  component: "vc-multivalue";
  /**
   * Property which holds the `value`
   * @default id
   * @type {string}
   */
  optionValue: string;
  /**
   * Property which holds the `label`
   * @default title
   * @type {string}
   */
  optionLabel: string;
  /**
   * Array with multivalue dictionary.
   * @description Array should be defined in the blade `scope`.
   * @type {string}
   */
  options?: string;
  /**
   * Whether the select is multivalue or not.
   * @type {boolean}
   */
  multivalue?: boolean;
  /**
   * Multivalue type
   * @default `text`
   */
  variant?: ComponentProps<typeof VcMultivalue>["type"];
  /**
   * Name of custom template to display dictionary data in multivalue.
   * Component should be registered globally.
   * @type {{component: string}}
   */
  customTemplate?: {
    component: string;
  };
  /**
   * Text below control.
   */
  hint?: string;
}

export interface TextareaSchema extends Omit<SchemaBase, "onBlur"> {
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
  /**
   * Maximum number of characters that can be entered.
   * @type {number}
   */
  maxlength?: number;
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
  /**
   * Maximum number of characters that can be entered.
   * @type {number}
   */
  maxlength?: number;
  /**
   * Text below control.
   */
  hint?: string;
}

/**
 *  Video schema interface.
 * @interface
 */
export interface VideoSchema
  extends Pick<SchemaBase, "id" | "property" | "label" | "visibility" | "tooltip" | "permissions"> {
  /**
   * Component type for video.
   * @type {"vc-video"}
   */
  component: "vc-video";
}

/**
 * Data field schema interface.
 * @interface
 */
export interface FieldSchema
  extends Pick<
    SchemaBase,
    "id" | "property" | "label" | "visibility" | "tooltip" | "horizontalSeparator" | "permissions"
  > {
  /**
   * Component type for field.
   * @type {"vc-field"}
   */
  component: "vc-field";
  /**
   * Field variant.
   * @type {"date-ago" | "date" | "link" | "text" | "email"}
   */
  variant?: ComponentProps<typeof VcField>["type"];
  /**
   * Whether the field is copyable or not.
   * @type {boolean}
   */
  copyable?: boolean;
  /**
   * Field orientation.
   * @type {"horizontal" | "vertical"}
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Field columns aspect ratio.
   * @description Uses CSS flex-grow property.
   * @default [1,1]
   * @type {[number, number]}
   */
  aspectRatio?: [number, number];
}

/**
 * Image schema interface.
 * @interface
 */
export interface ImageSchema extends Pick<SchemaBase, "id" | "property" | "visibility" | "permissions"> {
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
}

/**
 * Status schema interface.
 * @interface
 */
export interface StatusSchema extends Pick<SchemaBase, "id" | "visibility" | "horizontalSeparator" | "permissions"> {
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
   * @type {"info" | "info-dark" | "warning" | "danger" | "success" | "light-danger"}
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
   * Used to display the content of the status. It can be a `string\` or an `object with a method property`.
   * Method property could be a function, `computed property` or `ref`, returning a `string` value.
   * @description Method should be defined in the blade `scope`.
   * @type {{ method: string } | string}
   */
  content:
    | {
        method: string;
      }
    | string;
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
   * List of currency options to be displayed in the dropdown.
   * @description Array should be defined in the blade `scope`.
   */
  options: string;
  /**
   * Name of property that holds currency value.
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
  /**
   * Text below control.
   */
  hint?: string;
}

/**
 * Editor schema interface.
 * @interface
 */
export interface EditorSchema extends Omit<SchemaBase, "onBlur"> {
  /**
   * Component type for editor.
   * @type {"vc-editor"}
   */
  component: "vc-editor";
  /**
   * Assets folder for the editor image uploads.
   * @type {string}
   */
  assetsFolder: string;
  /**
   * Maximum length of the editor content.
   * @type {number}
   */
  maxlength?: number;
}

/**
 * Interface for dynamic properties schema.
 * @interface
 */
export interface DynamicPropertiesSchema
  extends Pick<SchemaBase, "id" | "disabled" | "property" | "visibility" | "horizontalSeparator" | "permissions"> {
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
export interface GallerySchema
  extends Omit<SchemaBase, "placeholder" | "multilanguage" | "update" | "horizontalSeparator" | "onBlur"> {
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
export interface CardSchema
  extends RequiredBy<Pick<SchemaBase, "id" | "label" | "visibility" | "permissions">, "label"> {
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
   * @type {ButtonSchema}
   */
  action?: ButtonSchema;
  /**
   * Whether the card is collapsible or not.
   * @type {boolean}
   */
  collapsible?: boolean;
  /**
   * Whether the card is collapsed or not.
   * @type {boolean}
   */
  collapsed?: boolean;
  /**
   * Removes internal padding from the card.
   * @type {boolean}
   * @default false
   */
  removePadding?: boolean;
  /**
   * Card variant.
   * @type {default | success | danger}
   */
  variant?: ComponentProps<typeof VcCard>["variant"];
}

export interface WidgetsSchema extends Pick<SchemaBase, "id" | "horizontalSeparator" | "permissions"> {
  component: "vc-widgets";
  children: string[];
}

export interface CheckboxSchema extends Omit<SchemaBase, "multilanguage" | "placeholder" | "onBlur"> {
  /**
   * Component type for checkbox.
   * @type {"vc-checkbox"}
   */
  component: "vc-checkbox";
  /**
   * Checkbox text content.
   */
  content: string;
  /**
   * Value when checkbox is checked.
   * @type {boolean}
   */
  trueValue?: boolean;
  /**
   * Value when checkbox is unchecked.
   * @type {boolean}
   */
  falseValue?: boolean;
}

export interface RadioButtonSchema extends Omit<SchemaBase, "multilanguage" | "placeholder" | "onBlur"> {
  /**
   * Component type for radio button.
   * @type {"vc-radio-button-group"}
   */
  component: "vc-radio-button-group";
  /**
   * Allows to select a boolean value.
   */
  binary?: boolean;
  /**
   * List of options to be displayed as radio-buttons.
   * @description Array of should be defined in the blade `scope`.
   */
  options: string;
  /**
   * Name of property that holds radio button value.
   * @type {string}
   */
  optionValue?: string;
  /**
   * Name of property that holds radio button label.
   * @type {string}
   */
  optionLabel?: string;
}

/**
 * Fieldset schema interface.
 * @interface
 */
export interface FieldsetSchema extends Pick<SchemaBase, "id" | "visibility" | "horizontalSeparator" | "permissions"> {
  /**
   * Component type for the fieldset.
   * @type {"vc-fieldset"}
   */
  component: "vc-fieldset";
  /** Property name to build `fieldset` from `array of objects`.
   * Data can be defined in either the `item` or the `scope`.
   * Dot notation can also be used for nested properties, e.g. `address.city` or `addresses[1].city`
   * @type {string}
   */
  property?: string;
  /**
   * Number of columns to display the fields in.
   * @type {number}
   */
  columns?: number;
  /**
   * Array of numbers that define the aspect ratio of each column.
   * @example If you have two columns - set to [1, 1] to make all columns equal width.
   * @description Uses CSS flex-grow property to set the width of each column.
   * @type {number[]}
   */
  aspectRatio?: number[];
  /**
   * Array of control schemas for the fields in the fieldset.
   * @type {ControlSchema[]}
   */
  fields: ControlSchema[];
}

/**
 * Switch schema interface.
 * @interface
 */
export interface SwitchSchema extends Omit<SchemaBase, "placeholder" | "multilanguage" | "onBlur"> {
  /**
   * Component type for switch.
   * @type {"vc-switch"}
   */
  component: "vc-switch";
  /**
   * Value when switch is on.
   * @type {boolean}
   */
  trueValue?: boolean;
  /**
   * Value when switch is off.
   * @type {boolean}
   */
  falseValue?: boolean;
}

export type TableSchema = Omit<ListContentSchema, "filter"> &
  Pick<SchemaBase, "id" | "property" | "visibility" | "permissions"> & {
    /**
     * Configuration for the add new row button in the table.
     * Used when table is in editing mode.
     */
    addNewRowButton?: {
      /**
       * The title of the button.
       */
      title: string;
      /**
       * Determines whether the button should be shown or hidden.
       */
      show: boolean;
      /**
       * Method to be called when the button is clicked.
       * @description Method should be defined in the blade `scope`.
       * @type {string}
       */
      method: string;
    };
  };

/**
 * Button schema interface.
 * @interface
 */
export interface ButtonSchema extends Pick<SchemaBase, "id" | "disabled" | "visibility" | "permissions"> {
  /**
   * Component type.
   * @type {"vc-button"}
   */
  component: "vc-button";
  /**
   * Button inner text.
   * @type {string}
   */
  content?: string;
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
  /**
   * Button variant.
   * @type {primary | warning | danger}
   */
  variant?: ComponentProps<typeof VcButton>["variant"];
  /**
   * Raised button.
   * @type {boolean}
   */
  raised?: boolean;
  /**
   * Outlined button.
   * @type {boolean}
   */
  outline?: boolean;
}

/**
 * Custom component schema interface.
 * @interface
 */
export interface CustomComponentSchema extends Pick<SchemaBase, "id" | "visibility" | "permissions"> {
  /**
   * Component type for custom component.
   * @type {vc-custom}
   */
  component: "vc-custom";
  /**
   * Component name of custom component. Component should be registered globally.
   */
  name: string;
}

/**
 * Rating schema interface.
 * @interface
 */
export interface RatingSchema
  extends Pick<
    SchemaBase,
    "id" | "visibility" | "label" | "property" | "tooltip" | "horizontalSeparator" | "placeholder" | "permissions"
  > {
  /**
   * Component type for rating.
   * @type {"vc-rating"}
   */
  component: "vc-rating";
  /**
   * Maximal rating size.
   * @type {number}
   */
  max?: number;
  /**
   * Rating component display variant.
   * @type {"text" | "stars" | "star-and-text"}
   */
  type?: ComponentProps<typeof VcRating>["variant"];
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
  | TextareaSchema
  | MultivalueSchema
  | SwitchSchema
  | TableSchema
  | CustomComponentSchema
  | RatingSchema
  | RadioButtonSchema;

export interface FilterBase {
  columns: {
    /**
     * @deprecated use 'label' in 'controls' instead
     */
    title?: string;
    id: string;
    controls: (FilterCheckbox | FilterDateInput | FilterSwitch | FilterSelect | FilterRadio)[];
  }[];
}

export type FilterCheckbox = {
  id: string;
  field: string;
  multiple?: boolean;
  label?: string;
  tooltip?: string;
  data: string;
  optionValue: string;
  optionLabel: string;
  component: CheckboxSchema["component"];
};

export type FilterDateInput = {
  id: string;
  field: string;
  label?: string;
  tooltip?: string;
  component: InputSchema["component"];
};

export type FilterSwitch = {
  id: string;
  field: string;
  data: string;
  label?: string;
  tooltip?: string;
  multiple?: boolean;
  optionValue: string;
  optionLabel: string;
  component: SwitchSchema["component"];
};

export type FilterSelect = {
  id: string;
  field: string;
  label?: string;
  tooltip?: string;
  data: string;
  multiple?: boolean;
  component: SelectSchema["component"];
  optionValue: string;
  optionLabel: string;
};

export type FilterRadio = {
  id: string;
  field: string;
  label?: string;
  tooltip?: string;
  data: string;
  optionValue: string;
  optionLabel: string;
  component: RadioButtonSchema["component"];
};

export type FilterSchema = FilterBase;

export interface OverridesSchema {
  upsert?: (OverridesUpsert | OverridesReplace)[];
  remove?: OverridesRemove[];
}

export interface OverridesUpsert extends OverridesReplace {
  index: number;
}

export interface OverridesReplace {
  path: string;
  value: ControlSchema | ToolbarSchema | SettingsSchema["menuItem"] | string | boolean;
  id: string;
}

export interface OverridesRemove {
  path: string;
  id: string;
}
