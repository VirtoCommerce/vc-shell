import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcAccordion, VcAccordionItem } from ".";

const meta = {
  title: "Molecules/VcAccordion",
  component: VcAccordion,
  tags: ["autodocs"],
  argTypes: {
    items: {
      description: "Array of accordion items to display",
      control: "object",
      table: {
        type: { summary: "AccordionItem[]" },
        defaultValue: { summary: "[]" },
      },
    },
    modelValue: {
      description: "Controls which items are expanded (single ID or array of IDs)",
      control: "object",
      table: {
        type: { summary: "string | number | (string | number)[]" },
        defaultValue: { summary: "undefined" },
      },
    },
    multiple: {
      description: "Allow multiple items to be expanded simultaneously",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    variant: {
      description: "Visual style variant of the accordion",
      control: "select",
      options: ["default", "bordered", "separated"],
      table: {
        type: { summary: "'default' | 'bordered' | 'separated'" },
        defaultValue: { summary: "'default'" },
      },
    },
    collapsedHeight: {
      description: "Default collapsed height for all items (in pixels)",
      control: "number",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "0" },
      },
    },
    maxExpandedHeight: {
      description: "Maximum height when expanded (in pixels). Content will scroll if it exceeds this height.",
      control: "number",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "undefined" },
      },
    },
  },
  args: {
    multiple: false,
    variant: "default",
    collapsedHeight: 0,
  },
  parameters: {
    docs: {
      description: {
        component: `
A flexible accordion component that supports collapsible content sections with smooth animations and customizable collapsed heights.

## Features

- **Customizable collapsed height** - Show partial content in collapsed state
- **Maximum expanded height** - Limit height with scroll for very long content
- **Smooth animations** - Fluid expand/collapse transitions
- **Smart overflow detection** - Automatically hides expand button when content fits
- **Gradient fade effect** - Fades out bottom of collapsed content
- **Multiple variants** - Default, bordered, and separated styles
- **Single/Multiple expansion** - Control whether multiple items can be open
- **Controlled/Uncontrolled** - Works with or without v-model

## Usage

\`\`\`vue
<template>
  <VcAccordion :items="accordionItems" variant="bordered" />
</template>

<script setup>
const accordionItems = [
  { id: 1, title: "Item 1", content: "Content here..." },
  { id: 2, title: "Item 2", content: "More content..." },
];
</script>
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof VcAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`;

const veryLongText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.

Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.

Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?

Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.`;

const shortText = `This is a short content that fits within the default height.`;

const mediumText = `This is medium-length content that might be partially visible when collapsed. It contains a few sentences to demonstrate the fade effect when the content exceeds the collapsed height threshold.`;

export const Default: Story = {
  render: (args) => ({
    components: { VcAccordion },
    setup() {
      const items = [
        { id: "item1", title: "What is VirtoCommerce?", content: longText },
        { id: "item2", title: "How to get started?", content: mediumText },
        { id: "item3", title: "Pricing information", content: longText },
      ];
      return { args, items };
    },
    template: `
      <VcAccordion v-bind="args" :items="items" />
    `,
  }),
};

export const WithCollapsedHeight: Story = {
  render: (args) => ({
    components: { VcAccordion },
    setup() {
      const items = [
        { id: "item1", title: "Partially visible content", content: longText },
        { id: "item2", title: "Another section", content: mediumText },
        { id: "item3", title: "More information", content: longText },
      ];
      return { args, items };
    },
    template: `
      <VcAccordion v-bind="args" :items="items" :collapsed-height="100" />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Accordion with 100px collapsed height showing partial content with fade effect.",
      },
    },
  },
};

export const MultipleOpen: Story = {
  render: (args) => ({
    components: { VcAccordion },
    setup() {
      const items = [
        { id: "item1", title: "Features", content: longText },
        { id: "item2", title: "Documentation", content: mediumText },
        { id: "item3", title: "Support", content: longText },
      ];
      const openItems = ref(["item1", "item3"]);
      return { args, items, openItems };
    },
    template: `
      <VcAccordion
        v-bind="args"
        :items="items"
        :multiple="true"
        v-model="openItems"
      />
      <div class="tw-mt-4 tw-p-4 tw-bg-gray-100 tw-rounded">
        <strong>Open items:</strong> {{ openItems }}
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Multiple items can be expanded at the same time with `multiple` prop.",
      },
    },
  },
};

export const BorderedVariant: Story = {
  render: (args) => ({
    components: { VcAccordion },
    setup() {
      const items = [
        { id: "item1", title: "Section 1", content: mediumText },
        { id: "item2", title: "Section 2", content: longText },
        { id: "item3", title: "Section 3", content: mediumText },
      ];
      return { args, items };
    },
    template: `
      <VcAccordion v-bind="args" :items="items" variant="bordered" />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Bordered variant with outer border and no rounded corners on individual items.",
      },
    },
  },
};

export const SeparatedVariant: Story = {
  render: (args) => ({
    components: { VcAccordion },
    setup() {
      const items = [
        { id: "item1", title: "Card-style item 1", content: mediumText },
        { id: "item2", title: "Card-style item 2", content: longText },
        { id: "item3", title: "Card-style item 3", content: mediumText },
      ];
      return { args, items };
    },
    template: `
      <VcAccordion v-bind="args" :items="items" variant="separated" />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Separated variant with gaps between items for a card-like appearance.",
      },
    },
  },
};

export const MixedContentLengths: Story = {
  render: (args) => ({
    components: { VcAccordion },
    setup() {
      const items = [
        {
          id: "short",
          title: "Short content (no expand button)",
          content: shortText,
        },
        {
          id: "medium",
          title: "Medium content (with fade)",
          content: mediumText,
        },
        {
          id: "long",
          title: "Long content (fully expandable)",
          content: longText,
        },
      ];
      return { args, items };
    },
    template: `
      <VcAccordion v-bind="args" :items="items" :collapsed-height="80" />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates smart overflow detection - short content shows no expand button, while longer content gets the fade effect and expand functionality.",
      },
    },
  },
};

export const WithCustomTitles: Story = {
  render: (args) => ({
    components: { VcAccordion, VcAccordionItem },
    setup() {
      return { args, longText };
    },
    template: `
      <VcAccordion v-bind="args">
        <VcAccordionItem>
          <template #title>
            <div class="tw-flex tw-items-center tw-gap-2">
              <span class="tw-px-2 tw-py-1 tw-bg-blue-500 tw-text-white tw-rounded tw-text-xs">NEW</span>
              <span>Custom title with badge</span>
            </div>
          </template>
          {{ longText }}
        </VcAccordionItem>

        <VcAccordionItem>
          <template #title>
            <div class="tw-flex tw-items-center tw-gap-2">
              <span class="tw-text-red-500">⚠️</span>
              <span>Important notice</span>
            </div>
          </template>
          {{ mediumText }}
        </VcAccordionItem>

        <VcAccordionItem title="Regular title">
          {{ shortText }}
        </VcAccordionItem>
      </VcAccordion>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Use the default slot to compose accordion items with custom title slots.",
      },
    },
  },
};

export const DisabledItems: Story = {
  render: (args) => ({
    components: { VcAccordion },
    setup() {
      const items = [
        { id: "item1", title: "Active item", content: longText, disabled: false },
        {
          id: "item2",
          title: "Disabled item",
          content: mediumText,
          disabled: true,
        },
        { id: "item3", title: "Another active item", content: longText, disabled: false },
      ];
      return { args, items };
    },
    template: `
      <VcAccordion v-bind="args" :items="items" />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Individual items can be disabled using the `disabled` property.",
      },
    },
  },
};

export const ControlledAccordion: Story = {
  render: (args) => ({
    components: { VcAccordion },
    setup() {
      const items = [
        { id: "faq1", title: "How to install?", content: mediumText },
        { id: "faq2", title: "How to configure?", content: longText },
        { id: "faq3", title: "How to deploy?", content: mediumText },
      ];
      const currentOpen = ref<string | null>("faq1");

      const openNext = () => {
        const ids = ["faq1", "faq2", "faq3"];
        const currentIndex = currentOpen.value ? ids.indexOf(currentOpen.value) : -1;
        const nextIndex = (currentIndex + 1) % ids.length;
        currentOpen.value = ids[nextIndex];
      };

      return { args, items, currentOpen, openNext };
    },
    template: `
      <div>
        <button
          @click="openNext"
          class="tw-mb-4 tw-px-4 tw-py-2 tw-bg-blue-500 tw-text-white tw-rounded hover:tw-bg-blue-600"
        >
          Open Next Item
        </button>

        <VcAccordion
          v-bind="args"
          :items="items"
          v-model="currentOpen"
        />

        <div class="tw-mt-4 tw-p-4 tw-bg-gray-100 tw-rounded">
          <strong>Currently open:</strong> {{ currentOpen }}
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Accordion state can be controlled externally using v-model.",
      },
    },
  },
};

export const IndividualCollapsedHeights: Story = {
  render: (args) => ({
    components: { VcAccordion },
    setup() {
      const items = [
        {
          id: "item1",
          title: "Fully collapsed (0px)",
          content: longText,
          collapsedHeight: 0,
        },
        {
          id: "item2",
          title: "Partially visible (60px)",
          content: longText,
          collapsedHeight: 60,
        },
        {
          id: "item3",
          title: "More visible (120px)",
          content: longText,
          collapsedHeight: 120,
        },
      ];
      return { args, items };
    },
    template: `
      <VcAccordion v-bind="args" :items="items" variant="separated" />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Each accordion item can have its own `collapsedHeight` value.",
      },
    },
  },
};

export const WithMaxExpandedHeight: Story = {
  render: (args) => ({
    components: { VcAccordion },
    setup() {
      const items = [
        {
          id: "item1",
          title: "Very long content with scroll (max 300px)",
          content: veryLongText,
          maxExpandedHeight: 300,
        },
        {
          id: "item2",
          title: "Very long content with scroll (max 200px)",
          content: veryLongText,
          maxExpandedHeight: 200,
        },
        {
          id: "item3",
          title: "Long content without limit",
          content: longText,
        },
      ];
      return { args, items, veryLongText };
    },
    template: `
      <VcAccordion v-bind="args" :items="items" variant="separated" />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "When content is very long and `maxExpandedHeight` is set, the expanded content becomes scrollable. This prevents extremely long content from taking up too much screen space.",
      },
    },
  },
};

export const WithPartialVisibilityAndScroll: Story = {
  render: (args) => ({
    components: { VcAccordion },
    setup() {
      const items = [
        {
          id: "item1",
          title: "Collapsed: 80px, Expanded max: 400px (with scroll)",
          content: veryLongText,
          collapsedHeight: 80,
          maxExpandedHeight: 400,
        },
        {
          id: "item2",
          title: "Collapsed: 100px, Expanded max: 250px (with scroll)",
          content: veryLongText,
          collapsedHeight: 100,
          maxExpandedHeight: 250,
        },
        {
          id: "item3",
          title: "Collapsed: 60px, No max height (full expansion)",
          content: veryLongText,
          collapsedHeight: 60,
        },
      ];
      return { args, items, veryLongText };
    },
    template: `
      <VcAccordion v-bind="args" :items="items" variant="bordered" />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates combining `collapsedHeight` (partial visibility with fade effect) and `maxExpandedHeight` (scroll in expanded state). Collapsed state never shows scroll for aesthetic reasons.",
      },
    },
  },
};
