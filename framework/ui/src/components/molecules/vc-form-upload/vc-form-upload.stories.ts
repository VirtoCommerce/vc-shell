/**
 * Form Upload component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcFormUpload from "./vc-form-upload.vue";

export default {
  title: "molecules/vc-form-upload",
  component: VcFormUpload,
};

const Template: Story = (args) => ({
  components: { VcFormUpload },
  setup() {
    return { args };
  },
  template: '<vc-form-upload v-bind="args"></vc-form-upload>',
});

export const FormUpload = Template.bind({});
FormUpload.storyName = "vc-form-upload";
FormUpload.args = {};
