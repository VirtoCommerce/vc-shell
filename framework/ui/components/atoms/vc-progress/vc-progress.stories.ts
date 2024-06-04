import type { Meta, StoryFn } from "@storybook/vue3";
import { VcProgress } from "./";

export default {
  title: "atoms/VcProgress",
  component: VcProgress,
  args: {
    value: 30,
    variant: "striped",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["default", "striped"],
      table: {
        type: {
          summary: '["default", "striped"]',
        },
      },
    },
  },
} satisfies Meta<typeof VcProgress>;

export const Primary: StoryFn<typeof VcProgress> = (args) => ({
  components: { VcProgress },
  setup() {
    return { args };
  },
  template: '<vc-progress v-bind="args"></vc-progress>',
});
