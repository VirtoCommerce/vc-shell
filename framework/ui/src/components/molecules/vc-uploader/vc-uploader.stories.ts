/**
 * Uploader component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcUploader from "./vc-uploader.vue";

export default {
  title: "molecules/vc-uploader",
  component: VcUploader,
};

const Template: Story = (args) => ({
  components: { VcUploader },
  setup() {
    return { args };
  },
  template: '<vc-uploader v-bind="args"></vc-uploader>',
});

export const Uploader = Template.bind({});
Uploader.storyName = "vc-uploader";
Uploader.args = {};
