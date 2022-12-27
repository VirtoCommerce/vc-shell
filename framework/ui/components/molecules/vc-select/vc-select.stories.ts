/**
 * Select component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcSelect from "./vc-select.vue";

export default {
  title: "molecules/vc-select",
  component: VcSelect,
};

const Template: Story = (args) => ({
  components: { VcSelect },
  setup() {
    return { args };
  },
  template: '<vc-select v-bind="args"></vc-select>',
});

export const Select = Template.bind({});
Select.storyName = "vc-select";
Select.args = {
  options: [{ id: 1, title: "Option" }],
};
