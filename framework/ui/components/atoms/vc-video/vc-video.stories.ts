import type { Meta, StoryFn } from "@storybook/vue3";
import { VcVideo } from "./";

export default {
  title: "atoms/VcVideo",
  component: VcVideo,
  args: {
    source: "https://www.youtube.com/embed/PeXX-V-dwpA",
    label: "Video",
  },
} satisfies Meta<typeof VcVideo>;

export const Primary: StoryFn<typeof VcVideo> = (args) => ({
  components: { VcVideo },
  setup() {
    return { args };
  },
  template: '<vc-video v-bind="args" />',
});
