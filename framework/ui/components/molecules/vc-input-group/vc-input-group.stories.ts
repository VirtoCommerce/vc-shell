import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcCheckbox } from "@ui/components/molecules/vc-checkbox";
import { VcInput } from "@ui/components/molecules/vc-input";
import { VcRadioButton } from "@ui/components/molecules/vc-radio-button";
import { VcSelect } from "@ui/components/molecules/vc-select";
import { VcInputGroup } from "@ui/components/molecules/vc-input-group";

/**
 * `VcInputGroup` is a semantic wrapper for related form controls.
 * It is designed for text inputs, selects, checkboxes, radios, and mixed field compositions.
 */
const meta = {
  title: "Molecules/VcInputGroup",
  component: VcInputGroup,
  tags: ["autodocs"],
  argTypes: {
    label: {
      description: "Group label (renders as legend)",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    tooltip: {
      description: "Tooltip text shown on the group label",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    hint: {
      description: "Hint text shown below grouped controls",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    error: {
      description: "Error state for the entire group",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    errorMessage: {
      description: "Error message shown below the group",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    required: {
      description: "Shows required mark on the group label",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      description: "Disables all controls in the fieldset",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    orientation: {
      description: "Layout orientation for grouped controls",
      control: "select",
      options: ["vertical", "horizontal"],
      table: {
        type: { summary: "'vertical' | 'horizontal'" },
        defaultValue: { summary: "'vertical'" },
      },
    },
    role: {
      description: "ARIA role for the group container",
      control: "select",
      options: ["group", "radiogroup"],
      table: {
        type: { summary: "'group' | 'radiogroup'" },
        defaultValue: { summary: "'group'" },
      },
    },
    name: {
      description: "Shared name propagated to child controls",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
  },
  args: {
    label: "Customer profile",
    hint: "Group related form fields in one semantic section",
    orientation: "vertical",
    role: "group",
    name: "customer-profile",
  },
} satisfies Meta<typeof VcInputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const countryOptions = [
  { id: "us", title: "United States" },
  { id: "de", title: "Germany" },
  { id: "jp", title: "Japan" },
];

/**
 * Main use case: grouping text inputs and selects.
 */
export const FormFields: Story = {
  render: (args) => ({
    components: { VcInputGroup, VcInput, VcSelect },
    setup: () => {
      const firstName = ref("");
      const country = ref<string | undefined>(undefined);
      return { args, firstName, country, countryOptions };
    },
    template: `
      <div class="tw-max-w-xl tw-space-y-3">
        <VcInputGroup v-bind="args">
          <VcInput
            v-model="firstName"
            label="First name"
            placeholder="John"
          />

          <VcSelect
            v-model="country"
            label="Country"
            placeholder="Select country"
            :options="countryOptions"
            option-value="id"
            option-label="title"
          />
        </VcInputGroup>

        <div class="tw-text-sm tw-text-gray-600">
          Value: {{ { firstName, country } }}
        </div>
      </div>
    `,
  }),
};

/**
 * Horizontal form section layout.
 */
export const HorizontalFields: Story = {
  args: {
    orientation: "horizontal",
    label: "Shipping details",
    hint: "Fields can be aligned in a row",
  },
  render: (args) => ({
    components: { VcInputGroup, VcInput, VcSelect },
    setup: () => {
      const city = ref("");
      const country = ref<string | undefined>(undefined);
      return { args, city, country, countryOptions };
    },
    template: `
      <div class="tw-max-w-3xl">
        <VcInputGroup v-bind="args">
          <div class="tw-w-[280px]">
            <VcInput v-model="city" label="City" placeholder="Berlin" />
          </div>
          <div class="tw-w-[280px]">
            <VcSelect
              v-model="country"
              label="Country"
              placeholder="Select country"
              :options="countryOptions"
              option-value="id"
              option-label="title"
            />
          </div>
        </VcInputGroup>
      </div>
    `,
  }),
};

/**
 * Checkbox controls grouped with semantic fieldset/legend.
 */
export const Checkboxes: Story = {
  args: {
    label: "Delivery options",
    hint: "Choose at least one option",
    name: "delivery-options",
  },
  render: (args) => ({
    components: { VcInputGroup, VcCheckbox },
    setup: () => {
      const selected = ref<string[]>(["courier"]);
      return { args, selected };
    },
    template: `
      <div class="tw-max-w-lg tw-space-y-3">
        <VcInputGroup v-bind="args">
          <VcCheckbox v-model="selected" value="courier">Courier delivery</VcCheckbox>
          <VcCheckbox v-model="selected" value="pickup">Store pickup</VcCheckbox>
          <VcCheckbox v-model="selected" value="postal">Postal service</VcCheckbox>
        </VcInputGroup>
        <div class="tw-text-sm tw-text-gray-600">Selected: {{ selected }}</div>
      </div>
    `,
  }),
};

/**
 * Horizontal radio controls with radiogroup role.
 */
export const RadiosHorizontal: Story = {
  args: {
    role: "radiogroup",
    orientation: "horizontal",
    label: "Payment method",
    hint: "You can change it later in checkout",
    name: "payment-method",
  },
  render: (args) => ({
    components: { VcInputGroup, VcRadioButton },
    setup: () => {
      const value = ref("card");
      return { args, value };
    },
    template: `
      <div class="tw-max-w-lg tw-space-y-3">
        <VcInputGroup v-bind="args">
          <VcRadioButton v-model="value" value="card" label="Card" />
          <VcRadioButton v-model="value" value="invoice" label="Invoice" />
          <VcRadioButton v-model="value" value="cash" label="Cash" />
        </VcInputGroup>
        <div class="tw-text-sm tw-text-gray-600">Selected: {{ value }}</div>
      </div>
    `,
  }),
};

/**
 * Group-level disabled state for input/select fields.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Read-only section",
    hint: "All controls are disabled by fieldset",
    name: "readonly-profile",
  },
  render: (args) => ({
    components: { VcInputGroup, VcInput, VcSelect },
    setup: () => {
      const email = ref("john@example.com");
      const country = ref<string | undefined>("us");
      return { args, email, country, countryOptions };
    },
    template: `
      <VcInputGroup v-bind="args">
        <VcInput v-model="email" label="Email" />
        <VcSelect
          v-model="country"
          label="Country"
          :options="countryOptions"
          option-value="id"
          option-label="title"
        />
      </VcInputGroup>
    `,
  }),
};

/**
 * Group-level error message for mixed form controls.
 */
export const ErrorState: Story = {
  args: {
    label: "Billing details",
    required: true,
    error: true,
    errorMessage: "Please fill required fields in this section",
    hint: "At least one value is required",
    name: "billing-details",
  },
  render: (args) => ({
    components: { VcInputGroup, VcInput, VcSelect },
    setup: () => {
      const company = ref("");
      const country = ref<string | undefined>(undefined);
      return { args, company, country, countryOptions };
    },
    template: `
      <VcInputGroup v-bind="args">
        <VcInput v-model="company" label="Company" placeholder="ACME Inc." />
        <VcSelect
          v-model="country"
          label="Country"
          placeholder="Select country"
          :options="countryOptions"
          option-value="id"
          option-label="title"
        />
      </VcInputGroup>
    `,
  }),
};

/**
 * Accessibility demo: inspect fieldset/legend and ARIA links.
 */
export const Accessibility: Story = {
  render: () => ({
    components: { VcInputGroup, VcInput, VcSelect },
    setup: () => {
      const firstName = ref("Jane");
      const country = ref<string | undefined>("de");
      return { firstName, country, countryOptions };
    },
    template: `
      <div class="tw-max-w-xl tw-space-y-4">
        <VcInputGroup
          label="Profile section"
          name="profile-section"
          hint="Inspect aria-describedby and aria-labelledby on fieldset"
        >
          <VcInput v-model="firstName" label="First name" />
          <VcSelect
            v-model="country"
            label="Country"
            :options="countryOptions"
            option-value="id"
            option-label="title"
          />
        </VcInputGroup>

        <div class="tw-p-3 tw-bg-blue-50 tw-rounded tw-text-blue-700 tw-text-sm">
          <strong>Inspect in DOM:</strong>
          <ul class="tw-list-disc tw-pl-5 tw-mt-1">
            <li><code>fieldset</code> groups related controls semantically</li>
            <li><code>legend</code> provides section label</li>
            <li><code>aria-describedby</code> points to hint/error id</li>
            <li>works for standard form controls, not only checkbox/radio groups</li>
          </ul>
        </div>
      </div>
    `,
  }),
};
