/**
 * Tags component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTags from "./vc-tags.vue";

export default {
  title: "organisms/vc-tags",
  component: VcTags,
};

const Template: Story = (args) => ({
  components: { VcTags },
  setup() {
    return { args };
  },
  template: '<vc-tags v-bind="args"></vc-tags>',
});

export const Tags = Template.bind({});
Tags.storyName = "vc-tags";
Tags.args = {};
