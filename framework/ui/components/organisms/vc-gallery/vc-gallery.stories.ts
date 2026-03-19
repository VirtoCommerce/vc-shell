import { ref } from "vue";
import type { Meta, StoryFn } from "@storybook/vue3-vite";
import { VcGallery } from "@ui/components/organisms/vc-gallery";
import { VcPopupContainer } from "@shell/_internal/popup";
import type { ICommonAsset } from "@core/types";

const sampleImages: ICommonAsset[] = [
  { title: "Mountain", name: "mountain.jpg", url: "https://picsum.photos/seed/mountain/400", sortOrder: 0, id: "1" },
  { title: "Ocean", name: "ocean.jpg", url: "https://picsum.photos/seed/ocean/400", sortOrder: 1, id: "2" },
  { title: "Forest", name: "forest.jpg", url: "https://picsum.photos/seed/forest/400", sortOrder: 2, id: "3" },
  { title: "City", name: "city-skyline.jpg", url: "https://picsum.photos/seed/city/400", sortOrder: 3, id: "4" },
  { title: "Desert", name: "desert.jpg", url: "https://picsum.photos/seed/desert/400", sortOrder: 4, id: "5" },
];

/**
 * **VcGallery** is a multi-image gallery organism with drag-and-drop reorder,
 * file upload, lightbox preview, and per-image edit/remove actions.
 *
 * It supports responsive grid layout with configurable tile size,
 * gap spacing, and image fit mode.
 */
export default {
  title: "Data Display/VcGallery",
  component: VcGallery,
  tags: ["autodocs"],
  args: {
    size: "md",
    gap: 8,
    imagefit: "contain",
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Tile size preset controlling min/max grid column widths.",
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    imagefit: {
      control: "radio",
      options: ["contain", "cover"],
      description: "How images fit within their tile — `contain` preserves aspect ratio, `cover` fills the tile.",
      table: { category: "Appearance", defaultValue: { summary: "contain" } },
    },
    gap: {
      control: { type: "range", min: 0, max: 24, step: 4 },
      description: "Gap between gallery tiles in pixels.",
      table: { category: "Appearance", defaultValue: { summary: "8" } },
    },
    images: {
      description: "Array of image assets to display.",
      table: { category: "Data" },
    },
    disabled: {
      description: "Disables upload, remove, edit, and reorder actions.",
      table: { category: "State" },
    },
    multiple: {
      description: "Allow multiple files to be selected in the upload dialog.",
      table: { category: "Config" },
    },
    loading: {
      description: "Shows a loading indicator on the upload zone.",
      table: { category: "State" },
    },
    itemActions: {
      description: "Object controlling which actions appear on each image tile: `{ preview, edit, remove }`.",
      table: { category: "Behavior", defaultValue: { summary: "{ preview: true, edit: true, remove: true }" } },
    },
    rules: {
      description: "Validation rules applied to uploaded files.",
      table: { category: "Validation" },
    },
    name: {
      description: "Field name used for validation messages.",
      table: { category: "Config", defaultValue: { summary: "Gallery" } },
    },
    accept: {
      description: "Comma-separated list of accepted file extensions.",
      table: { category: "Config" },
    },
    onUpload: {
      description: "Emitted when files are selected or dropped.",
      table: { category: "Events" },
      action: "upload",
    },
    onSort: {
      description: "Emitted after drag-and-drop reorder with the new sorted array.",
      table: { category: "Events" },
      action: "sort",
    },
    onEdit: {
      description: "Emitted when the edit action is triggered on an image tile.",
      table: { category: "Events" },
      action: "edit",
    },
    onRemove: {
      description: "Emitted when the remove action is triggered on an image tile.",
      table: { category: "Events" },
      action: "remove",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A responsive image gallery with drag-and-drop reorder, file upload zone, " +
          "and per-image actions (preview, edit, remove). Supports configurable tile sizes, " +
          "image fit modes, and external file drop. For single-image upload, use **VcImageUpload** instead.",
      },
    },
  },
} satisfies Meta<typeof VcGallery>;

const Template: StoryFn = (args) => ({
  components: { VcGallery, VcPopupContainer },
  setup() {
    const images = ref<ICommonAsset[]>([...sampleImages]);
    const onSort = (sorted: ICommonAsset[]) => {
      images.value = sorted;
    };
    const onRemove = (image: ICommonAsset) => {
      images.value = images.value.filter((img) => img.id !== image.id);
    };
    return { args, images, onSort, onRemove };
  },
  template: `
    <div class="tw-p-4" style="max-width: 800px;">
      <VcGallery
        v-bind="args"
        :images="images"
        @sort="onSort"
        @remove="onRemove"
      />
      <VcPopupContainer />
    </div>
  `,
});

export const Default = Template.bind({});

export const SmallTiles = Template.bind({});
SmallTiles.args = { size: "sm" };

export const LargeTiles = Template.bind({});
LargeTiles.args = { size: "lg" };

export const CoverFit = Template.bind({});
CoverFit.args = { imagefit: "cover" };

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };

export const Empty: StoryFn = (args) => ({
  components: { VcGallery },
  setup: () => ({ args }),
  template: '<div class="tw-p-4" style="max-width: 800px;"><VcGallery v-bind="args" :images="[]" /></div>',
});

export const SingleImage = Template.bind({});
SingleImage.args = {};
SingleImage.decorators = [
  () => ({
    components: { VcGallery, VcPopupContainer },
    setup() {
      const images = ref<ICommonAsset[]>([sampleImages[0]]);
      return { images };
    },
    template: `
      <div class="tw-p-4" style="max-width: 800px;">
        <VcGallery :images="images" />
        <VcPopupContainer />
      </div>
    `,
  }),
];

export const Loading = Template.bind({});
Loading.args = { loading: true };

export const LimitedActions = Template.bind({});
LimitedActions.args = {
  itemActions: { preview: true, edit: false, remove: true },
};

// --- Additional stories ---

const manyImages: ICommonAsset[] = Array.from({ length: 24 }, (_, i) => ({
  title: `Photo ${i + 1}`,
  name: `photo-${i + 1}.jpg`,
  url: `https://picsum.photos/seed/gallery${i}/400`,
  sortOrder: i,
  id: String(i + 100),
}));

export const ManyImages: StoryFn = (args) => ({
  components: { VcGallery, VcPopupContainer },
  setup() {
    const images = ref<ICommonAsset[]>([...manyImages]);
    const onSort = (sorted: ICommonAsset[]) => {
      images.value = sorted;
    };
    const onRemove = (image: ICommonAsset) => {
      images.value = images.value.filter((img) => img.id !== image.id);
    };
    return { args, images, onSort, onRemove };
  },
  template: `
    <div class="tw-p-4" style="max-width: 800px;">
      <VcGallery
        v-bind="args"
        :images="images"
        @sort="onSort"
        @remove="onRemove"
      />
      <VcPopupContainer />
    </div>
  `,
});
ManyImages.args = { size: "sm", imagefit: "cover" };

export const TightGrid: StoryFn = (args) => ({
  components: { VcGallery, VcPopupContainer },
  setup() {
    const images = ref<ICommonAsset[]>([...sampleImages]);
    const onSort = (sorted: ICommonAsset[]) => {
      images.value = sorted;
    };
    return { args, images, onSort };
  },
  template: `
    <div class="tw-p-4" style="max-width: 800px;">
      <VcGallery
        v-bind="args"
        :images="images"
        @sort="onSort"
      />
      <VcPopupContainer />
    </div>
  `,
});
TightGrid.args = { gap: 0, size: "sm", imagefit: "cover" };
