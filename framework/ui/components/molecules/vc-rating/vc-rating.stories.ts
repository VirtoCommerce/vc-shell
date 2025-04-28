import { ref } from "vue";
import { Meta, StoryObj } from "@storybook/vue3";
import VcRating from "./vc-rating.vue";

// More on default export: https://storybook.js.org/docs/vue/writing-stories/introduction#default-export
const meta: Meta<typeof VcRating> = {
  title: "Molecules/VcRating",
  component: VcRating,
  // More on argTypes: https://storybook.js.org/docs/vue/api/argtypes
  tags: ["autodocs"],
  args: {
    modelValue: 4,
    max: 5,
    variant: "stars",
  },
  argTypes: {
    modelValue: {
      description: "Current rating value",
      control: { type: "number" },
      table: {
        category: "State",
        type: { summary: "number" },
        defaultValue: { summary: "undefined" },
      },
    },
    max: {
      description: "Maximum rating value",
      control: { type: "number" },
      table: {
        category: "Props",
        type: { summary: "number" },
        defaultValue: { summary: 5 },
      },
    },
    variant: {
      description: "Rating display variant",
      control: { type: "select" },
      options: ["stars", "star-and-text", "text"],
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "stars" },
      },
    },
    label: {
      description: "Label for the rating component",
      control: { type: "text" },
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    placeholder: {
      description: "Placeholder text when no rating is available",
      control: { type: "text" },
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "No rating" },
      },
    },
    tooltip: {
      description: "Additional tooltip information",
      control: { type: "text" },
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    "update:modelValue": {
      description: "Event emitted when rating value changes",
      table: {
        category: "Events",
        type: { summary: "number" },
      },
      action: "update:modelValue",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcRating component displays a rating visualization with different display variants:
- Stars: Displays rating as stars
- Star and Text: Displays rating as stars with text representation
- Text Only: Displays rating as text

The component supports v-model binding for the rating value, maximum rating limit,
and various display options like label, tooltip, and placeholder for no rating.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VcRating>;

// More on component templates: https://storybook.js.org/docs/vue/writing-stories/introduction#using-args
export const Stars: Story = {
  args: {
    modelValue: 4,
    max: 5,
    variant: "stars",
    label: "Rating",
  },
  render: (args) => ({
    components: { VcRating },
    setup() {
      const rating = ref(args.modelValue);
      return { args, rating };
    },
    template: `
      <div style="max-width: 300px;">
        <VcRating
          v-model="rating"
          :max="args.max"
          :variant="args.variant"
          :label="args.label"
          :tooltip="args.tooltip"
          :placeholder="args.placeholder"
        />
        <p>Current rating: {{ rating }}</p>
      </div>
    `,
  }),
};

export const StarAndText: Story = {
  args: {
    modelValue: 3,
    max: 5,
    variant: "star-and-text",
    label: "Product Rating",
  },
  render: (args) => ({
    components: { VcRating },
    setup() {
      const rating = ref(args.modelValue);
      return { args, rating };
    },
    template: `
      <div style="max-width: 300px;">
        <VcRating
          v-model="rating"
          :max="args.max"
          :variant="args.variant"
          :label="args.label"
          :tooltip="args.tooltip"
          :placeholder="args.placeholder"
        />
      </div>
    `,
  }),
};

export const TextOnly: Story = {
  args: {
    modelValue: 5,
    max: 5,
    variant: "text",
    label: "Text Rating",
  },
  render: (args) => ({
    components: { VcRating },
    setup() {
      const rating = ref(args.modelValue);
      return { args, rating };
    },
    template: `
      <div style="max-width: 300px;">
        <VcRating
          v-model="rating"
          :max="args.max"
          :variant="args.variant"
          :label="args.label"
          :tooltip="args.tooltip"
          :placeholder="args.placeholder"
        />
      </div>
    `,
  }),
};

export const WithTooltip: Story = {
  args: {
    modelValue: 4,
    max: 5,
    variant: "stars",
    label: "Rating with Tooltip",
    tooltip: "This shows the product's average customer rating",
  },
  render: (args) => ({
    components: { VcRating },
    setup() {
      const rating = ref(args.modelValue);
      return { args, rating };
    },
    template: `
      <div style="max-width: 300px;">
        <VcRating
          v-model="rating"
          :max="args.max"
          :variant="args.variant"
          :label="args.label"
          :tooltip="args.tooltip"
          :placeholder="args.placeholder"
        />
      </div>
    `,
  }),
};

export const NoRating: Story = {
  args: {
    modelValue: 0,
    max: 5,
    variant: "stars",
    label: "No Rating",
    placeholder: "Not rated yet",
  },
  render: (args) => ({
    components: { VcRating },
    setup() {
      const rating = ref(args.modelValue);
      return { args, rating };
    },
    template: `
      <div style="max-width: 300px;">
        <VcRating
          v-model="rating"
          :max="args.max"
          :variant="args.variant"
          :label="args.label"
          :tooltip="args.tooltip"
          :placeholder="args.placeholder"
        />
      </div>
    `,
  }),
};

export const CustomMax: Story = {
  args: {
    modelValue: 8,
    max: 10,
    variant: "star-and-text",
    label: "10-Star Rating",
  },
  render: (args) => ({
    components: { VcRating },
    setup() {
      const rating = ref(args.modelValue);
      return { args, rating };
    },
    template: `
      <div style="max-width: 300px;">
        <VcRating
          v-model="rating"
          :max="args.max"
          :variant="args.variant"
          :label="args.label"
          :tooltip="args.tooltip"
          :placeholder="args.placeholder"
        />
      </div>
    `,
  }),
};

export const WithDetailsSlot: Story = {
  args: {
    modelValue: 4,
    max: 5,
    variant: "stars",
    label: "Rating with Details",
  },
  render: (args) => ({
    components: { VcRating },
    setup() {
      const rating = ref(args.modelValue);
      return { args, rating };
    },
    template: `
      <div style="max-width: 300px;">
        <VcRating
          v-model="rating"
          :max="args.max"
          :variant="args.variant"
          :label="args.label"
          :tooltip="args.tooltip"
          :placeholder="args.placeholder"
        >
          <template #details>
            <div style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
              <p>Based on 128 customer reviews</p>
              <div style="display: flex; justify-content: space-between;">
                <span>5 stars</span>
                <span>75%</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>4 stars</span>
                <span>15%</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>3 stars</span>
                <span>5%</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>2 stars</span>
                <span>3%</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>1 star</span>
                <span>2%</span>
              </div>
            </div>
          </template>
        </VcRating>
      </div>
    `,
  }),
};

export const ComparisonTable: Story = {
  render: () => ({
    components: { VcRating },
    setup() {
      return {};
    },
    template: `
      <div style="max-width: 600px;">
        <h3 style="margin-bottom: 16px; font-weight: 600;">Rating Variant Comparison</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Variant</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Example</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Use Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">stars</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                <VcRating :modelValue="4" variant="stars" />
              </td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Visual representation for quick scanning</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">star-and-text</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                <VcRating :modelValue="4" variant="star-and-text" />
              </td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Combined visual and textual representation</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">text</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                <VcRating :modelValue="4" variant="text" />
              </td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Simple text representation for minimal interfaces</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
