import type { Meta, StoryObj } from "@storybook/vue3";
import { VcLabel } from "./";

const meta: Meta<typeof VcLabel> = {
  title: "atoms/VcLabel",
  component: VcLabel,
};

export default meta;
type Story = StoryObj<typeof VcLabel>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcLabel },
    setup() {
      return { args };
    },
    template: '<vc-label v-bind="args">This is a label</vc-label>',
  }),
  args: {},
};
