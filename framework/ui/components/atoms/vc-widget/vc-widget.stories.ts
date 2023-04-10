import type { Meta, StoryObj } from "@storybook/vue3";
import { VcWidget } from "./";

const meta: Meta<typeof VcWidget> = {
  title: "atoms/VcWidget",
  component: VcWidget,
};

export default meta;
type Story = StoryObj<typeof VcWidget>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcWidget },
    setup() {
      return { args };
    },
    template: '<vc-widget v-bind="args"></vc-widget>',
  }),
  args: {
    icon: "fas fa-save",
    title: "Default",
  },
};
