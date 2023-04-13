import type { Meta, StoryObj } from "@storybook/vue3";
import { VcInfoRow } from "./";

const meta: Meta<typeof VcInfoRow> = {
  title: "atoms/VcInfoRow",
  component: VcInfoRow,
};

export default meta;
type Story = StoryObj<typeof VcInfoRow>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcInfoRow },
    setup() {
      return { args };
    },
    template: '<vc-info-row v-bind="args"></vc-info-row>',
  }),
  args: {
    label: "Name",
    value: "This is my name",
    type: "default",
  },
};
