import type { Meta, StoryObj } from "@storybook/vue3";
import { VcImage } from "./";

const meta: Meta<typeof VcImage> = {
  title: "atoms/VcImage",
  component: VcImage,
  argTypes: {
    aspect: {
      options: ["1x1", "3x2", "4x3", "16x9"],
      control: { type: "radio" },
    },
    size: {
      options: ["auto", "xs", "s", "m", "l", "xl"],
      control: { type: "radio" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VcImage>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcImage },
    setup() {
      return { args };
    },
    template: '<div style="width: 400px"><vc-image v-bind="args"></vc-image></div>',
  }),
  args: {
    aspect: "1/1",
    rounded: false,
    clickable: false,
    src: "https://placekitten.com/800/600",
    size: "auto",
  },
};
