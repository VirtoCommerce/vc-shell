import type { Meta, StoryFn } from "@storybook/vue3";
import { VcCard } from ".";
import { VcInput, VcCol, VcButton } from "./../../";

const VARIANT = ["default", "success", "danger"];

export default {
  title: "atoms/VcCard",
  component: VcCard,
  args: {
    header: "Card Title",
    variant: "default",
    default: "Text",
  },
  argTypes: {
    default: {
      control: "radio",
      options: ["Text", "Component"],
      mapping: {
        Text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque quas!",
        Component: VcInput,
      },
    },
    header: { control: "text" },
    icon: { control: "text" },
    isCollapsable: { control: "boolean" },
    isCollapsed: { control: "boolean" },
    variant: {
      control: "radio",
      options: VARIANT,
      table: {
        type: {
          summary: VARIANT.join(" | "),
        },
      },
    },
    fill: { control: "boolean" },
  },
} satisfies Meta<typeof VcCard>;

export const Template: StoryFn<typeof VcCard> = (args) => ({
  components: { VcCard, VcInput, VcCol },
  setup() {
    return { args };
  },
  template: `
    <vc-card v-bind="args">
      <template v-if="typeof args.default === 'string'">
        <p class="tw-p-4">{{args.default}}</p>
      </template>
      <template v-else>
        <component class="tw-p-4" :is="args.default" label="Input Field" placeholder="Input some text" />
      </template>

    </vc-card>`,
});

export const Header = Template.bind({});
Header.args = { header: "Card Title" };

export const Icon = Template.bind({});
Icon.args = { icon: "fas fa-warehouse" };

export const Collapsable = Template.bind({});
Collapsable.args = { isCollapsable: true };

export const Collapsed = Template.bind({});
Collapsed.args = { isCollapsable: true, isCollapsed: true };

export const Fill = Template.bind({});
Fill.args = { fill: true, header: "Card Title" };

export const Actions: StoryFn<typeof VcCard> = (args) => ({
  components: {
    VcCard,
    VcButton,
  },
  setup: () => ({ args }),
  template: `
      <vc-card  :variant="variant" header="Card Title">
        <p class="tw-p-4">{{args.default}}</p>

        <template #actions>
          <VcButton variant="primary">Action button</VcButton>
        </template>
      </vc-card>
    `,
});

export const Variants: StoryFn<typeof VcCard> = (args) => ({
  components: {
    VcCard,
  },
  setup: () => ({ variants: VARIANT, args }),
  template: `
    <div class="tw-space-x-8 tw-flex tw-flex-row">
      <vc-card v-for="variant in variants" :variant="variant" header="Card Title">
        <p class="tw-p-4">{{args.default}}</p>
      </vc-card>
    </div>
    `,
});
