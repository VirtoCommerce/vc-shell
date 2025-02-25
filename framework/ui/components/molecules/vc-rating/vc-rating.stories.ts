import type { Meta, StoryFn } from "@storybook/vue3";
import { VcRating } from "./";

const VARIANT = ["stars", "star-and-text", "text"];

export default {
  title: "molecules/VcRating",
  component: VcRating,
  args: {
    modelValue: 4,
    max: 5,
    variant: "stars",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: VARIANT,
    },
  },
} satisfies Meta<typeof VcRating>;

export const Template: StoryFn<typeof VcRating> = (args) => ({
  components: { VcRating },
  setup() {
    return { args };
  },
  template: '<vc-rating v-bind="args"></vc-rating>',
});

export const Label = Template.bind({});
Label.args = {
  label: "Rating",
};

export const Tooltip = Template.bind({});
Tooltip.args = {
  tooltip: "This is a tooltip",
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: "Select a rating",
  modelValue: undefined,
};

export const AllVariants: StoryFn<typeof VcRating> = (args) => ({
  components: { VcRating },
  setup() {
    return { args, variants: VARIANT };
  },
  template: `
    <div class="tw-grid tw-gap-5 tw-grid-cols-3">
      <div v-for="variant in variants">
      <h2 class="tw-font-bold">Variant: {{variant}}</h2>
        <vc-rating v-bind="args" :variant="variant" />
      </div>
    </div>
  `,
});
