/**
 * Popup component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcPopup from "./vc-popup.vue";

export default {
  title: "organisms/vc-popup",
  component: VcPopup,
};

const Template: Story = (args) => ({
  components: { VcPopup },
  setup() {
    return { args };
  },
  template: '<vc-popup v-bind="args"></vc-popup>',
});

export const Popup = Template.bind({});
Popup.storyName = "vc-popup";
Popup.args = {};
