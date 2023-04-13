import type { Meta, StoryObj } from "@storybook/vue3";
import { VcStatusIcon } from "./";

const meta: Meta<typeof VcStatusIcon> = {
  title: "atoms/VcStatusIcon",
  component: VcStatusIcon,
};

export default meta;
type Story = StoryObj<typeof VcStatusIcon>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcStatusIcon },
    setup() {
      return { args };
    },
    template: '<vc-status-icon v-bind="args"></vc-status-icon>',
  }),
  args: {
    status: true,
  },
};
