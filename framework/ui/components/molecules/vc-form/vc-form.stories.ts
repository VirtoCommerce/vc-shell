import type { Meta, StoryObj } from "@storybook/vue3";
import { VcForm } from "./";

const meta: Meta<typeof VcForm> = {
  title: "molecules/VcForm",
  component: VcForm,
};

export default meta;
type Story = StoryObj<typeof VcForm>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcForm },
    setup() {
      return { args };
    },
    template: '<vc-textarea v-bind="args"></vc-textarea>',
  }),
  args: {},
};
