/**
 * Tags Item component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTagsItem from "./vc-tags-item.vue";

export default {
  title: "molecules/vc-tags-item",
  component: VcTagsItem,
};

const Template: Story = (args) => ({
  components: { VcTagsItem },
  setup() {
    return { args };
  },
  template: '<vc-tags-item v-bind="args"></vc-tags-item>',
});

export const TagsItem = Template.bind({});
TagsItem.storyName = "vc-tags-item";
TagsItem.args = {};
