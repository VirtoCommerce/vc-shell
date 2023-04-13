import type { Meta, StoryObj } from "@storybook/vue3";
import { VcSlider } from ".";
import { VcImage, VcIcon } from "../..";

const meta: Meta<typeof VcSlider> = {
  title: "molecules/VcSlider",
  component: VcSlider,
};

export default meta;
type Story = StoryObj<typeof VcSlider>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcSlider, VcImage, VcIcon },
    setup() {
      return { args };
    },
    template:
      '<div class="tw-flex tw-h-[400px] tw-w-full"><vc-slider v-bind="args" class="tw-w-full"><template v-slot:default="{slide}"><div class="tw-w-10"><vc-image :src="slide.url" size="xl"></vc-image></div></template></vc-slider></div>',
  }),
  args: {
    navigation: true,
    slidesPerView: "2",
    slides: [
      {
        title: "Title1",
        name: "Name1",
        url: "https://placekitten.com/200/150",
      },
      {
        title: "Title2",
        name: "Name2",
        url: "https://placekitten.com/200/150",
      },
      {
        title: "Title3",
        name: "Name3",
        url: "https://placekitten.com/200/150",
      },
      {
        title: "Title4",
        name: "Name4",
        url: "https://placekitten.com/200/150",
      },
    ],
  },
};
