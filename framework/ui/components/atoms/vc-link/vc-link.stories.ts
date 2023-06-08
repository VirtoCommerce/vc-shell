import type { Meta, StoryObj } from "@storybook/vue3";
import { VcLink } from "./";

const meta: Meta<typeof VcLink> = {
  title: "atoms/VcLink",
  component: VcLink,
};

export default meta;
type Story = StoryObj<typeof VcLink>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcLink },
    setup() {
      return { args };
    },
    template: '<vc-link v-bind="args">This is a link</vc-link>',
  }),
  args: {
    active: false,
    disabled: false,
  },
};
