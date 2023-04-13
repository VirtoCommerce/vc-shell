import type { Meta, StoryObj } from "@storybook/vue3";
import { VcBreadcrumbs } from "./";

const meta: Meta<typeof VcBreadcrumbs> = {
  title: "molecules/VcBreadcrumbs",
  component: VcBreadcrumbs,
};

export default meta;
type Story = StoryObj<typeof VcBreadcrumbs>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcBreadcrumbs },
    setup() {
      return { args };
    },
    template: '<vc-breadcrumbs v-bind="args"></vc-breadcrumbs>',
  }),
  args: {
    items: [
      {
        id: "0",
        title: "Back",
        icon: "fas fa-arrow-left",
        current: false,
      },
      {
        id: "1",
        title: "Electronics",
        current: false,
      },
      {
        id: "2",
        title: "Desktop",
        current: true,
      },
    ],
  },
};
