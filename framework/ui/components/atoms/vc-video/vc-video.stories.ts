import type { Meta, StoryFn } from "@storybook/vue3";
import { VcVideo } from "./";

const SIZE = ["auto", "xs", "s", "m", "l", "xl", "xxl"];

export default {
  title: "atoms/VcVideo",
  component: VcVideo,
  args: {
    source: "https://www.youtube.com/embed/PeXX-V-dwpA",
    size: "auto",
    label: "Video",
  },
  argTypes: {
    size: {
      options: SIZE,
      control: "radio",
      table: {
        type: {
          summary: SIZE.join(" | "),
        },
      },
    },
  },
} satisfies Meta<typeof VcVideo>;

export const Primary: StoryFn<typeof VcVideo> = (args) => ({
  components: { VcVideo },
  setup() {
    return { args };
  },
  template: '<div style="width: 400px"><vc-video v-bind="args"></vc-video></div>',
});
