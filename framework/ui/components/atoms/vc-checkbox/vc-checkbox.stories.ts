import type { Meta, StoryObj } from "@storybook/vue3";
import { VcCheckbox } from "./";

const meta: Meta<typeof VcCheckbox> = {
  title: "atoms/VcCheckbox",
  component: VcCheckbox,
};

export default meta;
type Story = StoryObj<typeof VcCheckbox>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcCheckbox },
    setup() {
      return { args };
    },
    template: '<vc-checkbox v-bind="args"></vc-checkbox>',
  }),
  args: {
    modelValue: true,
  },
};
