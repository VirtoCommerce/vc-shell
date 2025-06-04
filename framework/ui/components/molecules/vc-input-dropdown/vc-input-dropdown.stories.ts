import type { Meta, StoryObj } from "@storybook/vue3";
import { VcInputDropdown } from "./";
import { VcIcon } from "../../atoms/vc-icon";
import { VcButton } from "../../atoms/vc-button";
import { ref, computed, watch } from "vue";

/**
 * `VcInputDropdown` is a versatile component that combines an input field with a dropdown selection.
 * It allows users to enter a value while also selecting an option from a predefined list,
 * making it perfect for units of measurement, date formats, currencies, and other similar use cases.
 */
const meta = {
  title: "Molecules/VcInputDropdown",
  component: VcInputDropdown,
  tags: ["autodocs"],
  args: {
    modelValue: "100",
    label: "Input with Dropdown",
    placeholder: "Enter value",
    options: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
    option: "Option 1",
  },
  argTypes: {
    modelValue: {
      description: "Value of the input field (v-model)",
      control: "text",
      table: {
        category: "Model",
        type: { summary: "unknown" },
      },
    },
    option: {
      description: "Selected option from dropdown (v-model:option)",
      control: "text",
      table: {
        category: "Model",
        type: { summary: "unknown" },
      },
    },
    options: {
      description: "Options for the dropdown selection",
      control: "object",
      table: {
        category: "Data",
        type: { summary: "unknown[]" },
      },
    },
    optionValue: {
      description: "Property name or function to get the value from option objects",
      control: "text",
      table: {
        category: "Data",
        type: {
          summary: "string | Function",
          detail: "Property name to use as value or function that returns value from option object",
        },
        defaultValue: { summary: "id" },
      },
    },
    optionLabel: {
      description: "Property name or function to get the display label from option objects",
      control: "text",
      table: {
        category: "Data",
        type: {
          summary: "string | Function",
          detail: "Property name to use as label or function that returns label from option object",
        },
        defaultValue: { summary: "title" },
      },
    },
    inputType: {
      description: "Type of the input field",
      control: "select",
      options: ["text", "number", "email", "password", "tel", "url", "search"],
      table: {
        category: "Behavior",
        type: { summary: "string" },
        defaultValue: { summary: "text" },
      },
    },
    label: {
      description: "Label text displayed above the component",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
      },
    },
    placeholder: {
      description: "Placeholder text for the input field",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
      },
    },
    hint: {
      description: "Hint text displayed below the component",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
      },
    },
    clearable: {
      description: "Whether the input allows clearing the entered value",
      control: "boolean",
      table: {
        category: "Behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    prefix: {
      description: "Prefix text to display inside the input field",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
      },
    },
    suffix: {
      description: "Suffix text to display inside the input field",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
      },
    },
    name: {
      description: "HTML name attribute for the input field",
      control: "text",
      table: {
        category: "Behavior",
        type: { summary: "string" },
        defaultValue: { summary: "Field" },
      },
    },
    loading: {
      description: "Shows a loading spinner in the component",
      control: "boolean",
      table: {
        category: "State",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    debounce: {
      description: "Debounce time in milliseconds for search input",
      control: "number",
      table: {
        category: "Behavior",
        type: { summary: "number | string" },
        defaultValue: { summary: "0" },
      },
    },
    disabled: {
      description: "Disables the entire component",
      control: "boolean",
      table: {
        category: "State",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    autofocus: {
      description: "Automatically focuses the input field when component mounts",
      control: "boolean",
      table: {
        category: "Behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    error: {
      description: "Shows the component in error state",
      control: "boolean",
      table: {
        category: "State",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    errorMessage: {
      description: "Error message text displayed when in error state",
      control: "text",
      table: {
        category: "Validation",
        type: { summary: "string" },
      },
    },
    maxlength: {
      description: "Maximum character length for the input field",
      control: "number",
      table: {
        category: "Validation",
        type: { summary: "number | string" },
        defaultValue: { summary: "1024" },
      },
    },
    tooltip: {
      description: "Tooltip text displayed on hover",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
      },
    },
    required: {
      description: "Marks the component as required (shows asterisk)",
      control: "boolean",
      table: {
        category: "Validation",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    searchable: {
      description: "Enables search functionality in the dropdown",
      control: "boolean",
      table: {
        category: "Behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    // Slots
    control: {
      description: "Slot for custom input control",
      table: {
        category: "Slots",
        type: { summary: "(scope: { placeholder, focused, modelValue, emitValue }) => VNode" },
      },
    },
    button: {
      description: "Slot for custom dropdown button",
      table: {
        category: "Slots",
        type: { summary: "(scope: { toggleHandler }) => VNode" },
      },
    },
    "append-inner": {
      description: "Slot for custom append-inner content",
      table: {
        category: "Slots",
        type: { summary: "VNode" },
      },
    },
    "prepend-inner": {
      description: "Slot for custom prepend-inner content",
      table: {
        category: "Slots",
        type: { summary: "VNode" },
      },
    },
    append: {
      description: "Slot for custom append content",
      table: {
        category: "Slots",
        type: { summary: "VNode" },
      },
    },
    prepend: {
      description: "Slot for custom prepend content",
      table: {
        category: "Slots",
        type: { summary: "VNode" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcInputDropdown component combines an input field with a dropdown selection in a unified interface.
This creates a powerful and flexible control ideal for scenarios where users need to both input a value
and select a category, unit, or format for that value.

## Key Features

- **Value + Selection**: Combines input field with dropdown selection
- **Flexible Data Types**: Works with both primitive and object data
- **Customizable Input Types**: Supports text, number, email, etc.
- **Searchable Dropdown**: Optional search functionality for options
- **Extensive Slot System**: Multiple slots for customization
- **State Management**: Supports loading, error, disabled states
- **Consistent UX**: Follows the design system patterns

## Common Use Cases

- **Unit Selection**: Input numeric values with units (e.g., measurements)
- **Currency Inputs**: Amount with currency selection
- **Date Formats**: Date inputs with format selection
- **Custom Formatting**: Any input that requires format choice

## Usage Example

\`\`\`vue
<template>
  <VcInputDropdown
    v-model="measurement"
    v-model:option="unit"
    :options="unitOptions"
    label="Measurement"
    placeholder="Enter value"
    input-type="number"
    required
  />
</template>

<script setup>
import { ref } from 'vue';
import { VcInputDropdown } from '@vc-shell/framework';

const measurement = ref(100);
const unit = ref('cm');
const unitOptions = ['mm', 'cm', 'm', 'km'];
</script>
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof VcInputDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic usage of the component with simple string options. This demonstrates
 * the default behavior with a text input and dropdown selection.
 */
export const Default: Story = {
  args: {
    modelValue: "100",
    label: "Input with Dropdown",
    placeholder: "Enter value",
    options: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
    option: "Option 1",
    hint: "Basic example with string options",
  },
  render: (args) => ({
    components: { VcInputDropdown },
    setup() {
      const inputValue = ref(args.modelValue);
      const selectedOption = ref(args.option);

      const handleInputChange = (value: unknown) => {
        inputValue.value = value as string;
        console.log("Input changed:", value);
      };

      const handleOptionChange = (value: unknown) => {
        selectedOption.value = value as string;
        console.log("Option changed:", value);
      };

      return {
        args,
        inputValue,
        selectedOption,
        handleInputChange,
        handleOptionChange,
      };
    },
    template: `
      <div class="tw-space-y-6 tw-max-w-md">
        <VcInputDropdown
          v-model="inputValue"
          v-model:option="selectedOption"
          :label="args.label"
          :placeholder="args.placeholder"
          :options="args.options"
          :hint="args.hint"
          @update:model-value="handleInputChange"
          @update:option="handleOptionChange"
        />

        <div class="tw-p-3 tw-bg-gray-100 tw-rounded tw-text-sm">
          <div class="tw-mb-2 tw-font-medium">Component State:</div>
          <div><strong>Input Value:</strong> <code>{{ inputValue }}</code></div>
          <div><strong>Selected Option:</strong> <code>{{ selectedOption }}</code></div>
        </div>
      </div>
    `,
  }),
};

/**
 * Example showing VcInputDropdown with object options and customized appearance.
 * This demonstrates how to work with complex data structures.
 */
export const WithObjectOptions: Story = {
  args: {
    modelValue: "42",
    label: "Dimensions",
    placeholder: "Enter value",
    hint: "Enter a dimension with unit",
    inputType: "number",
    searchable: true,
    required: true,
  },
  render: (args) => ({
    components: { VcInputDropdown, VcIcon },
    setup() {
      const inputValue = ref(args.modelValue);
      const selectedOption = ref({ id: "px", label: "Pixels" });

      const options = [
        { id: "px", label: "Pixels", description: "Screen pixels (relative units)" },
        { id: "em", label: "Em units", description: "Relative to font size" },
        { id: "rem", label: "Root Em units", description: "Relative to root font size" },
        { id: "%", label: "Percentage", description: "Percentage of parent element" },
        { id: "vw", label: "Viewport Width", description: "1% of viewport width" },
        { id: "vh", label: "Viewport Height", description: "1% of viewport height" },
      ];

      // Format the displayed value with the unit
      const formattedValue = computed(() => {
        if (!inputValue.value) return "";
        return `${inputValue.value}${selectedOption.value.id}`;
      });

      return {
        args,
        inputValue,
        selectedOption,
        options,
        optionValue: "id",
        optionLabel: "label",
        formattedValue,
      };
    },
    template: `
      <div class="tw-space-y-6 tw-max-w-md">
        <VcInputDropdown
          v-model="inputValue"
          v-model:option="selectedOption"
          :label="args.label"
          :placeholder="args.placeholder"
          :hint="args.hint"
          :options="options"
          :option-value="optionValue"
          :option-label="optionLabel"
          :input-type="args.inputType"
          :searchable="args.searchable"
          :required="args.required"
        >
          <template #button="{ toggleHandler }">
            <button
              class="tw-flex tw-items-center tw-px-2 tw-text-primary-500 tw-font-medium"
              @click.stop.prevent="toggleHandler"
            >
              <span>{{ selectedOption.label }}</span>
              <VcIcon icon="material-keyboard_arrow_down" size="s" class="tw-ml-1" />
            </button>
          </template>
        </VcInputDropdown>

        <div class="tw-p-4 tw-bg-gray-100 tw-rounded tw-text-sm">
          <div class="tw-mb-2 tw-font-medium">Component State:</div>
          <div><strong>Input Value:</strong> <code>{{ inputValue }}</code></div>
          <div><strong>Selected Option:</strong> <code>{{ JSON.stringify(selectedOption) }}</code></div>
          <div class="tw-mt-2 tw-pt-2 tw-border-t tw-border-gray-200">
            <strong>Formatted Output:</strong> <span class="tw-text-base tw-font-medium">{{ formattedValue }}</span>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Example of VcInputDropdown as a currency input field with formatting.
 * This demonstrates a practical use case for financial applications.
 */
export const CurrencyInput: Story = {
  args: {
    modelValue: 1250.99,
    label: "Price",
    placeholder: "Enter price",
    hint: "Enter price with currency",
    inputType: "number",
    required: true,
    clearable: true,
  },
  render: (args) => ({
    components: { VcInputDropdown, VcIcon },
    setup() {
      const price = ref(args.modelValue);
      const currency = ref("USD");

      const currencyOptions = [
        { code: "USD", symbol: "$", name: "US Dollar" },
        { code: "EUR", symbol: "€", name: "Euro" },
        { code: "GBP", symbol: "£", name: "British Pound" },
        { code: "JPY", symbol: "¥", name: "Japanese Yen" },
      ];

      // Find the current currency object
      const currentCurrency = computed(() => {
        return currencyOptions.find((c) => c.code === currency.value) || currencyOptions[0];
      });

      // Format price with currency
      const formattedPrice = computed(() => {
        if (price.value === null || price.value === undefined) return "";

        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency.value,
          currencyDisplay: "symbol",
        }).format(price.value);
      });

      return {
        args,
        price,
        currency,
        currencyOptions,
        formattedPrice,
        currentCurrency,
      };
    },
    template: `
      <div class="tw-space-y-6 tw-max-w-md">
        <VcInputDropdown
          v-model="price"
          v-model:option="currency"
          :label="args.label"
          :placeholder="args.placeholder"
          :hint="args.hint"
          :options="currencyOptions.map(c => c.code)"
          :input-type="args.inputType"
          :required="args.required"
          :clearable="args.clearable"
        >
          <template #button="{ toggleHandler }">
            <button
              class="tw-flex tw-items-center tw-px-2 tw-text-primary-500 tw-font-medium"
              @click.stop.prevent="toggleHandler"
            >
              <span>{{ currentCurrency.symbol }} {{ currency }}</span>
              <VcIcon icon="material-keyboard_arrow_down" size="s" class="tw-ml-1" />
            </button>
          </template>
        </VcInputDropdown>

        <div class="tw-p-4 tw-bg-gray-100 tw-rounded">
          <div><strong>Formatted Output:</strong> {{ formattedPrice }}</div>
        </div>
      </div>
    `,
  }),
};

/**
 * Example demonstrating custom input with date formatting based on selected format.
 * This shows how to use the control slot for advanced customization.
 */
export const WithCustomInput: Story = {
  args: {
    modelValue: "",
    label: "Date with Format",
    placeholder: "Enter date",
    hint: "Enter date with specific format",
    tooltip: "Choose a date format and enter a date value",
  },
  render: (args) => ({
    components: { VcInputDropdown, VcIcon, VcButton },
    setup() {
      const date = ref(args.modelValue || "");
      const format = ref("DD/MM/YYYY");

      const formatOptions = [
        { id: "DD/MM/YYYY", label: "Day/Month/Year", example: "31/12/2023" },
        { id: "MM/DD/YYYY", label: "Month/Day/Year", example: "12/31/2023" },
        { id: "YYYY-MM-DD", label: "ISO Format", example: "2023-12-31" },
        { id: "MMM DD, YYYY", label: "Text Format", example: "Dec 31, 2023" },
      ];

      const formatDate = () => {
        if (!date.value) return;

        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const monthName = today.toLocaleString("default", { month: "short" });
        const year = today.getFullYear();

        switch (format.value) {
          case "DD/MM/YYYY":
            date.value = `${day}/${month}/${year}`;
            break;
          case "MM/DD/YYYY":
            date.value = `${month}/${day}/${year}`;
            break;
          case "YYYY-MM-DD":
            date.value = `${year}-${month}-${day}`;
            break;
          case "MMM DD, YYYY":
            date.value = `${monthName} ${day}, ${year}`;
            break;
        }
      };

      // Format date on component mount and when format changes
      watch(format, formatDate);

      const setToday = () => {
        formatDate();
      };

      return {
        args,
        date,
        format,
        formatOptions,
        formatDate,
        setToday,
      };
    },
    template: `
      <div class="tw-space-y-6 tw-max-w-md">
        <VcInputDropdown
          v-model="date"
          v-model:option="format"
          :label="args.label"
          :placeholder="args.placeholder"
          :hint="args.hint"
          :tooltip="args.tooltip"
          :options="formatOptions"
          :option-value="opt => opt.id"
          :option-label="opt => opt.label"
        >
          <template #control="{ placeholder }">
            <div class="tw-flex tw-items-center tw-relative tw-w-full">
              <VcButton size="xs" variety="secondary" @click="setToday">Today</VcButton>

              <VcIcon
                icon="material-calendar_today"
                class="tw-text-gray-500"
                size="s"
              />
              <input
                v-model="date"
                :placeholder="placeholder"
                class="tw-w-full tw-p-2 tw-pl-8 tw-border tw-border-solid tw-border-gray-300 tw-rounded tw-text-sm tw-outline-none"
                @blur="formatDate"
              />


            </div>
          </template>
        </VcInputDropdown>

        <div class="tw-p-4 tw-bg-gray-100 tw-rounded tw-text-sm">
          <div><strong>Date Value:</strong> {{ date || 'empty' }}</div>
          <div><strong>Format:</strong> {{ format }}</div>
        </div>
      </div>
    `,
  }),
};

/**
 * Demonstrates various component states: default, disabled, error, and loading.
 * This provides a comprehensive view of how the component looks in different states.
 */
export const States: Story = {
  args: {
    modelValue: "Sample value",
  },
  render: (args) => ({
    components: { VcInputDropdown },
    setup() {
      const defaultValue = ref("Sample value");
      const defaultOption = ref("Default");
      const disabledValue = ref("Disabled input");
      const disabledOption = ref("Disabled");
      const errorValue = ref("Error value");
      const errorOption = ref("Error");
      const loadingValue = ref("Loading...");
      const loadingOption = ref("Loading");
      const requiredValue = ref("");
      const requiredOption = ref("Required");

      const stateOptions = ["Default", "Disabled", "Error", "Loading", "Required"];

      return {
        args,
        defaultValue,
        defaultOption,
        disabledValue,
        disabledOption,
        errorValue,
        errorOption,
        loadingValue,
        loadingOption,
        requiredValue,
        requiredOption,
        stateOptions,
      };
    },
    template: `
      <div class="tw-space-y-6 tw-max-w-md">
        <h3 class="tw-text-lg tw-font-medium">Component States</h3>

        <VcInputDropdown
          v-model="defaultValue"
          v-model:option="defaultOption"
          :options="stateOptions"
          label="Default State"
          placeholder="Enter value"
          hint="This is a component in its default state"
        />

        <VcInputDropdown
          v-model="disabledValue"
          v-model:option="disabledOption"
          :options="stateOptions"
          label="Disabled State"
          placeholder="Enter value"
          hint="This component is disabled"
          disabled
        />

        <VcInputDropdown
          v-model="errorValue"
          v-model:option="errorOption"
          :options="stateOptions"
          label="Error State"
          placeholder="Enter value"
          error
          error-message="This field has an error that needs to be fixed"
        />

        <VcInputDropdown
          v-model="loadingValue"
          v-model:option="loadingOption"
          :options="stateOptions"
          label="Loading State"
          placeholder="Enter value"
          hint="This component is in loading state"
          loading
        />

        <VcInputDropdown
          v-model="requiredValue"
          v-model:option="requiredOption"
          :options="stateOptions"
          label="Required Field"
          placeholder="This field is required"
          hint="This field must have a value"
          required
        />
      </div>
    `,
  }),
};
