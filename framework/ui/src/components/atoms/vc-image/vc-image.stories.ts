/**
 * Image component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcImage from "./vc-image.vue";

export default {
  title: "atoms/vc-image",
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

const Template: Story = (args) => ({
  components: { VcImage },
  setup() {
    return { args };
  },
  template:
    '<div style="width: 400px"><vc-image v-bind="args"></vc-image></div>',
});

export const Image = Template.bind({});
Image.storyName = "vc-image";
Image.args = {
  aspect: "1x1",
  rounded: false,
  clickable: false,
  src: "https://placekitten.com/800/600",
  size: "auto",
};
