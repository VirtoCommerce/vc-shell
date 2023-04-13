import type { Meta, StoryObj } from "@storybook/vue3";
import { VcIcon } from "./";

const meta: Meta<typeof VcIcon> = {
  title: "atoms/VcIcon",
  component: VcIcon,
};

export default meta;
type Story = StoryObj<typeof VcIcon>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcIcon },
    setup() {
      return { args };
    },
    template: '<vc-icon v-bind="args"></vc-icon>',
  }),
  args: {
    icon: "fas fa-star",
    size: "m",
  },
};
