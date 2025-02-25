import type { Meta, StoryFn } from "@storybook/vue3";
import { VcSlider } from ".";
import { VcImage, VcIcon } from "../..";

export default {
  title: "molecules/VcSlider",
  component: VcSlider,
  args: {
    navigation: true,
    slidesPerView: "2",
    overflow: false,
    slides: [
      {
        title: "Title1",
        name: "Name1",
        url: "https://picsum.photos/400",
      },
      {
        title: "Title2",
        name: "Name2",
        url: "https://picsum.photos/400",
      },
      {
        title: "Title3",
        name: "Name3",
        url: "https://picsum.photos/400",
      },
      {
        title: "Title4",
        name: "Name4",
        url: "https://picsum.photos/400",
      },
    ],
  },
  argTypes: {
    navigation: {
      control: {
        type: "boolean",
      },
    },
    slidesPerView: {
      control: {
        type: "text",
      },
    },
    slides: {
      control: {
        type: "object",
      },
    },
  },
} satisfies Meta<typeof VcSlider>;

export const Primary: StoryFn<typeof VcSlider> = (args) => ({
  components: { VcSlider, VcImage, VcIcon },
  setup() {
    return { args };
  },
  template:
    '<vc-slider v-bind="args" class="tw-w-full"><template v-slot:default="{slide}"><vc-image :src="slide.url"></vc-image></template></vc-slider>',
});
