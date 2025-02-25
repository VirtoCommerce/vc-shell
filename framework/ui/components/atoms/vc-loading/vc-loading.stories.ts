import type { Meta, StoryFn } from "@storybook/vue3";
import { VcLoading } from "./";

export default {
  title: "atoms/VcLoading",
  component: VcLoading,
  args: {
    active: true,
  },
} satisfies Meta<typeof VcLoading>;

export const Primary: StoryFn<typeof VcLoading> = (args) => ({
  components: { VcLoading },
  setup() {
    return { args };
  },
  template: `<div class="tw-h-20"><vc-loading v-bind="args"></vc-loading></div>`,
});
