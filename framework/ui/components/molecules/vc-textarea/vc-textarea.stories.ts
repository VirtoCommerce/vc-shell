import type { Meta, StoryObj } from "@storybook/vue3";
import { VcTextarea } from "./";

const meta: Meta<typeof VcTextarea> = {
  title: "molecules/VcTextarea",
  component: VcTextarea,
};

export default meta;
type Story = StoryObj<typeof VcTextarea>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcTextarea },
    setup() {
      return { args };
    },
    template: '<vc-textarea v-bind="args"></vc-textarea>',
  }),
  args: {},
};
