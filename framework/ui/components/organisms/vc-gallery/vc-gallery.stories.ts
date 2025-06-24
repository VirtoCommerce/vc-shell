import type { Meta, StoryFn } from "@storybook/vue3";
import { VcGallery } from "./";
import VcGalleryItem from "./_internal/vc-gallery-item/vc-gallery-item.vue";
import VcGalleryPreview from "./_internal/vc-gallery-preview/vc-gallery-preview.vue";
import { VcLabel, VcFileUpload, VcHint } from "./../../";

export default {
  title: "organisms/VcGallery",
  component: VcGallery,
  args: {
    images: [
      {
        title: "Title",
        name: "Name",
        url: "https://picsum.photos/200",
        sortOrder: 0,
      },
      {
        title: "Title",
        name: "Name",
        url: "https://picsum.photos/200",
        sortOrder: 1,
      },
    ],
    variant: "gallery",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["gallery", "file-upload"],
    },
  },
} satisfies Meta<typeof VcGallery>;

export const Primary: StoryFn = (args) => ({
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
});

export const Label = Primary.bind({});
Label.args = {
  label: "Gallery",
};

export const Disabled = Primary.bind({});
Disabled.args = {
  disabled: true,
};

export const Required = Primary.bind({});
Required.args = {
  label: "Gallery",
  required: true,
};

export const Tooltip = Primary.bind({});
Tooltip.args = {
  label: "Gallery",
  tooltip: "Tooltip",
};

export const FileUploading = Primary.bind({});
FileUploading.args = {
  label: "Gallery",
  loading: true,
};

export const SingleFileUpload = Primary.bind({});
SingleFileUpload.args = {
  label: "Gallery",
  images: [],
  variant: "file-upload",
};

export const SingleFileUploadWithCustomUploadIcon = Primary.bind({});
SingleFileUploadWithCustomUploadIcon.args = {
  label: "Gallery",
  images: [],
  variant: "file-upload",
  uploadIcon: "material-account_circle",
};
