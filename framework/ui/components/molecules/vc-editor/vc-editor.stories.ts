import type { Meta, StoryFn } from "@storybook/vue3";
import { VcEditor } from "./";

export default {
  title: "molecules/VcEditor",
  component: VcEditor,
  args: {
    assetsFolder: "folder",
    placeholder: "Editor text placeholder",
  },
  argTypes: {
    modelValue: {
      control: "text",
      table: {
        type: {
          summary: "string | number | Date",
        },
      },
    },
  },
} satisfies Meta<typeof VcEditor>;

export const Primary: StoryFn<typeof VcEditor> = (args) => ({
  components: { VcEditor },
  setup() {
    return { args };
  },
  template: '<vc-editor v-bind="args"></vc-editor>',
});
