import type { Meta, StoryObj } from "@storybook/vue3";
import { VcPopup } from "./";

const meta: Meta<typeof VcPopup> = {
  title: "organisms/VcPopup",
  component: VcPopup,
};

export default meta;
type Story = StoryObj<typeof VcPopup>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcPopup },
    setup() {
      return { args };
    },
    template: '<vc-popup v-bind="args"></vc-popup>',
  }),
  args: {},
};
