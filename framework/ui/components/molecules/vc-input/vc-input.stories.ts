import type { Meta, StoryObj } from "@storybook/vue3";
import { VcInput } from "./";

const meta: Meta<typeof VcInput> = {
  title: "molecules/VcInput",
  component: VcInput,
};

export default meta;
type Story = StoryObj<typeof VcInput>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcInput },
    setup() {
      return { args };
    },
    template: '<vc-input v-bind="args"></vc-input>',
  }),
  args: {},
};
