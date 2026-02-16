import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcContainer } from "./";

/**
 * `VcContainer` is a scrollable container component that provides:
 * - Custom scrolling behavior
 * - Optional shadows to indicate scrollable content
 * - Configurable padding
 */
const meta: Meta<typeof VcContainer> = {
  title: "Atoms/VcContainer",
  component: VcContainer,
  tags: ["autodocs"],
  argTypes: {
    shadow: {
      description: "Whether to show shadows when content is scrollable",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    noPadding: {
      description: "Removes default padding from the container",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    default: {
      description: "Default slot for content",
      table: {
        category: "Slots",
        type: { summary: "VNode | VNode[]" },
      },
    },
  },
  parameters: {
    actions: {
      handles: ["scroll"],
    },
    docs: {
      description: {
        component: `
The VcContainer component is a versatile container for scrollable content with built-in functionality:

- Wraps content in a scrollable container with customizable padding
- Provides scroll shadows to indicate more content is available
- Handles scroll behavior
- Exposes methods for programmatic scrolling

## Events
- \`scroll\`: Emitted when container is scrolled

## Exposed Methods
- \`scrollTop()\`: Scroll to the top of the container
- \`component\`: Reference to the inner container element
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VcContainer>;

/**
 * Basic container with scrollable content.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcContainer },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 400px; height: 300px; border: 1px solid #ccc; border-radius: 8px;">
        <vc-container v-bind="args">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus pellentesque tortor id lacus viverra, ut mollis libero auctor. Curabitur viverra, justo eu convallis pulvinar, dui nisi luctus quam, ut egestas tortor dolor quis nisi.</p>
          <p>Maecenas ut malesuada risus, a euismod ligula. Mauris fringilla arcu a vestibulum varius. Phasellus et quam facilisis, egestas magna ut, ultrices est.</p>
          <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque porttitor felis non turpis volutpat, ut consequat nulla vestibulum.</p>
          <p>Vivamus non nisi quis elit pellentesque pharetra quis eget augue. Donec tincidunt nunc id placerat tincidunt. Mauris ultrices quam id risus sodales, at euismod mauris convallis.</p>
          <p>Suspendisse malesuada nisl tempor tellus ullamcorper, ut varius enim molestie. Suspendisse eleifend at libero id ultricies. Duis sagittis quis metus eget condimentum.</p>
        </vc-container>
      </div>
    `,
  }),
  args: {
    shadow: false,
    noPadding: false,
  },
};

/**
 * Container with a shadow indicating scrollable content.
 */
export const WithShadow: Story = {
  render: (args) => ({
    components: { VcContainer },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 400px; height: 300px; border: 1px solid #ccc; border-radius: 8px;">
        <vc-container v-bind="args">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus pellentesque tortor id lacus viverra, ut mollis libero auctor. Curabitur viverra, justo eu convallis pulvinar, dui nisi luctus quam, ut egestas tortor dolor quis nisi.</p>
          <p>Maecenas ut malesuada risus, a euismod ligula. Mauris fringilla arcu a vestibulum varius. Phasellus et quam facilisis, egestas magna ut, ultrices est.</p>
          <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque porttitor felis non turpis volutpat, ut consequat nulla vestibulum.</p>
          <p>Vivamus non nisi quis elit pellentesque pharetra quis eget augue. Donec tincidunt nunc id placerat tincidunt. Mauris ultrices quam id risus sodales, at euismod mauris convallis.</p>
          <p>Suspendisse malesuada nisl tempor tellus ullamcorper, ut varius enim molestie. Suspendisse eleifend at libero id ultricies. Duis sagittis quis metus eget condimentum.</p>
        </vc-container>
      </div>
    `,
  }),
  args: {
    shadow: true,
    noPadding: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Adding shadow: true creates a subtle shadow effect that indicates scrollable content.",
      },
    },
  },
};

/**
 * Container without padding for edge-to-edge content.
 */
export const NoPadding: Story = {
  render: (args) => ({
    components: { VcContainer },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 400px; height: 300px; border: 1px solid #ccc; border-radius: 8px;">
        <vc-container v-bind="args">
          <div style="background-color: #f0f0f0; padding: 16px;">
            <h3 style="margin-top: 0;">Edge-to-edge content</h3>
            <p>This content has no padding from the container, allowing it to extend all the way to the edges.</p>
          </div>
          <div style="padding: 16px;">
            <p>Content can define its own padding as needed.</p>
            <p>This is useful for creating sections with different background colors or for content that needs to be edge-to-edge.</p>
          </div>
          <div style="background-color: #e0e0e0; padding: 16px;">
            <p>Another section with a different background.</p>
          </div>
        </vc-container>
      </div>
    `,
  }),
  args: {
    shadow: true,
    noPadding: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Using noPadding: true removes the default padding from the container, allowing content to extend to the edges.",
      },
    },
  },
};

/**
 * Container used as a content panel with mixed content.
 */
export const ContentPanel: Story = {
  render: (args) => ({
    components: { VcContainer },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 400px; height: 400px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background-color: #f5f5f5; padding: 16px; border-bottom: 1px solid #e0e0e0;">
          <h2 style="margin: 0; font-size: 1.2rem;">Content Panel</h2>
        </div>
        <vc-container v-bind="args">
          <h3>Section heading</h3>
          <p>VcContainer is often used to create scrollable panels within a larger layout.</p>
          <div style="background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 4px; padding: 12px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Note:</strong> This component handles overflow automatically.</p>
          </div>
          <h3>Another section</h3>
          <p>You can include various types of content including:</p>
          <ul>
            <li>Lists like this one</li>
            <li>Images and media</li>
            <li>Form elements</li>
            <li>Other components</li>
          </ul>
          <p>The container will handle scrolling as needed.</p>
          <div style="height: 100px; background-color: #e0f7fa; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
            Sample content block
          </div>
          <p style="margin-top: 16px;">When content exceeds the container height, scrolling is enabled automatically.</p>
        </vc-container>
      </div>
    `,
  }),
  args: {
    shadow: true,
    noPadding: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "This example shows how VcContainer can be used as part of a content panel design with a fixed header and scrollable content area.",
      },
    },
  },
};
