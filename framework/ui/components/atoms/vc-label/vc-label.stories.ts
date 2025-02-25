import type { Meta, StoryFn } from "@storybook/vue3";
import { VcLabel } from "./";

export default {
  title: "atoms/VcLabel",
  component: VcLabel,
  args: {
    default: "This is a label",
    tooltip: "This is a tooltip",
  },
  argTypes: {
    default: {
      control: "text",
    },
    tooltip: {
      control: "text",
    },
  },
} satisfies Meta<typeof VcLabel>;

export const Primary: StoryFn<typeof VcLabel> = (args) => ({
  components: { VcLabel },
  setup() {
    return { args };
  },
  template: `
  <vc-label v-bind="args">
    {{args.default}}
    <template #tooltip>{{args.tooltip}}</template>
  </vc-label>`,
});
