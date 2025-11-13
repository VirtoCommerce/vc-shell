import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import VcSwitch from "./vc-switch.vue";
import VcHint from "../../atoms/vc-hint/vc-hint.vue";

/**
 * `VcSwitch` is a UI component that provides a visual toggle between two states.
 * It's commonly used for enabling or disabling features, turning settings on or off,
 * and other binary choices in forms and configuration interfaces.
 */
const meta = {
  title: "Molecules/VcSwitch",
  component: VcSwitch,
  tags: ["autodocs"],
  argTypes: {
    modelValue: {
      control: "boolean",
      description: "Current value of the switch (bound to v-model)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Disables the switch, making it non-interactive",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    tooltip: {
      control: "text",
      description: "Text displayed as a tooltip on hover",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "" },
      },
    },
    label: {
      control: "text",
      description: "Label text displayed with the switch",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "" },
      },
    },
    required: {
      control: "boolean",
      description: "Marks the switch as a required field",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    trueValue: {
      description: "Value representing the checked state",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    falseValue: {
      description: "Value representing the unchecked state",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
  args: {
    modelValue: false,
    disabled: false,
    tooltip: "",
    label: "Switch",
    required: false,
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcSwitch component provides a toggle with support for:

- Two-way data binding via v-model
- Adding text labels
- Displaying tooltips on hover
- Setting disabled state
- Marking as required field
        `,
      },
    },
    actions: {
      handles: ["update:modelValue"],
    },
  },
} satisfies Meta<typeof VcSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic usage of the VcSwitch component with default settings.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcSwitch },
    setup() {
      const value = ref(args.modelValue);
      return {
        args,
        value,
        updateValue: (val: boolean) => {
          value.value = val;
          console.log("Updated value:", val);
        },
      };
    },
    template: `
      <vc-switch
        v-bind="args"
        :model-value="value"
        @update:model-value="updateValue"
      />
    `,
  }),
};

/**
 * Switch component in the disabled state.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    components: { VcSwitch },
    setup() {
      const value = ref(args.modelValue);
      return {
        args,
        value,
        updateValue: (val: boolean) => {
          value.value = val;
          console.log("Updated value:", val);
        },
      };
    },
    template: `
      <vc-switch
        v-bind="args"
        :model-value="value"
        @update:model-value="updateValue"
      />
    `,
  }),
};

/**
 * Switch with a tooltip/hint message displayed below.
 */
export const WithTooltip: Story = {
  args: {
    tooltip: "Additional information",
  },
  render: (args) => ({
    components: { VcSwitch },
    setup() {
      const value = ref(args.modelValue);
      return {
        args,
        value,
        updateValue: (val: boolean) => {
          value.value = val;
          console.log("Updated value:", val);
        },
      };
    },
    template: `
      <vc-switch
        v-bind="args"
        :model-value="value"
        @update:model-value="updateValue"
      />
    `,
  }),
};

/**
 * Switch marked as required in a form.
 */
export const Required: Story = {
  args: {
    required: true,
  },
  render: (args) => ({
    components: { VcSwitch },
    setup() {
      const value = ref(args.modelValue);
      return {
        args,
        value,
        updateValue: (val: boolean) => {
          value.value = val;
          console.log("Updated value:", val);
        },
      };
    },
    template: `
      <vc-switch
        v-bind="args"
        :model-value="value"
        @update:model-value="updateValue"
      />
    `,
  }),
};

/**
 * Switch without a text label.
 */
export const WithoutLabel: Story = {
  args: {
    label: "",
  },
  render: (args) => ({
    components: { VcSwitch },
    setup() {
      const value = ref(args.modelValue);
      return {
        args,
        value,
        updateValue: (val: boolean) => {
          value.value = val;
          console.log("Updated value:", val);
        },
      };
    },
    template: `
      <vc-switch
        v-bind="args"
        :model-value="value"
        @update:model-value="updateValue"
      />
    `,
  }),
};

/**
 * Multiple switch variants demonstrating different states and configurations.
 */
export const Variants: Story = {
  render: (args) => ({
    components: { VcSwitch, VcHint },
    setup() {
      const value1 = ref(true);
      const value2 = ref(false);
      const value3 = ref(true);
      const value4 = ref(false);

      return {
        value1,
        value2,
        value3,
        value4,
        updateValue1: (val: boolean) => {
          value1.value = val;
          console.log("Updated value1:", val);
        },
        updateValue2: (val: boolean) => {
          value2.value = val;
          console.log("Updated value2:", val);
        },
        updateValue3: (val: boolean) => {
          value3.value = val;
          console.log("Updated value3:", val);
        },
        updateValue4: (val: boolean) => {
          value4.value = val;
          console.log("Updated value4:", val);
        },
      };
    },
    template: `
      <div class="tw-space-y-4">
        <vc-switch
          label="Enabled and checked"
          :model-value="value1"
          @update:model-value="updateValue1"
        />
        <vc-switch
          label="Enabled and unchecked"
          :model-value="value2"
          @update:model-value="updateValue2"
        />
        <vc-switch
          label="Disabled and checked"
          :model-value="value3"
          @update:model-value="updateValue3"
          disabled
        />
        <vc-switch
          label="Disabled and unchecked"
          :model-value="value4"
          @update:model-value="updateValue4"
          disabled
        />
        <vc-switch
          label="With tooltip"
          :model-value="value2"
          @update:model-value="updateValue2"
          tooltip="This is a tooltip"
        />
        <vc-switch
          label="Required field"
          :model-value="value2"
          @update:model-value="updateValue2"
          required
        />
      </div>
    `,
  }),
};
