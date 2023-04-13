import type { Meta, StoryObj } from "@storybook/vue3";
import { VcPagination } from "./";

const meta: Meta<typeof VcPagination> = {
  title: "molecules/VcPagination",
  component: VcPagination,
};

export default meta;
type Story = StoryObj<typeof VcPagination>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcPagination },
    setup() {
      return { args };
    },
    template: '<vc-pagination v-bind="args"></vc-pagination>',
  }),
  args: {},
};
