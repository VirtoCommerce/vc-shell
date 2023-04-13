import type { Meta, StoryObj } from "@storybook/vue3";
import { VcGallery } from "./";
import VcGalleryItem from "./_internal/vc-gallery-item/vc-gallery-item.vue";
import VcGalleryPreview from "./_internal/vc-gallery-preview/vc-gallery-preview.vue";
import { VcLabel, VcFileUpload, VcHint } from "./../../";

const meta: Meta<typeof VcGallery> = {
  title: "organisms/VcGallery",
  component: VcGallery,
};

export default meta;
type Story = StoryObj<typeof VcGallery>;

export const Primary: Story = {
  render: (args) => ({
    components: {
      VcGallery,
      VcGalleryItem,
      VcGalleryPreview,
      VcLabel,
      VcFileUpload,
      VcHint,
    },
    setup() {
      return { args };
    },
    template: '<div class="tw-flex tw-h-[400px] tw-overflow-hidden"><vc-gallery v-bind="args"></vc-gallery></div>',
  }),
  args: {
    images: [
      {
        title: "Title",
        name: "Name",
        url: "https://placekitten.com/800/600",
        sortOrder: 0,
      },
      {
        title: "Title",
        name: "Name",
        url: "https://placekitten.com/800/600",
        sortOrder: 1,
      },
    ],
    variant: "gallery",
  },
};
