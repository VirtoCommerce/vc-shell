import type { Meta, StoryFn } from "@storybook/vue3";
import { VcInputCurrency } from "./";
import { ref } from "vue";

export default {
  title: "molecules/VcInputCurrency",
  component: VcInputCurrency,
  args: {
    label: "Label",
    placeholder: "Placeholder",
    options: [
      {
        title: "USD",
        value: "USD",
      },
      {
        title: "EUR",
        value: "EUR",
      },
    ],
    optionLabel: "title",
    optionValue: "value",
    modelValue: 1000000,
  },
  argTypes: {
    optionLabel: {
      control: "text",
    },
    optionValue: {
      control: "text",
    },
  },
} satisfies Meta<typeof VcInputCurrency>;

export const Template: StoryFn<typeof VcInputCurrency> = (args) => ({
  components: { VcInputCurrency },
  setup() {
    const option = ref("USD");
    return { args, option };
  },
  template: '<vc-input-currency v-bind="args" v-model:option="option"></vc-input-currency>',
});

export const Hint: StoryFn<typeof VcInputCurrency> = Template.bind({});
Hint.args = {
  hint: "This is a hint",
};

export const Tooltip: StoryFn<typeof VcInputCurrency> = Template.bind({});
Tooltip.args = {
  tooltip: "This is a tooltip",
};

export const Error: StoryFn<typeof VcInputCurrency> = Template.bind({});
Error.args = {
  errorMessage: "This is an error",
  error: true,
};

export const Disabled: StoryFn<typeof VcInputCurrency> = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const Required: StoryFn<typeof VcInputCurrency> = Template.bind({});
Required.args = {
  required: true,
};

export const Prefix: StoryFn<typeof VcInputCurrency> = Template.bind({});
Prefix.args = {
  prefix: "$",
};

export const Suffix: StoryFn<typeof VcInputCurrency> = Template.bind({});
Suffix.args = {
  suffix: "USD",
};

export const Loading: StoryFn<typeof VcInputCurrency> = Template.bind({});
Loading.args = {
  loading: true,
};
