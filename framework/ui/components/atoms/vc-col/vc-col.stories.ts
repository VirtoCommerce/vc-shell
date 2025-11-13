import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcCol } from "./";
import { VcRow } from "./../vc-row";
import { VcImage } from "./../../";

/**
 * `VcCol` is a layout component that creates a vertical column for content.
 * It can be used within a `VcRow` component or standalone to create flexible layouts.
 */
const meta = {
  title: "Atoms/VcCol",
  component: VcCol,
  tags: ["autodocs"],
  argTypes: {
    size: {
      description:
        "Controls the flex-grow value of the column, determining how much space it takes relative to other columns",
      control: { type: "number", min: 0, step: 1 },
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    default: {
      description: "Default slot for column content",
      table: {
        category: "Slots",
        type: { summary: "VNode | VNode[]" },
      },
    },
  },
  args: {
    size: 1,
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcCol component creates a vertical column layout using flexbox.

- It has a \`size\` property that controls its flex-grow value
- It's designed to work with the VcRow component for creating flexible grid layouts
- It automatically handles overflow with \`min-width: 0\`
`,
      },
    },
  },
} satisfies Meta<typeof VcCol>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic example of a column with images stacked vertically.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcCol, VcImage },
    setup() {
      return { args };
    },
    template: `
      <vc-col v-bind="args">
        <vc-image src="https://picsum.photos/200" size="xl"/>
        <vc-image src="https://picsum.photos/200" size="xl"/>
        <vc-image src="https://picsum.photos/200" size="xl"/>
      </vc-col>
    `,
  }),
};

/**
 * Column with spacing between items.
 */
export const WithSpacing: Story = {
  render: (args) => ({
    components: { VcCol, VcImage },
    setup() {
      return { args };
    },
    template: `
      <vc-col v-bind="args" class="tw-gap-4">
        <vc-image src="https://picsum.photos/200" size="xl"/>
        <vc-image src="https://picsum.photos/200" size="xl"/>
        <vc-image src="https://picsum.photos/200" size="xl"/>
      </vc-col>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Using TailwindCSS gap utility to add spacing between column items.",
      },
    },
  },
};

/**
 * Multiple columns with different size values in a row.
 */
export const WithinRow: Story = {
  render: (args) => ({
    components: { VcCol, VcRow, VcImage },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-border tw-border-gray-200 tw-p-4 tw-rounded">
        <vc-row class="tw-gap-4">
          <vc-col :size="1" class="tw-p-2 tw-bg-gray-100 tw-rounded">
            <div class="tw-p-2 tw-font-medium tw-mb-2">Size: 1</div>
            <vc-image src="https://picsum.photos/seed/img1/200" size="l"/>
          </vc-col>
          <vc-col :size="2" class="tw-p-2 tw-bg-gray-100 tw-rounded">
            <div class="tw-p-2 tw-font-medium tw-mb-2">Size: 2</div>
            <vc-image src="https://picsum.photos/seed/img2/200" size="l"/>
          </vc-col>
          <vc-col :size="3" class="tw-p-2 tw-bg-gray-100 tw-rounded">
            <div class="tw-p-2 tw-font-medium tw-mb-2">Size: 3</div>
            <vc-image src="https://picsum.photos/seed/img3/200" size="l"/>
          </vc-col>
        </vc-row>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Columns with different size values (1, 2, and 3) within a VcRow, showing how the size property affects space distribution.",
      },
    },
  },
};

/**
 * Example using the column for content layout.
 */
export const ContentLayout: Story = {
  render: (args) => ({
    components: { VcCol },
    setup() {
      return { args };
    },
    template: `
      <vc-col v-bind="args" class="tw-gap-2 tw-p-4 tw-border tw-border-gray-200 tw-rounded">
        <h2 class="tw-text-xl tw-font-bold">Article Title</h2>
        <p class="tw-text-gray-500">Published: May 15, 2023</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi consequat felis eget felis facilisis, eget fermentum nisi varius.</p>
        <p>Pellentesque sed nunc eu odio convallis volutpat. Donec viverra, nisl vitae pretium fringilla, purus enim malesuada odio.</p>
        <div class="tw-flex tw-justify-end tw-mt-4">
          <button class="tw-bg-blue-500 tw-text-white tw-py-1 tw-px-3 tw-rounded">Read more</button>
        </div>
      </vc-col>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Using VcCol to create a content layout for an article or card.",
      },
    },
  },
};
