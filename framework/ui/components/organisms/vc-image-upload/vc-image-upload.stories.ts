import { ref } from "vue";
import type { Meta, StoryFn, StoryObj } from "@storybook/vue3-vite";
import { VcImageUpload } from "@ui/components/organisms/vc-image-upload";
import type { ICommonAsset } from "@core/types";

/**
 * **VcImageUpload** is a single-image upload organism that combines
 * a drag-and-drop upload zone with an image tile preview.
 *
 * It supports file-type restrictions, validation rules, preview lightbox,
 * and removable image actions.
 */
export default {
  title: "organisms/VcImageUpload",
  component: VcImageUpload,
  tags: ["autodocs"],
  argTypes: {
    image: {
      description: "The currently displayed image asset object.",
      table: { category: "Data" },
    },
    disabled: {
      description: "Disables upload and remove actions. Shows empty hint when no image is set.",
      table: { category: "State" },
    },
    loading: {
      description: "Shows a loading indicator on the upload zone.",
      table: { category: "State" },
    },
    accept: {
      description: "Comma-separated list of accepted file extensions.",
      table: { category: "Config", defaultValue: { summary: ".jpg,.png,.jpeg,.webp,.heic,.svg" } },
    },
    rules: {
      description: "Validation rules applied to the uploaded file (e.g. `{ fileWeight: 300 }`).",
      table: { category: "Validation" },
    },
    name: {
      description: "Field name used for validation messages.",
      table: { category: "Config", defaultValue: { summary: "Image" } },
    },
    icon: {
      description: "Icon displayed in the upload zone placeholder.",
      table: { category: "Appearance", defaultValue: { summary: "lucide-cloud-upload" } },
    },
    placeholder: {
      description: "Custom placeholder text and link label for the upload zone.",
      table: { category: "Appearance" },
    },
    previewable: {
      description: "Whether clicking the image opens a lightbox preview.",
      table: { category: "Behavior", defaultValue: { summary: "true" } },
    },
    removable: {
      description: "Whether the remove action is available on the image tile.",
      table: { category: "Behavior", defaultValue: { summary: "true" } },
    },
    onUpload: {
      description: "Emitted when files are selected or dropped.",
      table: { category: "Events" },
      action: "upload",
    },
    onRemove: {
      description: "Emitted when the remove action is triggered on the current image.",
      table: { category: "Events" },
      action: "remove",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A single-image upload component that displays either an upload dropzone or an image tile with preview/remove actions. " +
          "For multi-image uploads, use **VcGallery** instead.",
      },
    },
  },
} satisfies Meta<typeof VcImageUpload>;

const Template: StoryFn = (args) => ({
  components: { VcImageUpload },
  setup: () => ({ args }),
  template: '<div class="tw-p-4 tw-max-w-md"><VcImageUpload v-bind="args" /></div>',
});

export const Empty = Template.bind({});
Empty.args = {};

export const WithImage = Template.bind({});
WithImage.args = {
  image: {
    name: "avatar.jpg",
    url: "https://picsum.photos/seed/avatar/200",
    readableSize: "45 KB",
    id: "1",
  },
};

export const Disabled = Template.bind({});
Disabled.args = {
  image: {
    name: "logo.png",
    url: "https://picsum.photos/seed/logo/200",
    id: "1",
  },
  disabled: true,
};

export const CustomPlaceholder = Template.bind({});
CustomPlaceholder.args = {
  placeholder: { text: "Drag your photo here", link: "or click to browse" },
  icon: "lucide-camera",
};

export const WithValidation = Template.bind({});
WithValidation.args = {
  rules: { fileWeight: 300 },
};

// --- Additional stories ---

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
};

export const NotRemovable = Template.bind({});
NotRemovable.args = {
  image: {
    name: "locked-photo.jpg",
    url: "https://picsum.photos/seed/locked/200",
    readableSize: "120 KB",
    id: "2",
  },
  removable: false,
};

export const NotPreviewable = Template.bind({});
NotPreviewable.args = {
  image: {
    name: "thumbnail.png",
    url: "https://picsum.photos/seed/thumb/200",
    readableSize: "30 KB",
    id: "3",
  },
  previewable: false,
};

export const CustomAccept = Template.bind({});
CustomAccept.args = {
  accept: ".pdf,.doc,.docx",
  placeholder: { text: "Drop your document here", link: "or click to browse" },
  icon: "lucide-file-text",
};

export const DisabledEmpty = Template.bind({});
DisabledEmpty.args = {
  disabled: true,
};

export const Interactive: StoryObj = {
  render: (args) => ({
    components: { VcImageUpload },
    setup() {
      const currentImage = ref<ICommonAsset | undefined>(undefined);

      const sampleImage: ICommonAsset = {
        name: "sample.jpg",
        url: "https://picsum.photos/seed/interactive/200",
        readableSize: "80 KB",
        id: "42",
      };

      const onUpload = () => {
        currentImage.value = sampleImage;
      };

      const onRemove = () => {
        currentImage.value = undefined;
      };

      return { args, currentImage, onUpload, onRemove };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcImageUpload
          v-bind="args"
          :image="currentImage"
          @upload="onUpload"
          @remove="onRemove"
        />
        <p class="tw-mt-2 tw-text-xs tw-text-gray-500">
          Upload simulates adding a sample image. Remove clears it.
        </p>
      </div>
    `,
  }),
  args: {},
};
