import type { Meta, StoryFn } from "@storybook/vue3";
import { VcCheckbox } from "./";
import { VcLabel } from "../../atoms/vc-label";

export default {
  title: "molecules/VcCheckbox",
  component: VcCheckbox,
  args: {
    modelValue: true,
    label: "Checkbox label",
    default: "Checkbox text content",
  },
  argTypes: {
    modelValue: {
      control: "boolean",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    disabled: {
      control: "boolean",
    },
    required: {
      control: "boolean",
    },
    name: {
      control: "text",
    },
    errorMessage: {
      control: "text",
    },
    trueValue: {
      control: "boolean",
    },
    falseValue: {
      control: "boolean",
    },
    label: {
      control: "text",
    },
    tooltip: {
      control: "text",
    },
    default: {
      control: "text",
    },
  },
} satisfies Meta<typeof VcCheckbox>;

export const Template: StoryFn<typeof VcCheckbox> = (args) => ({
  components: { VcCheckbox, VcLabel },
  setup() {
    return { args };
  },
  template: '<vc-checkbox v-bind="args">{{args.default}}</vc-checkbox>',
});

export const Basic = Template.bind({});

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };

export const Required = Template.bind({});
Required.args = { required: true };

export const Error = Template.bind({});
Error.args = { errorMessage: "This is an error message", modelValue: false };

export const Tooltip = Template.bind({});
Tooltip.args = { tooltip: "This is a tooltip" };

export const Label = Template.bind({});
Label.args = { label: "Checkbox label" };

export const Name = Template.bind({});
Name.args = { name: "checkbox-name" };

export const TrueValue = Template.bind({});
TrueValue.args = { trueValue: false };

export const FalseValue = Template.bind({});
FalseValue.args = { falseValue: true };
