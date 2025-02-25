import type { Meta, StoryFn } from "@storybook/vue3";
import { VcImage } from "./";

const ASPECT = ["1x1", "3x2", "4x3", "16x9"];
const SIZE = ["auto", "xs", "s", "m", "l", "xl", "xxl"];
const BACKGROUND = ["cover", "contain", "auto"];

export default {
  title: "atoms/VcImage",
  component: VcImage,
  args: {
    aspect: "1x1",
    rounded: false,
    clickable: false,
    src: "https://picsum.photos/600",
    size: "auto",
    background: "cover",
  },
  argTypes: {
    aspect: {
      control: "radio",
      options: ASPECT,
      table: {
        type: {
          summary: ASPECT.join(" | "),
        },
      },
    },
    size: {
      options: SIZE,
      control: "radio",
      table: {
        type: {
          summary: SIZE.join(" | "),
        },
      },
    },
    background: {
      options: BACKGROUND,
      control: "radio",
      table: {
        type: {
          summary: BACKGROUND.join(" | "),
        },
      },
    },
  },
} satisfies Meta<typeof VcImage>;

export const Primary: StoryFn<typeof VcImage> = (args) => ({
  components: { VcImage },
  setup() {
    return { args };
  },
  template: '<div style="width: 400px"><vc-image v-bind="args"></vc-image></div>',
});

export const AllStates: StoryFn<typeof VcImage> = (args) => ({
  components: { VcImage },
  setup() {
    return { args, aspects: ASPECT, sizes: SIZE, backgrounds: BACKGROUND };
  },
  template: `
      <div>
        <div v-for="aspect in aspects" :key="aspect">
          <h2 class="tw-font-bold">Aspect: {{aspect}}</h2>
          <div class="tw-space-x-4 tw-flex tw-flex-row">
            <div v-for="size in sizes" :key="size" >
              <h3 class="">Size: <span class="tw-font-bold">{{size}}</span></h3>
              <vc-image v-bind="{...args, aspect, size}"></vc-image>
            </div>
          </div>
        </div>
        <div>
          <h2 class="tw-font-bold">Bordered and Rounded</h2>
          <div class="tw-space-x-4 tw-flex tw-flex-row">
            <div v-for="size in sizes" :key="size" >
              <h3 class="">Size: <span class="tw-font-bold">{{size}}</span></h3>
              <vc-image v-bind="{...args, aspect: '1x1', size, bordered: true, rounded: true}"></vc-image>
            </div>
          </div>
        </div>
      </div>
    `,
});
