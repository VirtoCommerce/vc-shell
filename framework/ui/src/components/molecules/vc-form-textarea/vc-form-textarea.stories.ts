/**
 * Form Textarea component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcFormTextarea from "./vc-form-textarea.vue";

export default {
  title: "molecules/vc-form-textarea",
  component: VcFormTextarea,
};

const Template: Story = (args) => ({
  components: { VcFormTextarea },
  setup() {
    return { args };
  },
  template: '<vc-form-textarea v-bind="args"></vc-form-textarea>',
});

export const FormTextarea = Template.bind({});
FormTextarea.storyName = "vc-form-textarea";
FormTextarea.args = {};
