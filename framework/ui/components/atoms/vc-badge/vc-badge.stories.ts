import type { Meta, StoryObj } from "@storybook/vue3";
import { VcBadge } from "./";

const meta: Meta<typeof VcBadge> = {
  title: "atoms/VcBadge",
  component: VcBadge,
};

export default meta;
type Story = StoryObj<typeof VcBadge>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcBadge },
    setup() {
      return { args };
    },
    template: '<vc-badge v-bind="args">42</vc-badge>',
  }),
  args: {
    active: false,
    disabled: false,
    clickable: true,
  },
};
