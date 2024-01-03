import type { Meta, StoryObj } from "@storybook/vue3";
import { VcCheckbox } from "./";
import { VcLabel } from "../vc-label";

const meta: Meta<typeof VcCheckbox> = {
  title: "atoms/VcCheckbox",
  component: VcCheckbox,
};

export default meta;
type Story = StoryObj<typeof VcCheckbox>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcCheckbox, VcLabel },
    setup() {
      return { args };
    },
    template: '<vc-checkbox v-bind="args">Checkbox text content</vc-checkbox>',
  }),
  args: {
    modelValue: true,
    label: "Checkbox label",
  },
};
