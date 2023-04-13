import type { Meta, StoryObj } from "@storybook/vue3";
import { VcLoading } from "./";

const meta: Meta<typeof VcLoading> = {
  title: "atoms/VcLoading",
  component: VcLoading,
};

export default meta;
type Story = StoryObj<typeof VcLoading>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcLoading },
    setup() {
      return { args };
    },
    template: '<vc-loading v-bind="args"></vc-loading>',
  }),
  args: {
    active: true,
  },
};
