import prompts from "prompts";
import { upperFirst, snakeCase } from "lodash-es";

/**
 * Escapes quotes in strings to prevent template injection
 */
function escapeQuotes(str: string): string {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

/**
 * Form field type enum
 */
export enum FieldType {
  Text = "text",
  Textarea = "textarea",
  Number = "number",
  Date = "date",
  Select = "select",
  Checkbox = "checkbox",
  RadioButton = "radio",
  Switch = "switch",
  Currency = "currency",
  Editor = "editor",
  Image = "image",
  Multivalue = "multivalue",
  Gallery = "gallery",
  DataField = "data-field",
}

/**
 * Form field configuration
 */
export interface FormField {
  name: string;
  type: FieldType;
  label?: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
}

/**
 * Prompts user to add custom form fields interactively
 *
 * @returns Array of form field configurations
 */
export async function promptFormFields(): Promise<FormField[]> {
  const fields: FormField[] = [];
  let addMore = true;

  console.log("\n📝 Configure form fields (press Ctrl+C to skip):\n");

  while (addMore) {
    try {
      const fieldConfig = await prompts(
        [
          {
            type: "text",
            name: "name",
            message: "Field name (e.g., price, description):",
            validate: (value) => {
              if (!value) return "Field name is required";
              if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
                return "Field name must be a valid identifier (letters, numbers, underscore)";
              }
              return true;
            },
          },
          {
            type: "select",
            name: "type",
            message: "Field type:",
            choices: [
              { title: "Text Input", value: FieldType.Text },
              { title: "Textarea", value: FieldType.Textarea },
              { title: "Number", value: FieldType.Number },
              { title: "Date", value: FieldType.Date },
              { title: "Select Dropdown", value: FieldType.Select },
              { title: "Checkbox", value: FieldType.Checkbox },
              { title: "Radio Button", value: FieldType.RadioButton },
              { title: "Switch", value: FieldType.Switch },
              { title: "Currency Input", value: FieldType.Currency },
              { title: "Rich Text Editor", value: FieldType.Editor },
              { title: "Image Upload", value: FieldType.Image },
              { title: "Multivalue Input", value: FieldType.Multivalue },
              { title: "Gallery", value: FieldType.Gallery },
              { title: "Data Field", value: FieldType.DataField },
            ],
          },
          {
            type: (prev) => (prev === FieldType.Select || prev === FieldType.RadioButton ? "list" : null),
            name: "options",
            message: "Options (comma-separated):",
            separator: ",",
          },
          {
            type: "text",
            name: "label",
            message: "Field label (optional, press Enter to skip):",
            initial: "",
          },
          {
            type: "confirm",
            name: "required",
            message: "Is this field required?",
            initial: false,
          },
          {
            type: "confirm",
            name: "addAnother",
            message: "Add another field?",
            initial: true,
          },
        ],
        {
          onCancel: () => {
            addMore = false;
            throw new Error("cancelled");
          },
        }
      );

      if (!fieldConfig.name) {
        addMore = false;
        break;
      }

      fields.push({
        name: fieldConfig.name,
        type: fieldConfig.type,
        label: fieldConfig.label || upperFirst(fieldConfig.name),
        required: fieldConfig.required,
        options: fieldConfig.options,
      });

      addMore = fieldConfig.addAnother;
    } catch (error: any) {
      if (error.message === "cancelled") {
        break;
      }
      throw error;
    }
  }

  return fields;
}

/**
 * Generates template for VcInput (text/number/date)
 */
function generateVcInputTemplate(formField: FormField, moduleNameUpperSnake: string): string {
  const labelKey = snakeCase(formField.name).toUpperCase();
  const validation = formField.required ? 'rules="required"' : "";

  let typeAttr = "";
  if (formField.type === FieldType.Number) {
    typeAttr = 'type="number"';
  } else if (formField.type === FieldType.Date) {
    typeAttr = 'type="date"';
  }

  return `              <Field
                v-slot="{ field, errorMessage, handleChange, errors }"
                :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                :model-value="item.${formField.name}"
                name="${formField.name}"
                ${validation}
              >
                <VcInput
                  v-bind="field"
                  v-model="item.${formField.name}"
                  :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                  :placeholder="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}_PLACEHOLDER')"
                  ${typeAttr}
                  ${formField.required ? "required" : ""}
                  clearable
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  @update:model-value="handleChange"
                />
              </Field>`;
}

/**
 * Generates template for VcTextarea
 */
function generateVcTextareaTemplate(formField: FormField, moduleNameUpperSnake: string): string {
  const labelKey = snakeCase(formField.name).toUpperCase();

  return `              <VcTextarea
                v-model="item.${formField.name}"
                :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                :placeholder="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}_PLACEHOLDER')"
                ${formField.required ? "required" : ""}
                clearable
              />`;
}

/**
 * Generates template for VcSelect with searchable options
 */
function generateVcSelectTemplate(formField: FormField, moduleNameUpperSnake: string): string {
  const labelKey = snakeCase(formField.name).toUpperCase();
  const validation = formField.required ? 'rules="required"' : "";

  const optionsStr = formField.options?.map(opt => {
    const escaped = escapeQuotes(opt);
    return `{ value: '${escaped}', label: '${escaped}' }`;
  }).join(", ") || "";

  return `              <Field
                v-slot="{ errorMessage, handleChange, errors }"
                :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                :model-value="item.${formField.name}"
                name="${formField.name}"
                ${validation}
              >
                <VcSelect
                  v-model="item.${formField.name}"
                  :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                  :placeholder="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}_PLACEHOLDER')"
                  :options="[${optionsStr}]"
                  option-value="value"
                  option-label="label"
                  searchable
                  ${formField.required ? "required" : ""}
                  :clearable="false"
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  @update:model-value="handleChange"
                />
              </Field>`;
}

/**
 * Generates template for VcEditor with multilanguage support
 */
function generateVcEditorTemplate(formField: FormField, moduleNameUpperSnake: string): string {
  const labelKey = snakeCase(formField.name).toUpperCase();
  const validation = formField.required ? 'rules="required"' : "";

  return `              <Field
                v-slot="{ errorMessage, handleChange, errors }"
                :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                :model-value="item.${formField.name}"
                name="${formField.name}"
                ${validation}
              >
                <VcEditor
                  v-model="item.${formField.name}"
                  :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                  :placeholder="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}_PLACEHOLDER')"
                  ${formField.required ? "required" : ""}
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  @update:model-value="handleChange"
                />
              </Field>`;
}

/**
 * Generates template for VcSwitch (without Field wrapper)
 */
function generateVcSwitchTemplate(formField: FormField, moduleNameUpperSnake: string): string {
  const labelKey = snakeCase(formField.name).toUpperCase();

  return `              <VcSwitch
                v-model="item.${formField.name}"
                :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                :tooltip="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}_TOOLTIP')"
                :true-value="true"
                :false-value="false"
              />`;
}

/**
 * Generates template for VcGallery (without Field wrapper)
 * Note: This also requires additional setup in the composable - see generated comments
 */
function generateVcGalleryTemplate(formField: FormField, moduleNameUpperSnake: string): string {
  const labelKey = snakeCase(formField.name).toUpperCase();

  return `              <VcCard :header="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')">
                <VcGallery
                  :images="item.${formField.name}"
                  multiple
                  @upload="assetsHandler.upload"
                  @sort="assetsHandler.edit"
                  @remove="assetsHandler.remove"
                  @edit="onGalleryItemEdit"
                />
              </VcCard>`;
}

/**
 * Generates script setup additions for VcGallery
 * Returns additional code to be inserted into <script setup>
 */
export function generateVcGalleryScriptAdditions(entityName: string): string {
  return `
// VcGallery Assets Handler Setup
// TODO: Import Image type from your API client (e.g., import { Image, IImage } from "@your-app/api/client")
const { upload, remove, edit, loading: assetsLoading } = useAssets();

/**
 * Handles asset operations for VcGallery
 * TODO: Update the path '${entityName}s/\${item.value?.id}' to match your entity structure
 */
const assetsHandler = {
  loading: assetsLoading,
  async upload(files: FileList, startingSortOrder?: number) {
    // TODO: Update path to match your entity (e.g., 'products/\${item.value?.id}')
    const uploaded = await upload(files, \`${entityName}s/\${item.value?.id}\`, startingSortOrder);
    // TODO: If using typed Image class, map: uploaded.map((x) => new Image(x))
    item.value.images = [...(item.value?.images ?? []), ...uploaded];
  },
  async remove(file: ICommonAsset) {
    if (await showConfirmation(t("COMMON.ALERTS.IMAGE_DELETE_CONFIRMATION"))) {
      const remainingImages = remove([file], item.value?.images ?? []);
      // TODO: If using typed Image class, map: remainingImages.map((x) => new Image(x))
      item.value.images = remainingImages;
    }
  },
  edit(files: ICommonAsset[]) {
    const edited = edit(files, item.value?.images ?? []);
    // TODO: If using typed Image class, map: edited.map((x) => new Image(x))
    item.value.images = edited;
  },
};

/**
 * Opens asset details blade for editing
 * TODO: Create AssetsDetails blade or remove this handler
 */
const onGalleryItemEdit = (asset: ICommonAsset) => {
  // openBlade({
  //   blade: { name: "AssetsDetails" },
  //   options: {
  //     asset: asset,
  //     assetEditHandler: (file: ICommonAsset) => assetsHandler.edit?.([file]),
  //     assetRemoveHandler: (file: ICommonAsset) => assetsHandler.remove?.(file),
  //   },
  // });
  console.log("Gallery item clicked:", asset);
};
`;
}

/**
 * Generates template for VcField (read-only display)
 */
function generateVcFieldTemplate(formField: FormField, moduleNameUpperSnake: string): string {
  const labelKey = snakeCase(formField.name).toUpperCase();

  return `              <VcField
                :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                :model-value="item.${formField.name}"
                orientation="horizontal"
                :aspect-ratio="[1, 2]"
                type="text"
              />`;
}

/**
 * Generates template for VcInputCurrency
 */
function generateVcInputCurrencyTemplate(formField: FormField, moduleNameUpperSnake: string): string {
  const labelKey = snakeCase(formField.name).toUpperCase();
  const validation = formField.required ? 'rules="required"' : "";

  return `              <Field
                v-slot="{ field, errorMessage, handleChange, errors }"
                :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                :model-value="item.${formField.name}"
                name="${formField.name}"
                ${validation}
              >
                <VcInputCurrency
                  v-bind="field"
                  v-model="item.${formField.name}"
                  :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                  ${formField.required ? "required" : ""}
                  clearable
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  @update:model-value="handleChange"
                />
              </Field>`;
}

/**
 * Generates template for VcRadioButton
 */
function generateVcRadioButtonTemplate(formField: FormField, moduleNameUpperSnake: string): string {
  const labelKey = snakeCase(formField.name).toUpperCase();
  const validation = formField.required ? 'rules="required"' : "";

  const radioButtons = formField.options
    ?.map((opt) => {
      const escaped = escapeQuotes(opt);
      return `                <VcRadioButton
                  :model-value="item.${formField.name}"
                  value="${escaped}"
                  :label="'${escaped}'"
                  @update:model-value="handleChange"
                />`;
    })
    .join("\n") || "";

  return `              <Field
                v-slot="{ field, errorMessage, handleChange, errors }"
                :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                :model-value="item.${formField.name}"
                name="${formField.name}"
                ${validation}
              >
                <div class="tw-space-y-2">
${radioButtons}
                </div>
                <div v-if="errors.length" class="tw-text-red-500 tw-text-sm">{{ errorMessage }}</div>
              </Field>`;
}

/**
 * Generates template for VcCheckbox
 */
function generateVcCheckboxTemplate(formField: FormField, moduleNameUpperSnake: string): string {
  const labelKey = snakeCase(formField.name).toUpperCase();

  return `              <VcCheckbox
                v-model="item.${formField.name}"
                :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
              />`;
}

/**
 * Generates template for VcMultivalue
 */
function generateVcMultivalueTemplate(formField: FormField, moduleNameUpperSnake: string): string {
  const labelKey = snakeCase(formField.name).toUpperCase();
  const validation = formField.required ? 'rules="required"' : "";

  return `              <!-- TODO: Configure VcMultivalue dictionary and placeholder -->
              <Field
                v-slot="{ errorMessage, handleChange, errors }"
                :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                :model-value="item.${formField.name}"
                name="${formField.name}"
                ${validation}
              >
                <VcMultivalue
                  v-model="item.${formField.name}"
                  :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}')"
                  :placeholder="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.${labelKey}_PLACEHOLDER')"
                  ${formField.required ? "required" : ""}
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  @update:model-value="handleChange"
                />
              </Field>`;
}

/**
 * Checks if form fields contain VcGallery
 */
export function hasGalleryField(fields: FormField[]): boolean {
  return fields.some(field => field.type === FieldType.Gallery);
}

/**
 * Generates Vue template code for form fields
 *
 * @param fields - Array of form field configurations
 * @param moduleNameUpperSnake - Module name in UPPER_SNAKE_CASE for i18n keys
 * @returns Vue template string
 */
export function generateFormFieldsTemplate(fields: FormField[], moduleNameUpperSnake: string): string {
  if (fields.length === 0) {
    return generateDefaultFormFields(moduleNameUpperSnake);
  }

  return fields
    .map((formField) => {
      // Route to specific generator based on field type
      switch (formField.type) {
        case FieldType.Text:
        case FieldType.Number:
        case FieldType.Date:
          return generateVcInputTemplate(formField, moduleNameUpperSnake);
        case FieldType.Textarea:
          return generateVcTextareaTemplate(formField, moduleNameUpperSnake);
        case FieldType.Select:
          return generateVcSelectTemplate(formField, moduleNameUpperSnake);
        case FieldType.Editor:
          return generateVcEditorTemplate(formField, moduleNameUpperSnake);
        case FieldType.Switch:
          return generateVcSwitchTemplate(formField, moduleNameUpperSnake);
        case FieldType.Gallery:
          return generateVcGalleryTemplate(formField, moduleNameUpperSnake);
        case FieldType.DataField:
          return generateVcFieldTemplate(formField, moduleNameUpperSnake);
        case FieldType.Currency:
          return generateVcInputCurrencyTemplate(formField, moduleNameUpperSnake);
        case FieldType.RadioButton:
          return generateVcRadioButtonTemplate(formField, moduleNameUpperSnake);
        case FieldType.Checkbox:
          return generateVcCheckboxTemplate(formField, moduleNameUpperSnake);
        case FieldType.Multivalue:
          return generateVcMultivalueTemplate(formField, moduleNameUpperSnake);
        case FieldType.Image:
          // VcImage is similar to VcInput for now
          return generateVcInputTemplate({ ...formField, type: FieldType.Text }, moduleNameUpperSnake);
        default:
          return generateVcInputTemplate(formField, moduleNameUpperSnake);
      }
    })
    .join("\n\n");
}

/**
 * Generates locale entries for form fields
 *
 * @param fields - Array of form field configurations
 * @returns Object with locale entries
 */
export function generateFormFieldsLocale(fields: FormField[]): Record<string, string> {
  const locale: Record<string, string> = {};

  for (const formField of fields) {
    const key = snakeCase(formField.name).toUpperCase();
    locale[key] = formField.label || upperFirst(formField.name);
  }

  return locale;
}

/**
 * Generates default form fields (name + createdDate)
 * Used when user doesn't customize the form
 *
 * @param moduleNameUpperSnake - Module name in UPPER_SNAKE_CASE for i18n keys
 * @returns Vue template string with default fields
 */
export function generateDefaultFormFields(moduleNameUpperSnake: string): string {
  return `              <Field
                v-slot="{ field, errorMessage, handleChange, errors }"
                :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.NAME')"
                :model-value="item.name"
                name="name"
                rules="required"
              >
                <VcInput
                  v-bind="field"
                  v-model="item.name"
                  :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.NAME')"
                  :placeholder="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.NAME_PLACEHOLDER')"
                  required
                  clearable
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  @update:model-value="handleChange"
                />
              </Field>

              <VcField
                :label="$t('${moduleNameUpperSnake}.PAGES.DETAILS.FORM.INFO.CREATED_DATE')"
                :model-value="createdDate"
                orientation="horizontal"
                :aspect-ratio="[1, 2]"
                type="text"
              />`;
}

