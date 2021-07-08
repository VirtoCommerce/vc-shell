/**
 * Checkbox component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from '@storybook/vue3';
import VcCheckbox from "./vc-checkbox.vue";

export default {
  title: "atoms/vc-checkbox",
  component: VcCheckbox,
};

const Template: Story = (args) => ({
  components: { VcCheckbox },
  setup() { return { args } },
  template: '<vc-checkbox v-bind="args"></vc-checkbox>',
});

export const Checkbox = Template.bind({});
Checkbox.storyName = "vc-checkbox";
Checkbox.args = {};
