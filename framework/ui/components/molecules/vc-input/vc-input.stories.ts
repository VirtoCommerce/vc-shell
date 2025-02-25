import type { Meta, StoryFn } from "@storybook/vue3";
import { VcInput } from "./";
import { VcButton } from "../..";

export default {
  title: "molecules/VcInput",
  component: VcInput,
  args: {
    label: "This is an input",
    placeholder: "Placeholder",
  },
  argTypes: {
    maxlength: {
      description: "Maximum number of characters that can be entered.",
      control: "number",
      table: {
        type: {
          summary: "number",
        },
        defaultValue: {
          summary: "1024",
        },
      },
    },
  },
} satisfies Meta<typeof VcInput>;

export const Template: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput },
  setup() {
    return { args };
  },
  template: '<vc-input v-bind="args"></vc-input>',
});

export const Error: StoryFn<typeof VcInput> = Template.bind({});
Error.args = {
  errorMessage: "This is an error",
  error: true,
};

export const Disabled: StoryFn<typeof VcInput> = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const Hint: StoryFn<typeof VcInput> = Template.bind({});
Hint.args = {
  hint: "This is a hint",
};

export const Tooltip: StoryFn<typeof VcInput> = Template.bind({});
Tooltip.args = {
  tooltip: "This is a tooltip",
};

export const Required: StoryFn<typeof VcInput> = Template.bind({});
Required.args = {
  required: true,
};

export const Prefix: StoryFn<typeof VcInput> = Template.bind({});
Prefix.args = {
  prefix: "Prefix",
};

export const Suffix: StoryFn<typeof VcInput> = Template.bind({});
Suffix.args = {
  suffix: "Suffix",
};

export const CustomInputControlSlot: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput },
  setup() {
    return { args };
  },
  template: `
  <vc-input v-bind="args">
    <template #control="{ placeholder }">
    <input
      type="range"
      :disabled="disabled"
      :placeholder="placeholder"
    />
    </template>
  </vc-input>`,
});

export const CustomPrependSlot: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcButton },
  setup() {
    return { args };
  },
  template: `
  <vc-input v-bind="args">
    <template #prepend>
      <vc-button>Action</vc-button>
    </template>
  </vc-input>`,
});

export const CustomAppendSlot: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcButton },
  setup() {
    return { args };
  },
  template: `
  <vc-input v-bind="args">
    <template #append>
      <vc-button>Action</vc-button>
    </template>
  </vc-input>`,
});

export const CustomPrependInnerSlot: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcButton },
  setup() {
    return { args };
  },
  template: `
  <vc-input v-bind="args">
    <template #prepend-inner>
      <vc-button>Action</vc-button>
    </template>
  </vc-input>`,
});

export const CustomAppendInnerSlot: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcButton },
  setup() {
    return { args };
  },
  template: `
  <vc-input v-bind="args">
    <template #append-inner>
      <vc-button>Action</vc-button>
    </template>
  </vc-input>`,
});

export const CustomErrorSlot: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput },
  setup() {
    return { args };
  },
  template: `
  <vc-input v-bind="args" error>
    <template #error>
      <p class="tw-font-bold tw-text-green-700">This is an custom error message</p>
    </template>
  </vc-input>`,
});

export const CustomHintSlot: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcButton },
  setup() {
    return { args };
  },
  template: `
  <vc-input v-bind="args">
    <template #hint>
      <VcButton text>Custom hint action button</VcButton>
    </template>
  </vc-input>`,
});
