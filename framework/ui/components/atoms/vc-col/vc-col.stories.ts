import type { Meta, StoryObj } from "@storybook/vue3";
import { VcCol } from "./";
import { VcImage } from "./../../";

const meta: Meta<typeof VcCol> = {
  title: "atoms/VcCol",
  component: VcCol,
};

export default meta;
type Story = StoryObj<typeof VcCol>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcCol, VcImage },
    setup() {
      return { args };
    },
    template:
      '<vc-col v-bind="args"><vc-image src="https://placekitten.com/800/600" size="xl"/><vc-image src="https://placekitten.com/800/600" size="xl"/><vc-image src="https://placekitten.com/800/600" size="xl"/></vc-col>',
  }),
  args: {},
};
