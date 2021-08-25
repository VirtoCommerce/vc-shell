/**
 * Textarea component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTextarea from "./vc-textarea.vue";

export default {
  title: "atoms/vc-textarea",
  component: VcTextarea,
};

const Template: Story = (args) => ({
  components: { VcTextarea },
  setup() {
    return { args };
  },
  template: '<vc-textarea v-bind="args"></vc-textarea>',
});

export const Textarea = Template.bind({});
Textarea.storyName = "vc-textarea";
Textarea.args = {};
