import type { Meta, StoryFn } from "@storybook/vue3";
import { VcTextarea } from "./";

export default {
  title: "molecules/VcTextarea",
  component: VcTextarea,
  args: {
    placeholder: "Placeholder",
  },
} satisfies Meta<typeof VcTextarea>;

export const Primary: StoryFn<typeof VcTextarea> = (args) => ({
  components: { VcTextarea },
  setup() {
    return { args };
  },
  template: '<vc-textarea v-bind="args"></vc-textarea>',
});

export const Label = Primary.bind({});
Label.args = {
  label: "Textarea Label",
};

export const Disabled = Primary.bind({});
Disabled.args = {
  disabled: true,
};

export const Error = Primary.bind({});
Error.args = {
  errorMessage: "This is an error",
  error: true,
};

export const Required = Primary.bind({});
Required.args = {
  label: "Textarea Label",
  required: true,
};

export const Tooltip = Primary.bind({});
Tooltip.args = {
  tooltip: "This is a tooltip",
  label: "Textarea Label",
};

export const MaximumCharacters = Primary.bind({});
MaximumCharacters.args = {
  label: "Textarea Label",
  maxlength: "10",
  modelValue: "1234567890",
};
