import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcImageTile } from "@ui/components/molecules/vc-image-tile";
import { VcIcon } from "@ui/components/atoms/vc-icon";

/**
 * `VcImageTile` is a reusable image tile with skeleton loading,
 * fade-in transition, and a slide-up action tray on hover/tap.
 *
 * Used internally by `VcGalleryItem` and `VcImageUpload`.
 */
const meta = {
  title: "Action/VcImageTile",
  component: VcImageTile,
  tags: ["autodocs"],
  args: {
    src: "https://picsum.photos/seed/tile-demo/400",
    alt: "Demo image",
    name: "photo.jpg",
    imageFit: "contain",
    actions: { preview: true },
  },
  argTypes: {
    src: {
      description: "Image source URL",
      control: "text",
      table: { category: "Content", type: { summary: "string" } },
    },
    alt: {
      description: "Image alt text for accessibility",
      control: "text",
      table: { category: "Content", type: { summary: "string" } },
    },
    name: {
      description: "File name displayed in the tray",
      control: "text",
      table: { category: "Content", type: { summary: "string" } },
    },
    imageFit: {
      description: "How the image fits within the tile",
      control: "radio",
      options: ["contain", "cover"],
      table: {
        category: "Appearance",
        type: { summary: '"contain" | "cover"' },
        defaultValue: { summary: "contain" },
      },
    },
    actions: {
      description: "Which built-in action buttons to show in the tray",
      control: "object",
      table: {
        category: "Behavior",
        type: { summary: "{ preview?: boolean; edit?: boolean; remove?: boolean }" },
      },
    },
    onPreview: {
      description: "Emitted when preview button is clicked",
      table: { category: "Events", type: { summary: "() => void" } },
      action: "preview",
    },
    onEdit: {
      description: "Emitted when edit button is clicked",
      table: { category: "Events", type: { summary: "() => void" } },
      action: "edit",
    },
    onRemove: {
      description: "Emitted when remove button is clicked",
      table: { category: "Events", type: { summary: "() => void" } },
      action: "remove",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
A square image tile molecule that provides:

- **Skeleton shimmer** while the image loads
- **Fade-in** transition once loaded
- **Slide-up tray** on hover (desktop) or tap (touch devices) with:
  - Built-in action buttons (preview, edit, remove) via \`actions\` prop
  - \`#actions\` slot for additional custom buttons
  - File name display
- **\`#overlay\`** slot for additional elements (e.g. drag handles)

## Usage

\`\`\`vue
<VcImageTile
  src="/img.jpg"
  name="photo.jpg"
  :actions="{ preview: true, edit: true, remove: true }"
  @preview="onPreview"
  @edit="onEdit"
  @remove="onRemove"
/>
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof VcImageTile>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic tile with preview action only (default).
 * Hover to see the slide-up tray.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcImageTile },
    setup: () => ({ args }),
    template: `
      <div class="tw-p-4" style="width: 160px;">
        <VcImageTile v-bind="args" />
      </div>
    `,
  }),
};

/**
 * All three built-in actions: preview, edit, remove.
 */
export const AllActions: Story = {
  args: {
    actions: { preview: true, edit: true, remove: true },
  },
  render: (args) => ({
    components: { VcImageTile },
    setup: () => ({ args }),
    template: `
      <div class="tw-p-4" style="width: 160px;">
        <VcImageTile v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Using `cover` fit to fill the tile entirely (useful for photos).
 */
export const CoverFit: Story = {
  args: {
    imageFit: "cover",
    src: "https://picsum.photos/seed/cover-demo/400/600",
    name: "landscape.jpg",
    actions: { preview: true, remove: true },
  },
  render: (args) => ({
    components: { VcImageTile },
    setup: () => ({ args }),
    template: `
      <div class="tw-p-4" style="width: 160px;">
        <VcImageTile v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Tile with an overlay slot — for example, a drag handle.
 */
export const WithOverlay: Story = {
  args: {
    actions: { preview: true, edit: true, remove: true },
  },
  render: (args) => ({
    components: { VcImageTile, VcIcon },
    setup: () => ({ args }),
    template: `
      <div class="tw-p-4" style="width: 160px;">
        <VcImageTile v-bind="args">
          <template #overlay>
            <div class="tw-absolute tw-top-1 tw-left-1 tw-p-0.5 tw-rounded tw-cursor-move" style="color: var(--secondary-400);">
              <VcIcon icon="lucide-grip-vertical" size="s" />
            </div>
          </template>
        </VcImageTile>
      </div>
    `,
  }),
};

/**
 * Tile without a name — tray only shows action buttons.
 */
export const NoName: Story = {
  args: {
    name: undefined,
    actions: { preview: true, remove: true },
  },
  render: (args) => ({
    components: { VcImageTile },
    setup: () => ({ args }),
    template: `
      <div class="tw-p-4" style="width: 160px;">
        <VcImageTile v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Multiple tiles in a grid — typical gallery layout.
 */
export const Grid: Story = {
  args: {
    actions: { preview: true, remove: true },
  },
  render: (args) => ({
    components: { VcImageTile },
    setup() {
      const images = [
        { src: "https://picsum.photos/seed/mountain/400", name: "mountain.jpg" },
        { src: "https://picsum.photos/seed/ocean/400", name: "ocean.jpg" },
        { src: "https://picsum.photos/seed/forest/400", name: "forest.jpg" },
        { src: "https://picsum.photos/seed/city/400", name: "city.jpg" },
        { src: "https://picsum.photos/seed/desert/400", name: "desert.jpg" },
        { src: "https://picsum.photos/seed/lake/400", name: "lake.jpg" },
      ];
      return { args, images };
    },
    template: `
      <div class="tw-p-4 tw-grid tw-gap-2" style="grid-template-columns: repeat(3, 140px);">
        <VcImageTile
          v-for="img in images"
          :key="img.name"
          :src="img.src"
          :name="img.name"
          :image-fit="args.imageFit"
          :actions="args.actions"
        />
      </div>
    `,
  }),
};

/**
 * Skeleton state when no `src` is provided — shows shimmer animation.
 */
export const Skeleton: Story = {
  args: {
    src: undefined,
    name: "loading...",
  },
  render: (args) => ({
    components: { VcImageTile },
    setup: () => ({ args }),
    template: `
      <div class="tw-p-4" style="width: 160px;">
        <VcImageTile v-bind="args" />
      </div>
    `,
  }),
};
