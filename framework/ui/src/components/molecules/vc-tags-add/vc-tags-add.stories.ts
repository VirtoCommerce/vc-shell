/**
 * Tags Add component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTagsAdd from "./vc-tags-add.vue";

export default {
  title: "molecules/vc-tags-add",
  component: VcTagsAdd,
};

const Template: Story = (args) => ({
  components: { VcTagsAdd },
  setup() {
    return { args };
  },
  template: '<vc-tags-add v-bind="args"></vc-tags-add>',
});

export const TagsAdd = Template.bind({});
TagsAdd.storyName = "vc-tags-add";
TagsAdd.args = {};
