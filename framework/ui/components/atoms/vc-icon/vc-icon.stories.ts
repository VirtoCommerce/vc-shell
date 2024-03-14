import type { Meta, StoryFn } from "@storybook/vue3";
import { VcIcon } from "./";

const SIZE = ["xs", "s", "m", "l", "xl", "xxl", "xxxl"];
const VARIANT = ["warning", "danger", "success"];

export default {
  title: "atoms/VcIcon",
  component: VcIcon,
  args: {
    icon: "fas fa-star",
    size: "m",
  },
  argTypes: {
    icon: { control: "text" },
    size: {
      control: "radio",
      options: SIZE,
      table: {
        type: {
          summary: SIZE.join(" | "),
        },
      },
    },
    variant: {
      control: "radio",
      options: VARIANT,
      table: {
        type: {
          summary: VARIANT.join(" | "),
        },
      },
    },
  },
} satisfies Meta<typeof VcIcon>;

export const Primary: StoryFn<typeof VcIcon> = (args) => ({
  components: { VcIcon },
  setup() {
    return { args };
  },
  template: '<vc-icon v-bind="args"></vc-icon>',
});

export const AllStates: StoryFn<typeof VcIcon> = (args) => ({
  components: {
    VcIcon,
  },
  setup() {
    return { args, variants: VARIANT, sizes: SIZE };
  },
  template: `
    <div>
      <div v-for="variant in variants" :key="variant">
        <h2 class="tw-font-bold">Color: {{variant}}</h2>
        <div class="tw-space-x-4 tw-flex tw-flex-row">
          <div v-for="size in sizes" :key="size" >
            <h3 class="">Size: <span class="tw-font-bold">{{size}}</span></h3>
            <vc-icon v-bind="{...args, variant, size}"></vc-icon>
          </div>
        </div>
      </div>
    </div>
  `,
});
