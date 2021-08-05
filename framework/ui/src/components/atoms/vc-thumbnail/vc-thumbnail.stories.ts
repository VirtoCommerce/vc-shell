/**
 * Thumbnail component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcThumbnail from "./vc-thumbnail.vue";

export default {
  title: "atoms/vc-thumbnail",
  component: VcThumbnail,
};

const Template: Story = (args) => ({
  components: { VcThumbnail },
  setup() {
    return { args };
  },
  template: '<vc-thumbnail v-bind="args"></vc-thumbnail>',
});

export const Thumbnail = Template.bind({});
Thumbnail.storyName = "vc-thumbnail";
Thumbnail.args = {};
