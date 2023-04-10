import type { Meta, StoryObj } from "@storybook/vue3";
import { VcSwitch } from "./";
import { VcHint } from "./../../";

const meta: Meta<typeof VcSwitch> = {
  title: "atoms/VcSwitch",
  component: VcSwitch,
};

export default meta;
type Story = StoryObj<typeof VcSwitch>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcSwitch, VcHint },
    setup() {
      return { args };
    },
    template: '<vc-switch v-bind="args"></vc-switch>',
  }),
  args: {},
};
