import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcImage } from "@ui/components/atoms/vc-image";

/**
 * `VcImage` is a versatile component for displaying images with various aspect ratios,
 * sizes, and style options like rounded corners and borders.
 */
const meta = {
  title: "Atoms/VcImage",
  component: VcImage,
  tags: ["autodocs"],
  args: {
    aspect: "1x1",
    rounded: false,
    bordered: false,
    clickable: false,
    src: "https://picsum.photos/600",
    size: "auto",
    background: "cover",
  },
  argTypes: {
    aspect: {
      description: "The aspect ratio of the image container",
      control: "select",
      options: ["1x1", "3x2", "4x3", "16x9"],
      table: {
        type: { summary: "'1x1' | '3x2' | '4x3' | '16x9'" },
        defaultValue: { summary: "'1x1'" },
      },
    },
    size: {
      description: "Predefined size of the image component",
      control: "select",
      options: ["auto", "xxs", "xs", "s", "m", "l", "xl", "xxl"],
      table: {
        type: { summary: "'auto' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'" },
        defaultValue: { summary: "'auto'" },
      },
    },
    background: {
      description: "Background image sizing method",
      control: "select",
      options: ["cover", "contain", "auto"],
      table: {
        type: { summary: "'cover' | 'contain' | 'auto'" },
        defaultValue: { summary: "'cover'" },
      },
    },
    src: {
      description: "Source URL of the image",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    rounded: {
      description: "Whether to display the image with rounded corners (circular if aspect is 1x1)",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    bordered: {
      description: "Whether to display a border around the image",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    clickable: {
      description: "Whether the image can be clicked, emitting a click event",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    emptyIcon: {
      description: "The icon to display when no src is provided",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "'material-image'" },
      },
    },
    onClick: {
      description: "Event emitted when clicking on an image with clickable=true",
      action: "clicked",
      table: {
        category: "Events",
        type: { summary: "() => void" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcImage component provides a flexible way to display images with consistent styling:

- Supports multiple aspect ratios (1:1, 16:9, 4:3, 3:2)
- Predefined sizes for consistent layout
- Optional styling like rounded corners and borders
- Background sizing options (cover, contain, auto)
- Placeholder icon for missing images
- Click handler for interactive images
`,
      },
    },
  },
} satisfies Meta<typeof VcImage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic image with default square aspect ratio.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcImage },
    setup() {
      return { args };
    },
    template: '<div style="width: 200px"><vc-image v-bind="args"></vc-image></div>',
  }),
};

/**
 * Image with a 16:9 aspect ratio, commonly used for video thumbnails.
 */
export const Widescreen: Story = {
  args: {
    aspect: "16x9",
    src: "https://picsum.photos/id/1018/800/450",
  },
  render: (args) => ({
    components: { VcImage },
    setup() {
      return { args };
    },
    template: '<div style="width: 300px"><vc-image v-bind="args"></vc-image></div>',
  }),
  parameters: {
    docs: {
      description: {
        story: "Using 16:9 aspect ratio, commonly used for video thumbnails or landscape imagery.",
      },
    },
  },
};

/**
 * Round profile image style.
 */
export const RoundProfile: Story = {
  args: {
    src: "https://picsum.photos/id/64/300/300",
    rounded: true,
    size: "xl",
  },
  render: (args) => ({
    components: { VcImage },
    setup() {
      return { args };
    },
    template: '<vc-image v-bind="args"></vc-image>',
  }),
  parameters: {
    docs: {
      description: {
        story: "Round image with border, commonly used for profile pictures.",
      },
    },
  },
};

/**
 * Small thumbnail image with border.
 */
export const Thumbnail: Story = {
  args: {
    size: "s",
    bordered: true,
    src: "https://picsum.photos/id/237/200/200",
  },
  render: (args) => ({
    components: { VcImage },
    setup() {
      return { args };
    },
    template: '<vc-image v-bind="args"></vc-image>',
  }),
  parameters: {
    docs: {
      description: {
        story: "Small bordered image thumbnail style.",
      },
    },
  },
};

/**
 * Clickable image that emits an event when clicked.
 */
export const Clickable: Story = {
  args: {
    clickable: true,
    src: "https://picsum.photos/id/42/300/300",
  },
  render: (args) => ({
    components: { VcImage },
    setup() {
      return { args };
    },
    template:
      '<div style="width: 200px"><vc-image v-bind="args" @click="() => console.log(\'Image clicked\')"></vc-image></div>',
  }),
  parameters: {
    docs: {
      description: {
        story: "Clickable image that shows a pointer cursor and emits a click event when clicked.",
      },
    },
  },
};

/**
 * Image with 'contain' background sizing to show the entire image.
 */
export const ContainMode: Story = {
  args: {
    background: "contain",
    aspect: "4x3",
    src: "https://picsum.photos/id/26/800/600",
  },
  render: (args) => ({
    components: { VcImage },
    setup() {
      return { args };
    },
    template: '<div style="width: 300px"><vc-image v-bind="args"></vc-image></div>',
  }),
  parameters: {
    docs: {
      description: {
        story: "Using 'contain' background mode ensures the entire image is visible, potentially with empty space.",
      },
    },
  },
};

/**
 * Placeholder displayed when no image source is provided.
 */
export const Placeholder: Story = {
  args: {
    src: "",
    size: "l",
  },
  render: (args) => ({
    components: { VcImage },
    setup() {
      return { args };
    },
    template: '<vc-image v-bind="args"></vc-image>',
  }),
  parameters: {
    docs: {
      description: {
        story: "When no source is provided, a placeholder icon is displayed.",
      },
    },
  },
};

/**
 * Grid showing all size variants.
 */
export const SizeVariants: Story = {
  render: (args) => ({
    components: { VcImage },
    setup() {
      const sizes = ["xxs", "xs", "s", "m", "l", "xl", "xxl"];
      return { args, sizes };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <h3 class="tw-text-lg tw-font-medium">Available Sizes</h3>
        <div class="tw-flex tw-items-end tw-gap-6">
          <div v-for="size in sizes" :key="size" class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <vc-image :src="args.src" :size="size" aspect="1x1" />
            <span class="tw-text-xs">{{size}}</span>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Comparison of all available predefined size variants from xxs to xxl.",
      },
    },
  },
};
