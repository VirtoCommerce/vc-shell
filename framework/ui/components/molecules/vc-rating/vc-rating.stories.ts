import type { Meta, StoryObj } from "@storybook/vue3";
import { VcRating } from "./";

const meta: Meta<typeof VcRating> = {
  title: "molecules/VcRating",
  component: VcRating,
};

export default meta;
type Story = StoryObj<typeof VcRating>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcRating },
    setup() {
      return { args };
    },
    template: '<vc-rating v-bind="args"></vc-rating>',
  }),
  args: {
    modelValue: 4,
  },
};
