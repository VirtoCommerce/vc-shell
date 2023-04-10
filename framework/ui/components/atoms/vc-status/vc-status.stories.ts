import type { Meta, StoryObj } from "@storybook/vue3";
import { VcStatus } from "./";

const meta: Meta<typeof VcStatus> = {
  title: "atoms/VcStatus",
  component: VcStatus,
};

export default meta;
type Story = StoryObj<typeof VcStatus>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcStatus },
    setup() {
      return { args };
    },
    template: '<vc-status v-bind="args">Status text</vc-status>',
  }),
  args: {
    variant: "danger",
  },
};
