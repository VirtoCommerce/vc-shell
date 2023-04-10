import type { Meta, StoryObj } from "@storybook/vue3";
import { VcButton } from "./";

const meta: Meta<typeof VcButton> = {
  title: "atoms/VcButton",
  component: VcButton,
};

export default meta;
type Story = StoryObj<typeof VcButton>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcButton },
    setup() {
      return { args };
    },
    template: '<vc-button v-bind="args">I am a button</vc-button>',
  }),
  args: {
    icon: "fas fa-star",
    variant: "primary",
    disabled: false,
    small: false,
  },
};
