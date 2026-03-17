import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";

import VcDynamicProperty from "./vc-dynamic-property.vue";

/**
 * `VcDynamicProperty` renders a VirtoCommerce platform dynamic property based on its value type.
 *
 * It automatically selects the appropriate input component:
 * - **ShortText** - VcInput (single) or VcMultivalue (multi)
 * - **LongText** - VcTextarea
 * - **Number** / **Integer** - VcInput with type constraints, or VcMultivalue
 * - **DateTime** - VcInput with datetime-local type
 * - **Boolean** - VcSwitch
 * - **Measure** - VcInputDropdown with unit selector
 * - **Color** - VcInput color picker, VcMultivalue, or VcSelect (dictionary)
 *
 * Dictionary properties use VcSelect (single) or VcMultivalue (multi) with async option loading.
 * Multilanguage properties pass locale info to child components.
 * Validation is handled via vee-validate Field wrapper.
 */
const meta = {
  title: "Organisms/VcDynamicProperty",
  component: VcDynamicProperty,
  tags: ["autodocs"],
  argTypes: {
    property: {
      description: "The dynamic property object containing id, valueType, dictionary flag, and other metadata",
      control: "object",
      table: {
        type: { summary: "T extends { [x: string]: any; id?: string }" },
        category: "Data",
      },
    },
    modelValue: {
      description: "The current value of the property (v-model)",
      control: "text",
      table: {
        type: { summary: "any" },
        category: "Model",
      },
    },
    valueType: {
      description: "The value type determining which input component is rendered",
      control: "select",
      options: ["ShortText", "LongText", "Number", "Integer", "DateTime", "Boolean", "Measure", "Color"],
      table: {
        type: { summary: "string" },
        category: "Data",
      },
    },
    name: {
      description: "Property name used for form field identification and display",
      control: "text",
      table: {
        type: { summary: "string" },
        category: "Data",
      },
    },
    required: {
      description: "Whether the field is required for validation",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        category: "State",
      },
    },
    disabled: {
      description: "Disables the input control",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "State",
      },
    },
    multivalue: {
      description: "Whether the property supports multiple values",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Data",
      },
    },
    dictionary: {
      description: "Whether the property uses dictionary values loaded via optionsGetter",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Data",
      },
    },
    multilanguage: {
      description: "Whether the property supports multiple languages",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Data",
      },
    },
    currentLanguage: {
      description: "Current language code for multilanguage properties",
      control: "text",
      table: {
        type: { summary: "string" },
        category: "Data",
      },
    },
    optionsGetter: {
      description: "Async function to load dictionary options by property ID",
      control: false,
      table: {
        type: { summary: "(propertyId: string, keyword?: string, locale?: string) => Promise<any[]>" },
        category: "Data",
      },
    },
    measurementsGetter: {
      description: "Async function to load measurement units by measure ID",
      control: false,
      table: {
        type: { summary: "(measureId: string, locale?: string) => Promise<any[]>" },
        category: "Data",
      },
    },
    optionsValue: {
      description: "Field name for option value in dictionary items",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '"id"' },
        category: "Data",
      },
    },
    optionsLabel: {
      description: "Field name for option label in dictionary items",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '"value"' },
        category: "Data",
      },
    },
    displayNames: {
      description: "Localized display names for the property label",
      control: "object",
      table: {
        type: { summary: "{ name?: string; languageCode?: string }[]" },
        category: "Appearance",
      },
    },
    rules: {
      description: "Validation rules (min, max, regex)",
      control: "object",
      table: {
        type: { summary: "{ min?: number; max?: number; regex?: string }" },
        category: "State",
      },
    },
    placeholder: {
      description: "Placeholder text for the input",
      control: "text",
      table: {
        type: { summary: "string" },
        category: "Appearance",
      },
    },
    "onUpdate:modelValue": {
      description: "Emitted when the value changes. Payload includes value, dictionary, locale, and optional unitOfMeasureId/colorCode",
      table: { category: "Events" },
    },
  },
  args: {
    property: { id: "prop-1", name: "description" },
    name: "Description",
    valueType: "ShortText",
    required: false,
    disabled: false,
    modelValue: "",
    optionsGetter: async () => [],
  },
  parameters: {
    docs: {
      description: {
        component: `
Renders a VirtoCommerce dynamic property as the appropriate form control based on its value type.

Supported value types:
- **ShortText** — text input or multivalue tags
- **LongText** — textarea
- **Number** / **Integer** — numeric input or multivalue
- **DateTime** — date-time picker
- **Boolean** — toggle switch
- **Measure** — numeric input with unit dropdown
- **Color** — color picker, multivalue, or dictionary select

Features:
- Automatic component selection based on valueType + dictionary + multivalue flags
- vee-validate integration for required, min/max, regex rules
- Dictionary option loading via async \`optionsGetter\`
- Measurement units via async \`measurementsGetter\`
- Multilanguage support

## Usage

\`\`\`vue
<VcDynamicProperty
  :property="dynamicProperty"
  :model-value="propertyValue"
  :value-type="dynamicProperty.valueType"
  :name="dynamicProperty.name"
  :required="dynamicProperty.isRequired"
  :dictionary="dynamicProperty.isDictionary"
  :options-getter="loadDictionaryItems"
  @update:model-value="handleUpdate"
/>
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof VcDynamicProperty>;

export default meta;
type Story = StoryObj<typeof meta>;

const updateAction = (...args: unknown[]) => console.log("update:modelValue", ...args);

/**
 * ShortText property rendered as a simple text input.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcDynamicProperty },
    setup() {
      const value = ref(args.modelValue || "");
      const onUpdate = (data: any) => {
        value.value = data.value;
        updateAction(data);
      };
      return { args, value, onUpdate };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcDynamicProperty
          v-bind="args"
          :model-value="value"
          @update:model-value="onUpdate"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Default ShortText property rendered as a VcInput text field.",
      },
    },
  },
};

/**
 * LongText property rendered as a textarea.
 */
export const LongText: Story = {
  args: {
    property: { id: "prop-2", name: "notes" },
    name: "Notes",
    valueType: "LongText",
    modelValue: "This is a longer text value that can span multiple lines.",
  },
  render: (args) => ({
    components: { VcDynamicProperty },
    setup() {
      const value = ref(args.modelValue);
      const onUpdate = (data: any) => {
        value.value = data.value;
        updateAction(data);
      };
      return { args, value, onUpdate };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcDynamicProperty
          v-bind="args"
          :model-value="value"
          @update:model-value="onUpdate"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "LongText value type renders as a VcTextarea, suitable for multi-line content like descriptions or notes.",
      },
    },
  },
};

/**
 * Number property rendered as a numeric input.
 */
export const NumberType: Story = {
  args: {
    property: { id: "prop-3", name: "weight" },
    name: "Weight (kg)",
    valueType: "Number",
    modelValue: 12.5,
  },
  render: (args) => ({
    components: { VcDynamicProperty },
    setup() {
      const value = ref(args.modelValue);
      const onUpdate = (data: any) => {
        value.value = data.value;
        updateAction(data);
      };
      return { args, value, onUpdate };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcDynamicProperty
          v-bind="args"
          :model-value="value"
          @update:model-value="onUpdate"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Number value type renders as a VcInput with `type=\"number\"`, allowing decimal values.",
      },
    },
  },
};

/**
 * Integer property rendered as a numeric input with step=1.
 */
export const IntegerType: Story = {
  args: {
    property: { id: "prop-4", name: "quantity" },
    name: "Quantity",
    valueType: "Integer",
    modelValue: 42,
  },
  render: (args) => ({
    components: { VcDynamicProperty },
    setup() {
      const value = ref(args.modelValue);
      const onUpdate = (data: any) => {
        value.value = data.value;
        updateAction(data);
      };
      return { args, value, onUpdate };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcDynamicProperty
          v-bind="args"
          :model-value="value"
          @update:model-value="onUpdate"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Integer value type renders as a VcInput with `type=\"integer\"` and `step=\"1\"`, restricting to whole numbers.",
      },
    },
  },
};

/**
 * DateTime property rendered as a datetime-local input.
 */
export const DateTimeType: Story = {
  args: {
    property: { id: "prop-5", name: "publishDate" },
    name: "Publish Date",
    valueType: "DateTime",
    modelValue: "2026-03-17T10:30",
  },
  render: (args) => ({
    components: { VcDynamicProperty },
    setup() {
      const value = ref(args.modelValue);
      const onUpdate = (data: any) => {
        value.value = data.value;
        updateAction(data);
      };
      return { args, value, onUpdate };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcDynamicProperty
          v-bind="args"
          :model-value="value"
          @update:model-value="onUpdate"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "DateTime value type renders as a VcInput with `type=\"datetime-local\"` for date and time selection.",
      },
    },
  },
};

/**
 * Boolean property rendered as a toggle switch.
 */
export const BooleanType: Story = {
  args: {
    property: { id: "prop-6", name: "isActive" },
    name: "Is Active",
    valueType: "Boolean",
    modelValue: true,
  },
  render: (args) => ({
    components: { VcDynamicProperty },
    setup() {
      const value = ref(args.modelValue);
      const onUpdate = (data: any) => {
        value.value = data.value;
        updateAction(data);
      };
      return { args, value, onUpdate };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcDynamicProperty
          v-bind="args"
          :model-value="value"
          @update:model-value="onUpdate"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Boolean value type renders as a VcSwitch toggle. Useful for on/off flags like active status or feature toggles.",
      },
    },
  },
};

/**
 * Color property rendered as a color picker input.
 */
export const ColorType: Story = {
  args: {
    property: { id: "prop-7", name: "primaryColor" },
    name: "Primary Color",
    valueType: "Color",
    dictionary: false,
    multivalue: false,
    modelValue: "#3b82f6",
  },
  render: (args) => ({
    components: { VcDynamicProperty },
    setup() {
      const value = ref(args.modelValue);
      const onUpdate = (data: any) => {
        value.value = data.value;
        updateAction(data);
      };
      return { args, value, onUpdate };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcDynamicProperty
          v-bind="args"
          :model-value="value"
          @update:model-value="onUpdate"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Color value type (non-dictionary, single value) renders as a VcInput with `type=\"color\"` for native color picking.",
      },
    },
  },
};

/**
 * Dictionary property with predefined options loaded via optionsGetter.
 */
export const DictionarySelect: Story = {
  args: {
    property: { id: "prop-8", name: "category", dictionary: true },
    name: "Category",
    valueType: "ShortText",
    dictionary: true,
    modelValue: "electronics",
    optionsGetter: async () => [
      { id: "electronics", value: "Electronics", alias: "Electronics" },
      { id: "clothing", value: "Clothing", alias: "Clothing" },
      { id: "books", value: "Books", alias: "Books" },
      { id: "home", value: "Home & Garden", alias: "Home & Garden" },
      { id: "sports", value: "Sports", alias: "Sports" },
    ],
  },
  render: (args) => ({
    components: { VcDynamicProperty },
    setup() {
      const value = ref(args.modelValue);
      const onUpdate = (data: any) => {
        value.value = data.value;
        updateAction(data);
      };
      return { args, value, onUpdate };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcDynamicProperty
          v-bind="args"
          :model-value="value"
          @update:model-value="onUpdate"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "When `dictionary` is true, the component renders a VcSelect dropdown with options loaded from `optionsGetter`. Supports search filtering.",
      },
    },
  },
};

/**
 * Required property with validation.
 */
export const RequiredWithValidation: Story = {
  args: {
    property: { id: "prop-9", name: "sku" },
    name: "SKU",
    valueType: "ShortText",
    required: true,
    modelValue: "",
    rules: { min: 3, max: 20 },
  },
  render: (args) => ({
    components: { VcDynamicProperty },
    setup() {
      const value = ref(args.modelValue);
      const onUpdate = (data: any) => {
        value.value = data.value;
        updateAction(data);
      };
      return { args, value, onUpdate };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcDynamicProperty
          v-bind="args"
          :model-value="value"
          @update:model-value="onUpdate"
        />
        <p class="tw-text-xs tw-text-[var(--neutrals-400)] tw-mt-2">
          This field is required with min length 3 and max length 20.
        </p>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "When `required` is true, vee-validate enforces the field. Additional rules like `min`, `max`, and `regex` are applied from the `rules` prop.",
      },
    },
  },
};

/**
 * Disabled property in read-only state.
 */
export const Disabled: Story = {
  args: {
    property: { id: "prop-10", name: "readOnlyField" },
    name: "Read-Only Field",
    valueType: "ShortText",
    disabled: true,
    modelValue: "This value cannot be changed",
  },
  render: (args) => ({
    components: { VcDynamicProperty },
    setup() {
      const value = ref(args.modelValue);
      const onUpdate = (data: any) => {
        value.value = data.value;
        updateAction(data);
      };
      return { args, value, onUpdate };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcDynamicProperty
          v-bind="args"
          :model-value="value"
          @update:model-value="onUpdate"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "When `disabled` is true, the rendered input control is non-interactive. Useful for displaying property values in read-only contexts.",
      },
    },
  },
};

/**
 * Multiple value types displayed together as a property form.
 */
export const PropertyForm: Story = {
  render: () => ({
    components: { VcDynamicProperty },
    setup() {
      const properties = [
        { id: "p1", name: "productName", label: "Product Name", valueType: "ShortText", value: "Widget Pro", required: true },
        { id: "p2", name: "description", label: "Description", valueType: "LongText", value: "A premium widget for all your needs." },
        { id: "p3", name: "price", label: "Price", valueType: "Number", value: 29.99, required: true },
        { id: "p4", name: "stock", label: "Stock Quantity", valueType: "Integer", value: 150 },
        { id: "p5", name: "releaseDate", label: "Release Date", valueType: "DateTime", value: "2026-06-01T09:00" },
        { id: "p6", name: "isPublished", label: "Published", valueType: "Boolean", value: true },
      ];

      const values = ref<Record<string, any>>(
        Object.fromEntries(properties.map((p) => [p.id, p.value])),
      );

      const noopGetter = async () => [];

      const handleUpdate = (propId: string, data: any) => {
        values.value[propId] = data.value;
        updateAction({ propId, ...data });
      };

      return { properties, values, noopGetter, handleUpdate };
    },
    template: `
      <div class="tw-p-4 tw-max-w-lg tw-flex tw-flex-col tw-gap-4">
        <h3 class="tw-text-lg tw-font-semibold tw-m-0">Product Properties</h3>
        <VcDynamicProperty
          v-for="prop in properties"
          :key="prop.id"
          :property="prop"
          :model-value="values[prop.id]"
          :value-type="prop.valueType"
          :name="prop.label"
          :required="prop.required || false"
          :options-getter="noopGetter"
          @update:model-value="(data) => handleUpdate(prop.id, data)"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "A composition example showing multiple dynamic properties of different value types rendered together as a product property form.",
      },
    },
  },
};

/**
 * Accessibility: labels, required indicators, and keyboard navigation.
 */
export const Accessibility: Story = {
  args: {
    property: { id: "prop-a11y", name: "accessibleField" },
    name: "Accessible Field",
    valueType: "ShortText",
    required: true,
    modelValue: "",
    placeholder: "Type something...",
  },
  render: (args) => ({
    components: { VcDynamicProperty },
    setup() {
      const value = ref(args.modelValue);
      const onUpdate = (data: any) => {
        value.value = data.value;
        updateAction(data);
      };
      return { args, value, onUpdate };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcDynamicProperty
          v-bind="args"
          :model-value="value"
          @update:model-value="onUpdate"
        />
        <p class="tw-text-xs tw-text-[var(--neutrals-400)] tw-mt-3">
          The component uses vee-validate Field for validation and associates labels with inputs.
          Required fields show a visual indicator. Tab navigation works across all input types.
        </p>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Dynamic properties inherit accessibility from their underlying input components (VcInput, VcSelect, VcSwitch, etc.). Labels are associated with inputs, required fields are marked, and keyboard navigation is fully supported.",
      },
    },
  },
};
