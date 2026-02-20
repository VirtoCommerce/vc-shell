import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcFileUpload } from "@ui/components/molecules/vc-file-upload";
import { ref } from "vue";

const VARIANT = ["gallery", "file-upload"];

/**
 * `VcFileUpload` is a component for uploading files with support for
 * drag-and-drop and browsing from file system.
 */
const meta = {
  title: "Molecules/VcFileUpload",
  component: VcFileUpload,
  tags: ["autodocs"],
  args: {
    variant: "gallery",
    loading: false,
    accept: ".jpg, .png, .jpeg, .webp, .heic, .svg",
    multiple: false,
    name: "fileUpload",
    icon: "material-cloud_upload",
  },
  argTypes: {
    variant: {
      description: "Display mode for the file upload component",
      control: "radio",
      options: VARIANT,
      table: {
        category: "Appearance",
        type: { summary: VARIANT.join(" | ") },
        defaultValue: { summary: "gallery" },
      },
    },
    onUpload: {
      description: "Event emitted when files are uploaded",
      table: {
        category: "Events",
        type: { summary: "(files: FileList) => void" },
      },
      action: "upload",
    },
    loading: {
      description: "Whether the file upload is in loading state",
      control: "boolean",
      table: {
        category: "State",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    accept: {
      description: "Allowed file types (e.g., '.jpg, .png, .pdf')",
      control: "text",
      table: {
        category: "Behavior",
        type: { summary: "string" },
        defaultValue: { summary: ".jpg, .png, .jpeg, .webp, .heic, .svg" },
      },
    },
    multiple: {
      description: "Allow uploading multiple files at once",
      control: "boolean",
      table: {
        category: "Behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    rules: {
      description: "Validation rules for file uploads",
      control: "object",
      table: {
        category: "Validation",
        type: { summary: "keyof IValidationRules | IValidationRules" },
        defaultValue: { summary: "undefined" },
      },
    },
    name: {
      description: "Name attribute for the input element",
      control: "text",
      table: {
        category: "Attributes",
        type: { summary: "string" },
        defaultValue: { summary: "Gallery" },
      },
    },
    icon: {
      description: "Icon to display in the upload area",
      control: "text",
      table: {
        category: "Appearance",
        type: { summary: "string" },
        defaultValue: { summary: "material-cloud_upload" },
      },
    },
    customText: {
      description: "Custom text for the component",
      control: "object",
      table: {
        category: "Appearance",
        type: { summary: "{ dragHere: string; browse: string }" },
        defaultValue: { summary: "undefined" },
      },
    },
    error: {
      description: "Slot for custom error message",
      table: {
        category: "Slots",
        type: { summary: "VNode | string" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcFileUpload component provides functionality for uploading files with the following features:

- Two display variants: gallery view (square) and standard file upload (full width)
- Support for drag and drop file uploads
- File type filtering through the accept property
- Multiple file upload support
- Custom validation rules
- Loading state with built-in indicator
- Customizable text and icons
- Error display via slot or validation

## Usage

\`\`\`vue
<template>
  <VcFileUpload
    variant="gallery"
    accept=".jpg, .png"
    :multiple="true"
    @upload="handleUpload"
  />
</template>

<script setup>
const handleUpload = (files) => {
  console.log('Files to upload:', files);
  // Process files, e.g., upload to server
}
</script>
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof VcFileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Gallery variant provides a square upload area, suitable for image uploads
 * and grid layouts.
 */
export const Gallery: Story = {
  args: {
    variant: "gallery",
  },
  render: (args) => ({
    components: { VcFileUpload },
    setup() {
      const handleUpload = (files: FileList) => {
        console.log(
          "Files uploaded:",
          Array.from(files).map((f) => f.name),
        );
      };

      return { args, handleUpload };
    },
    template: `
      <div class="tw-p-4">
        <VcFileUpload
          v-bind="args"
          @upload="handleUpload"
        />
      </div>
    `,
  }),
};

/**
 * File upload variant provides a wider upload area that spans the full width
 * of its container, suitable for form integrations.
 */
export const FileUpload: Story = {
  args: {
    variant: "file-upload",
  },
  render: (args) => ({
    components: { VcFileUpload },
    setup() {
      const handleUpload = (files: FileList) => {
        console.log(
          "Files uploaded:",
          Array.from(files).map((f) => f.name),
        );
      };

      return { args, handleUpload };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcFileUpload
          v-bind="args"
          @upload="handleUpload"
        />
      </div>
    `,
  }),
};

/**
 * The component supports a loading state, showing a spinner when files
 * are being processed or uploaded.
 */
export const Loading: Story = {
  args: {
    variant: "gallery",
    loading: true,
  },
  render: (args) => ({
    components: { VcFileUpload },
    setup() {
      const handleUpload = (files: FileList) => {
        console.log(
          "Files uploaded:",
          Array.from(files).map((f) => f.name),
        );
      };

      return { args, handleUpload };
    },
    template: `
      <div class="tw-p-4">
        <VcFileUpload
          v-bind="args"
          @upload="handleUpload"
        />
      </div>
    `,
  }),
};

/**
 * You can restrict the file types that can be uploaded using the accept property.
 * This example only accepts PDF and Word documents.
 */
export const RestrictedFileTypes: Story = {
  args: {
    variant: "file-upload",
    accept: ".pdf, .doc, .docx",
  },
  render: (args) => ({
    components: { VcFileUpload },
    setup() {
      const handleUpload = (files: FileList) => {
        console.log(
          "Files uploaded:",
          Array.from(files).map((f) => f.name),
        );
      };

      return { args, handleUpload };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <p class="tw-mb-2 tw-text-sm tw-text-gray-600">Only PDF and Word documents (.pdf, .doc, .docx) are accepted</p>
        <VcFileUpload
          v-bind="args"
          @upload="handleUpload"
        />
      </div>
    `,
  }),
};

/**
 * Enable multiple file selection by setting the multiple property to true.
 */
export const MultipleFiles: Story = {
  args: {
    variant: "file-upload",
    multiple: true,
  },
  render: (args) => ({
    components: { VcFileUpload },
    setup() {
      const uploadedFiles = ref<string[]>([]);

      const handleUpload = (files: FileList) => {
        uploadedFiles.value = Array.from(files).map((f) => f.name);
      };

      return { args, handleUpload, uploadedFiles };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <p class="tw-mb-2 tw-text-sm tw-text-gray-600">You can select multiple files at once</p>
        <VcFileUpload
          v-bind="args"
          @upload="handleUpload"
        />
        <div v-if="uploadedFiles.length" class="tw-mt-4">
          <h4 class="tw-text-sm tw-font-medium tw-mb-1">Uploaded files:</h4>
          <ul class="tw-text-sm tw-text-gray-600 tw-list-disc tw-pl-5">
            <li v-for="file in uploadedFiles" :key="file">{{ file }}</li>
          </ul>
        </div>
      </div>
    `,
  }),
};

/**
 * You can customize the text displayed in the upload area.
 */
export const CustomText: Story = {
  args: {
    variant: "gallery",
    customText: {
      dragHere: "Drop your files here",
      browse: "Select files",
    },
  },
  render: (args) => ({
    components: { VcFileUpload },
    setup() {
      const handleUpload = (files: FileList) => {
        console.log(
          "Files uploaded:",
          Array.from(files).map((f) => f.name),
        );
      };

      return { args, handleUpload };
    },
    template: `
      <div class="tw-p-4">
        <VcFileUpload
          v-bind="args"
          @upload="handleUpload"
        />
      </div>
    `,
  }),
};

/**
 * You can show error messages using the error slot.
 */
export const WithError: Story = {
  args: {
    variant: "file-upload",
  },
  render: (args) => ({
    components: { VcFileUpload },
    setup() {
      const errorMessage = ref("Files must be less than 5MB in size");
      const hasError = ref(true);

      const handleUpload = (files: FileList) => {
        console.log(
          "Files uploaded:",
          Array.from(files).map((f) => f.name),
        );
        // Simulate validation error
        hasError.value = true;
      };

      return { args, handleUpload, errorMessage, hasError };
    },
    template: `
      <div class="tw-p-4 tw-max-w-md">
        <VcFileUpload
          v-bind="args"
          @upload="handleUpload"
        >
          <template #error v-if="hasError">
            <div class="tw-text-red-500 tw-mt-2 tw-text-sm">
              <span class="tw-font-medium">Error:</span> {{ errorMessage }}
            </div>
          </template>
        </VcFileUpload>
      </div>
    `,
  }),
};

/**
 * You can customize the icon displayed in the upload area.
 */
export const CustomIcon: Story = {
  args: {
    variant: "gallery",
    icon: "bi-file-earmark-upload",
  },
  render: (args) => ({
    components: { VcFileUpload },
    setup() {
      const handleUpload = (files: FileList) => {
        console.log(
          "Files uploaded:",
          Array.from(files).map((f) => f.name),
        );
      };

      return { args, handleUpload };
    },
    template: `
      <div class="tw-p-4">
        <VcFileUpload
          v-bind="args"
          @upload="handleUpload"
        />
      </div>
    `,
  }),
};
