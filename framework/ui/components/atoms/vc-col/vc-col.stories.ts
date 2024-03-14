import type { Meta, StoryFn } from "@storybook/vue3";
import { VcCol } from "./";
import { VcRow } from "./../vc-row";
import { VcImage } from "./../../";

export default {
  title: "atoms/VcCol",
  component: VcCol,
} satisfies Meta<typeof VcCol>;

export const Primary: StoryFn<typeof VcCol> = (args) => ({
  components: { VcCol, VcImage, VcRow },
  setup() {
    return { args };
  },
  template: `
      <vc-col v-bind="args">
        <vc-image src="https://picsum.photos/200" size="xl"/>
        <vc-image src="https://picsum.photos/200" size="xl"/>
        <vc-image src="https://picsum.photos/200" size="xl"/>
      </vc-col>`,
});
