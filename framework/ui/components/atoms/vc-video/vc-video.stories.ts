import type { Meta, StoryObj } from "@storybook/vue3";
import { VcVideo } from "./";

/**
 * `VcVideo` - component for embedding video content with optional label and tooltip
 */
const meta = {
  title: "Atoms/VcVideo",
  component: VcVideo,
  tags: ["autodocs"],
  args: {
    source: "https://www.youtube.com/embed/PeXX-V-dwpA",
    label: "Video",
  },
  argTypes: {
    source: {
      description: "URL of the video to be embedded",
      control: "text",
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    label: {
      description: "Label displayed above the video",
      control: "text",
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    tooltip: {
      description: "Additional information shown in a tooltip",
      control: "text",
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcVideo component provides an embedded video player:

- Supports YouTube and other embed URLs
- Optional label and tooltip for additional information
- Responsive container that maintains aspect ratio
- Displays placeholder when no source is provided
        `,
      },
    },
    actions: {
      handles: ["click"],
    },
  },
} satisfies Meta<typeof VcVideo>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default video player with label
 */
export const Default: Story = {
  args: {
    source: "https://www.youtube.com/embed/PeXX-V-dwpA",
    label: "Introduction Video",
  },
  render: (args) => ({
    components: { VcVideo },
    setup() {
      return { args };
    },
    template: '<div style="max-width: 600px;"><vc-video v-bind="args" /></div>',
  }),
};

/**
 * Video player with label and tooltip
 */
export const WithTooltip: Story = {
  args: {
    source: "https://www.youtube.com/embed/PeXX-V-dwpA",
    label: "Product Overview",
    tooltip: "This video provides an overview of our product features and benefits",
  },
  render: (args) => ({
    components: { VcVideo },
    setup() {
      return { args };
    },
    template: '<div style="max-width: 600px;"><vc-video v-bind="args" /></div>',
  }),
};

/**
 * Video player without a label
 */
export const WithoutLabel: Story = {
  args: {
    source: "https://www.youtube.com/embed/PeXX-V-dwpA",
    label: undefined,
  },
  render: (args) => ({
    components: { VcVideo },
    setup() {
      return { args };
    },
    template: '<div style="max-width: 600px;"><vc-video v-bind="args" /></div>',
  }),
};

/**
 * Placeholder displayed when no source is provided
 */
export const Placeholder: Story = {
  args: {
    source: undefined,
    label: "Video Not Available",
  },
  render: (args) => ({
    components: { VcVideo },
    setup() {
      return { args };
    },
    template: '<div style="max-width: 600px; height: 300px;"><vc-video v-bind="args" /></div>',
  }),
};

/**
 * Different video source example
 */
export const AlternativeSource: Story = {
  args: {
    source: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    label: "Alternative Video Source",
  },
  render: (args) => ({
    components: { VcVideo },
    setup() {
      return { args };
    },
    template: '<div style="max-width: 600px;"><vc-video v-bind="args" /></div>',
  }),
};
