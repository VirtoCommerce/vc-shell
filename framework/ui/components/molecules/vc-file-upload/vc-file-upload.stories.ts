import type { Meta, StoryFn } from "@storybook/vue3";
import { VcFileUpload } from "./";

const VARIANT = ["gallery", "file-upload"];

export default {
  title: "molecules/VcFileUpload",
  component: VcFileUpload,
  args: {
    variant: "gallery",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: VARIANT,
      table: {
        type: {
          summary: VARIANT.join(" | "),
        },
      },
    },
    rules: {
      control: "object",
      table: {
        type: {
          summary: "keyof IValidationRules | IValidationRules",
        },
      },
    },
  },
} satisfies Meta<typeof VcFileUpload>;

export const Primary: StoryFn<typeof VcFileUpload> = (args) => ({
  components: { VcFileUpload },
  setup() {
    return { args };
  },
  template: '<vc-file-upload v-bind="args"></vc-file-upload>',
});
