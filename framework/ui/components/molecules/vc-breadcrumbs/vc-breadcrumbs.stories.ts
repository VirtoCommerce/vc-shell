import type { Meta, StoryFn } from "@storybook/vue3";
import { VcBreadcrumbs } from "./";

export default {
  title: "molecules/VcBreadcrumbs",
  component: VcBreadcrumbs,
  args: {
    items: [
      {
        id: "0",
        title: "Back",
        icon: "fas fa-arrow-left",
      },
      {
        id: "1",
        title: "Electronics",
      },
      {
        id: "2",
        title: "Desktop",
      },
    ],
  },
  argTypes: {
    items: {
      control: "object",
      table: {
        type: {
          summary:
            "{ id: string, title: string, icon?: string, clickHandler?: (id: string) => void | Promise<void> }[]",
        },
      },
    },
  },
} satisfies Meta<typeof VcBreadcrumbs>;

export const Primary: StoryFn<typeof VcBreadcrumbs> = (args) => ({
  components: { VcBreadcrumbs },
  setup() {
    return { args };
  },
  template: '<vc-breadcrumbs v-bind="args"></vc-breadcrumbs>',
});
