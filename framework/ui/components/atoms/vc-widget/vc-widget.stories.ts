import type { Meta, StoryFn } from "@storybook/vue3";
import { VcWidget } from "./";

export default {
  title: "atoms/VcWidget",
  component: VcWidget,
  args: {
    icon: "fas fa-save",
    title: "Saved",
    value: 12,
  },
} satisfies Meta<typeof VcWidget>;

export const Primary: StoryFn<typeof VcWidget> = (args) => ({
  components: { VcWidget },
  setup() {
    return { args };
  },
  template: '<vc-widget v-bind="args"></vc-widget>',
});
