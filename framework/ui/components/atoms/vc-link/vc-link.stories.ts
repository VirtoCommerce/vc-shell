import type { Meta, StoryFn } from "@storybook/vue3";
import { VcLink } from "./";

export default {
  title: "atoms/VcLink",
  component: VcLink,
  args: {
    active: false,
    disabled: false,
    default: "This is a link",
  },
  argTypes: {
    default: {
      control: "text",
      table: {
        type: {
          summary: "text",
        },
      },
    },
    onClick: {
      table: {
        type: {
          summary: "function",
        },
      },
    },
  },
} satisfies Meta<typeof VcLink>;

export const Primary: StoryFn<typeof VcLink> = (args) => ({
  components: { VcLink },
  setup() {
    return { args };
  },
  template: '<vc-link v-bind="args">{{args.default}}</vc-link>',
});
