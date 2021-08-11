/**
 * Image component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcImage from "./vc-image.vue";

export default {
  title: "atoms/vc-image",
  component: VcImage,
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
  src: "https://placekitten.com/800/600",
};
