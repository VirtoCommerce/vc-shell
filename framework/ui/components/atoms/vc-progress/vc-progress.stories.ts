import type { Meta, StoryObj } from "@storybook/vue3";
import { VcProgress } from "./";

const meta: Meta<typeof VcProgress> = {
  title: "atoms/VcProgress",
  component: VcProgress,
};

export default meta;
type Story = StoryObj<typeof VcProgress>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcProgress },
    setup() {
      return { args };
    },
    template: '<vc-progress v-bind="args"></vc-progress>',
  }),
  args: {
    value: 30,
    variant: "striped",
  },
};
