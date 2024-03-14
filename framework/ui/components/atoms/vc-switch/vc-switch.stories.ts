import type { Meta, StoryFn } from "@storybook/vue3";
import { VcSwitch } from "./";
import { VcHint } from "./../../";

export default {
  title: "atoms/VcSwitch",
  component: VcSwitch,
  args: {
    label: "This is a switch",
  },
  argTypes: {
    tooltip: {
      control: "text",
    },
  },
} satisfies Meta<typeof VcSwitch>;

export const Primary: StoryFn<typeof VcSwitch> = (args) => ({
  components: { VcSwitch, VcHint },
  setup() {
    return { args };
  },
  template: '<vc-switch v-bind="args"></vc-switch>',
});
