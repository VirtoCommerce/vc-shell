import type { Meta, StoryFn } from "@storybook/vue3";
import { VcPagination } from "./";

export default {
  title: "molecules/VcPagination",
  component: VcPagination,
  args: {
    pages: 20,
    currentPage: 3,
  },
} satisfies Meta<typeof VcPagination>;

export const Template: StoryFn<typeof VcPagination> = (args) => ({
  components: { VcPagination },
  setup() {
    return { args };
  },
  template: '<vc-pagination v-bind="args"></vc-pagination>',
});

export const Expanded = Template.bind({});
Expanded.args = {
  expanded: true,
};
