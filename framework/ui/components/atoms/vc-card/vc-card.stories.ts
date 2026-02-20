import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcCard } from ".";
import { VcInput, VcCol, VcButton } from "@ui/components";

/**
 * `VcCard` is a container component that provides a bordered and styled section with
 * optional header, actions, and collapsible functionality.
 */
const meta = {
  title: "Atoms/VcCard",
  component: VcCard,
  tags: ["autodocs"],
  argTypes: {
    default: {
      description: "Default slot for card content",
      control: "radio",
      options: ["Text", "Component"],
      mapping: {
        Text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque quas!",
        Component: VcInput,
      },
      table: {
        category: "Slots",
        type: { summary: "VNode | VNode[]" },
      },
    },
    header: {
      description: "Title text for the card header",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    icon: {
      description: "Icon to display in the card header (FontAwesome class name)",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    isCollapsable: {
      description: "Enables collapsing functionality for the card",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    isCollapsed: {
      description: "Controls the initial collapsed state of the card",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    variant: {
      description: "Styling variant for the card",
      control: "select",
      options: ["default", "success", "danger"],
      table: {
        type: { summary: "'default' | 'success' | 'danger'" },
        defaultValue: { summary: "'default'" },
      },
    },
    fill: {
      description: "Makes the card content fill the available space",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    actions: {
      description: "Slot for action buttons in the header",
      table: {
        category: "Slots",
        type: { summary: "VNode | VNode[]" },
      },
    },
  },
  args: {
    header: "Card Title",
    variant: "default",
    default: "Text",
  },
  parameters: {
    actions: {
      handles: ["header:click", "state:collapsed"],
    },
    docs: {
      description: {
        component: `
The VcCard component provides a styled container with optional header and collapsible functionality.

## Events
- \`header:click\`: Emitted when the card header is clicked
- \`state:collapsed\`: Emitted when the card's collapsed state changes, with the current collapsed state as payload
        `,
      },
    },
  },
} satisfies Meta<typeof VcCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic card with default styling and a text content.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcCard, VcInput },
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
      </vc-card>
    `,
  }),
};

/**
 * Card with a custom header title.
 */
export const WithHeader: Story = {
  args: {
    header: "Custom Card Title",
  },
  render: (args) => ({
    components: { VcCard, VcInput },
    setup() {
      return { args };
    },
    template: `
      <vc-card v-bind="args">
        <p class="tw-p-4">{{typeof args.default === 'string' ? args.default : 'Card content here'}}</p>
      </vc-card>
    `,
  }),
};

/**
 * Card with an icon in the header.
 */
export const WithIcon: Story = {
  args: {
    icon: "material-warehouse",
  },
  render: (args) => ({
    components: { VcCard, VcInput },
    setup() {
      return { args };
    },
    template: `
      <vc-card v-bind="args">
        <p class="tw-p-4">{{typeof args.default === 'string' ? args.default : 'Card content here'}}</p>
      </vc-card>
    `,
  }),
};

/**
 * Card that can be collapsed by clicking the header.
 */
export const Collapsable: Story = {
  args: {
    isCollapsable: true,
  },
  render: (args) => ({
    components: { VcCard, VcInput },
    setup() {
      return { args };
    },
    template: `
      <vc-card v-bind="args"
        @header:click="() => console.log('Header clicked')"
        @state:collapsed="(state) => console.log('Collapsed state changed:', state)">
        <p class="tw-p-4">{{typeof args.default === 'string' ? args.default : 'Card content here'}}</p>
      </vc-card>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Click the header to collapse or expand the card content. A chevron indicator appears in the header.",
      },
    },
  },
};

/**
 * Card that is initially collapsed.
 */
export const InitiallyCollapsed: Story = {
  args: {
    isCollapsable: true,
    isCollapsed: true,
  },
  render: (args) => ({
    components: { VcCard, VcInput },
    setup() {
      return { args };
    },
    template: `
      <vc-card v-bind="args">
        <p class="tw-p-4">{{typeof args.default === 'string' ? args.default : 'Card content here'}}</p>
      </vc-card>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "This card starts in a collapsed state but can be expanded by clicking the header.",
      },
    },
  },
};

/**
 * Card with content that fills the available space.
 */
export const FillSpace: Story = {
  args: {
    fill: true,
  },
  render: (args) => ({
    components: { VcCard, VcInput },
    setup() {
      return { args };
    },
    template: `
      <div style="height: 300px;">
        <vc-card v-bind="args">
          <div class="tw-p-4 tw-flex tw-items-center tw-justify-center tw-h-full">
            <p>This content fills the available space</p>
          </div>
        </vc-card>
      </div>
    `,
  }),
};

/**
 * Card with action buttons in the header.
 */
export const WithActions: Story = {
  render: (args) => ({
    components: { VcCard, VcButton },
    setup() {
      return { args };
    },
    template: `
      <vc-card :variant="args.variant" :header="args.header">
        <p class="tw-p-4">{{typeof args.default === 'string' ? args.default : 'Card content here'}}</p>
        <template #actions>
          <VcButton variant="primary" size="sm">Action</VcButton>
        </template>
      </vc-card>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Cards can include action buttons in the header using the actions slot.",
      },
    },
  },
};

/**
 * Display of all card variants.
 */
export const AllVariants: Story = {
  render: (args) => ({
    components: { VcCard },
    setup() {
      const variants = ["default", "success", "danger"];
      return { variants, args };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <h3 class="tw-text-lg tw-font-medium">Available Variants</h3>
        <div class="tw-flex tw-flex-wrap tw-gap-4">
          <vc-card v-for="variant in variants" :key="variant" :variant="variant" :header="variant + ' variant'">
            <p class="tw-p-4">{{typeof args.default === 'string' ? args.default : 'Card content here'}}</p>
          </vc-card>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Cards come in three variants: default, success, and danger. Each has different styling for the header.",
      },
    },
  },
};

/**
 * Card with a component in the content area.
 */
export const WithComponentContent: Story = {
  args: {
    default: "Component",
  },
  render: (args) => ({
    components: { VcCard, VcInput },
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
      </vc-card>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Cards can contain complex components instead of simple text content.",
      },
    },
  },
};
