import type { Meta, StoryFn } from "@storybook/vue3";
import { VcRow } from "./";
import { VcImage } from "./../../";

export default {
  title: "atoms/VcRow",
  component: VcRow,
} satisfies Meta<typeof VcRow>;

export const Primary: StoryFn<typeof VcRow> = (args) => ({
  components: { VcRow, VcImage },
  setup() {
    return { args };
  },
  template: `<vc-row v-bind="args">
      <vc-image src="https://picsum.photos/200" size="xl" />
      <vc-image src="https://picsum.photos/200" size="xl" />
      <vc-image src="https://picsum.photos/200" size="xl" />
    </vc-row>`,
});
