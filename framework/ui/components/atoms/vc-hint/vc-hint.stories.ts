import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcHint } from "./";

/**
 * `VcHint` is a simple component for displaying hint or helper text.
 * It provides consistent styling for secondary information that guides users.
 */
const meta = {
  title: "Atoms/VcHint",
  component: VcHint,
  tags: ["autodocs"],
  argTypes: {
    default: {
      description: "Content to display inside the hint",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "VNode | VNode[]" },
      },
    },
  },
  args: {
    default: "This is a hint",
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcHint component is used to display supplementary information or guidance text.

- Styled with a muted color to indicate secondary information
- Uses a smaller font size than regular text
- Can contain text or other inline elements
`,
      },
    },
  },
} satisfies Meta<typeof VcHint>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic usage of the hint component with default styling.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcHint },
    setup() {
      return { args };
    },
    template: "<vc-hint>{{args.default}}</vc-hint>",
  }),
};

/**
 * Hint with rich text content including links.
 */
export const WithRichContent: Story = {
  render: (args) => ({
    components: { VcHint },
    setup() {
      return {};
    },
    template: `
      <vc-hint>
        This field is optional. Learn more in our
        <a href="#" style="color: var(--primary-500); text-decoration: underline;">documentation</a>.
      </vc-hint>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Hints can contain rich text content including links and other inline elements.",
      },
    },
  },
};

/**
 * Hint shown below a form field.
 */
export const FormFieldHint: Story = {
  render: (args) => ({
    components: { VcHint },
    setup() {
      return {};
    },
    template: `
      <div>
        <label style="display: block; margin-bottom: 4px; font-weight: 500;">Email address</label>
        <input
          type="email"
          style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 4px;"
          placeholder="Enter your email"
        />
        <vc-hint>We'll never share your email with anyone else.</vc-hint>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "A common use case for hints is to provide additional information below form fields.",
      },
    },
  },
};

/**
 * Multiple hints with different content.
 */
export const MultipleHints: Story = {
  render: (args) => ({
    components: { VcHint },
    setup() {
      return {};
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <div style="font-weight: 500; margin-bottom: 4px;">Password requirements:</div>
          <vc-hint>• Must be at least 8 characters long</vc-hint>
          <vc-hint>• Must include at least one number</vc-hint>
          <vc-hint>• Must include at least one special character</vc-hint>
        </div>

        <div>
          <div style="font-weight: 500; margin-bottom: 4px;">File upload:</div>
          <vc-hint>Maximum file size: 5MB</vc-hint>
          <vc-hint>Supported formats: JPG, PNG, PDF</vc-hint>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Multiple hints can be used together to provide a list of requirements or guidelines.",
      },
    },
  },
};
