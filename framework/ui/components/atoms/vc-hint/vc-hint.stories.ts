import type { Meta, StoryFn } from "@storybook/vue3";
import { VcHint } from "./";

export default {
  title: "atoms/VcHint",
  component: VcHint,
  args: {
    default: "This is a hint",
  },
  argTypes: {
    default: {
      control: "text",
    },
  },
} satisfies Meta<typeof VcHint>;

export const Primary: StoryFn<typeof VcHint> = (args) => ({
  components: { VcHint },
  setup() {
    return { args };
  },
  template: '<vc-hint v-bind="args">{{args.default}}</vc-hint>',
});
