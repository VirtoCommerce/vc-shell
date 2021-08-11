/**
 * Thumbnail component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcThumbnail from "./vc-thumbnail.vue";

export default {
  title: "atoms/vc-thumbnail",
  component: VcThumbnail,
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
  components: { VcThumbnail },
  setup() {
    return { args };
  },
  template:
    '<div style="width: 400px"><vc-thumbnail v-bind="args"></vc-thumbnail></div>',
});

export const Thumbnail = Template.bind({});
Thumbnail.storyName = "vc-thumbnail";
Thumbnail.args = {
  aspect: "1x1",
  rounded: false,
  clickable: false,
  src: "https://placekitten.com/800/600",
  size: "auto",
};
