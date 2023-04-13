import type { Meta, StoryObj } from "@storybook/vue3";
import { VcHint } from "./";

const meta: Meta<typeof VcHint> = {
  title: "atoms/VcHint",
  component: VcHint,
};

export default meta;
type Story = StoryObj<typeof VcHint>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcHint },
    setup() {
      return { args };
    },
    template: '<vc-hint v-bind="args">This is a hint</vc-hint>',
  }),
  args: {},
};
