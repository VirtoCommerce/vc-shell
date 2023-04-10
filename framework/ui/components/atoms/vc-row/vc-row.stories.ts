import type { Meta, StoryObj } from "@storybook/vue3";
import { VcRow } from "./";
import { VcImage } from "./../../";

const meta: Meta<typeof VcRow> = {
  title: "atoms/VcRow",
  component: VcRow,
};

export default meta;
type Story = StoryObj<typeof VcRow>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcRow, VcImage },
    setup() {
      return { args };
    },
    template:
      '<vc-row v-bind="args"><vc-image src="https://placekitten.com/800/600" size="xl" /><vc-image src="https://placekitten.com/800/600" size="xl" /><vc-image src="https://placekitten.com/800/600" size="xl" /></vc-row>',
  }),
  args: {},
};
