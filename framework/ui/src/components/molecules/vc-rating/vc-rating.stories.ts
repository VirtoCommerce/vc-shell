/**
 * Rating component.
 * @author Aleksandr Vishnyakov <av@virtoway.com>
 */
import { Story } from "@storybook/vue3";
import VcRating from "./vc-rating.vue";

export default {
  title: "atoms/vc-rating",
  component: VcRating,
};

const Template: Story = (args) => ({
  components: { VcRating },
  setup() {
    return { args };
  },
  template: '<vc-rating v-bind="args"></vc-rating>',
});

export const Rating = Template.bind({});
Rating.storyName = "vc-rating";
Rating.args = {};
