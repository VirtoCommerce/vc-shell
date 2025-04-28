import type { Meta, StoryObj } from "@storybook/vue3";
import { VcRow } from "./";
import { VcImage } from "./../../";

/**
 * `VcRow` is a layout component that arranges its children in a horizontal row.
 * It adapts to mobile views by switching to a grid layout.
 */
const meta = {
  title: "Atoms/VcRow",
  component: VcRow,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
The VcRow component provides a simple horizontal layout:

- Arranges child elements in a horizontal row using flexbox
- Automatically adapts to mobile views by switching to a grid layout
- Ideal for creating responsive horizontal item arrangements
- Works with any component as its children
        `,
      },
    },
  },
} satisfies Meta<typeof VcRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic usage with images
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcRow, VcImage },
    setup() {
      return { args };
    },
    template: `
      <vc-row v-bind="args">
        <vc-image src="https://picsum.photos/200" size="xl" />
        <vc-image src="https://picsum.photos/201" size="xl" />
        <vc-image src="https://picsum.photos/202" size="xl" />
      </vc-row>
    `,
  }),
};

/**
 * With text content
 */
export const WithTextContent: Story = {
  render: (args) => ({
    components: { VcRow },
    setup() {
      return { args };
    },
    template: `
      <vc-row v-bind="args">
        <div class="tw-p-4 tw-bg-blue-100 tw-rounded">Item 1</div>
        <div class="tw-p-4 tw-bg-green-100 tw-rounded">Item 2</div>
        <div class="tw-p-4 tw-bg-yellow-100 tw-rounded">Item 3</div>
        <div class="tw-p-4 tw-bg-red-100 tw-rounded">Item 4</div>
      </vc-row>
    `,
  }),
};

/**
 * With cards
 */
export const WithCards: Story = {
  render: (args) => ({
    components: { VcRow },
    setup() {
      return { args };
    },
    template: `
      <vc-row v-bind="args">
        <div v-for="i in 3" :key="i" class="tw-w-64 tw-p-4 tw-border tw-border-gray-200 tw-rounded tw-shadow-sm tw-bg-white">
          <h3 class="tw-font-medium tw-mb-2">Card Title {{ i }}</h3>
          <p class="tw-text-sm tw-text-gray-600">This is a card component that demonstrates the VcRow layout.</p>
        </div>
      </vc-row>
    `,
  }),
};

/**
 * With spacing between items
 */
export const WithSpacing: Story = {
  render: (args) => ({
    components: { VcRow },
    setup() {
      return { args };
    },
    template: `
      <div>
        <p class="tw-mb-2 tw-text-sm">Items with custom spacing using utility classes</p>
        <vc-row v-bind="args" class="tw-gap-4">
          <div v-for="i in 4" :key="i" class="tw-p-4 tw-bg-gray-100 tw-rounded tw-w-32 tw-h-32 tw-flex tw-items-center tw-justify-center">
            Item {{ i }}
          </div>
        </vc-row>
      </div>
    `,
  }),
};

/**
 * Mobile layout simulation
 */
export const MobileView: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "This example shows how the component adapts to mobile view by applying the mobile class. In a real application, this would happen automatically based on viewport width.",
      },
    },
  },
  render: (args) => ({
    components: { VcRow },
    setup() {
      return { args };
    },
    template: `
      <div>
        <p class="tw-mb-2 tw-text-sm">Simulating mobile view with grid layout</p>
        <div class="vc-app_mobile">
          <vc-row v-bind="args" class="tw-gap-2">
            <div v-for="i in 4" :key="i" class="tw-p-4 tw-bg-gray-100 tw-rounded tw-flex tw-items-center tw-justify-center">
              Item {{ i }}
            </div>
          </vc-row>
        </div>
      </div>
    `,
  }),
};
