import type { Meta, StoryObj } from "@storybook/vue3";
import { VcFileUpload } from "./";

const meta: Meta<typeof VcFileUpload> = {
  title: "molecules/VcFileUpload",
  component: VcFileUpload,
};

export default meta;
type Story = StoryObj<typeof VcFileUpload>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcFileUpload },
    setup() {
      return { args };
    },
    template: '<vc-file-upload v-bind="args"></vc-file-upload>',
  }),
  args: {},
};
