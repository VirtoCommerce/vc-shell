/**
 * Tags Action component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcTagsAction from "./vc-tags-action.vue";

export default {
  title: "molecules/vc-tags-action",
  component: VcTagsAction,
};

const Template: Story = (args) => ({
  components: { VcTagsAction },
  setup() {
    return { args };
  },
  template: '<vc-tags-action v-bind="args"></vc-tags-action>',
});

export const TagsAction = Template.bind({});
TagsAction.storyName = "vc-tags-action";
TagsAction.args = {};
