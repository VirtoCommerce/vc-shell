/**
 * Notification component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcNotification from "./vc-notification.vue";

export default {
  title: "organisms/vc-notification",
  component: VcNotification,
};

const Template: Story = (args) => ({
  components: { VcNotification },
  setup() {
    return { args };
  },
  template: '<vc-notification v-bind="args"></vc-notification>',
});

export const Notification = Template.bind({});
Notification.storyName = "vc-notification";
Notification.args = {};
