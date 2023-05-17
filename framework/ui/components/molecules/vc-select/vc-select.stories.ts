import type { Meta, StoryObj } from "@storybook/vue3";
import { VcSelect } from "./";

const meta: Meta<typeof VcSelect> = {
  title: "molecules/VcSelect",
  // component: VcSelect,
};

export default meta;
type Story = StoryObj<typeof VcSelect>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcSelect },
    setup() {
      return { args };
    },
    template: '<vc-select v-bind="args"></vc-select>',
  }),
  args: {
    options: [
      {
        title: "123",
        label: "First label",
      },
      {
        title: "222",
        label: "Second label",
      },
      {
        title: "333",
        label: "Third label",
      },
    ],
    optionLabel: "label",
    optionValue: "title",
  },
};
