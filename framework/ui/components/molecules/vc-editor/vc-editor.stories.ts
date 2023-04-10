import type { Meta, StoryObj } from "@storybook/vue3";
import { VcEditor } from "./";

const meta: Meta<typeof VcEditor> = {
  title: "molecules/VcEditor",
  component: VcEditor,
};

export default meta;
type Story = StoryObj<typeof VcEditor>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcEditor },
    setup() {
      return { args };
    },
    template: '<vc-editor v-bind="args" class="tw-h-[400px]"></vc-editor></>',
  }),
  args: {},
};
