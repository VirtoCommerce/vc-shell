import type { Meta, StoryObj } from "@storybook/vue3";
import { VcCodeEditor } from "./";

const meta: Meta<typeof VcCodeEditor> = {
  title: "molecules/VcCodeEditor",
  component: VcCodeEditor,
};

export default meta;
type Story = StoryObj<typeof VcCodeEditor>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcCodeEditor },
    setup() {
      return { args };
    },
    template: '<vc-code-editor v-bind="args" v-on="$props"></vc-code-editor>',
  }),
  args: {
    modelValue: "<div>HTML markup editor</div>",
  },
};
