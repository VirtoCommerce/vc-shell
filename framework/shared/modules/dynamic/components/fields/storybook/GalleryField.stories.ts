import { computed, reactive, ref } from "vue";
import { template, templateWithVisibilityToggle } from "./common/templates";
import page from "./pages/DynamicRender";
import { Meta, StoryFn } from "@storybook/vue3";
import { ICommonAsset } from "../../../../../..";
import * as _ from "lodash-es";
import { SchemaBaseArgTypes } from "./common/args";
import { GallerySchema } from "../../..";

export default {
  title: "DynamicViews/molecules/VcGallery",
  component: page,
  args: {
    id: "GalleryFieldId",
    component: "vc-gallery",
    property: "mockedImages",
  },
  argTypes: {
    ..._.omit(SchemaBaseArgTypes, ["placeholder", "multilanguage", "update", "horizontalSeparator"]),
    component: {
      description: "Component type.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-gallery",
        },
        defaultValue: {
          summary: "vc-gallery",
        },
      },
    },
    variant: {
      description: "Gallery type.",
      control: "radio",
      options: ["gallery", "file-upload"],
      table: {
        type: {
          summary: "gallery | file-upload",
        },
        defaultValue: {
          summary: "gallery",
        },
      },
    },
    multiple: {
      description: "Whether the gallery has multiple files upload or not.",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
    actions: {
      description: "Gallery item button actions on hover.",
      control: "object",
      table: {
        type: {
          summary: `{
            preview: boolean;
            edit: boolean;
            remove: boolean;
          }`,
        },
        defaultValue: {
          summary: `{ preview: true, edit: true, remove: true }`,
        },
      },
    },
    hideAfterUpload: {
      description: "Whether the upload is hides after upload or not.",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: "none",
      },
    },
  },
} satisfies Meta<GallerySchema>;

const images = ref<ICommonAsset[]>([
  {
    id: "1",
    url: "https://picsum.photos/200",
  },
  {
    id: "2",
    url: "https://picsum.photos/200",
  },
  {
    id: "3",
    url: "https://picsum.photos/200",
  },
]);

const assetsHandler = {
  images: {
    upload: (files: FileList) => {
      const uploadedImages = ref<ICommonAsset[]>([]);
      for (let i = 0; i < files.length; i++) {
        uploadedImages.value.push({
          id: Math.random().toString(36).substring(7),
          url: URL.createObjectURL(files[i]),
        });
      }

      return uploadedImages.value;
    },
    remove: (files: ICommonAsset[]) => images.value.filter((image) => !files.includes(image)),
    edit: (files: ICommonAsset[]) => files,
  },
};

export const Template: StoryFn<GallerySchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        mockedImages: images,
      },
      scope: {
        assetsHandler,
      },
    });

    return { args, context };
  },
  template,
});

export const Label = Template.bind({});
Label.args = {
  label: "Gallery label",
};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  label: "Gallery label",
  tooltip: "Gallery tooltip",
};

export const WithDisabled: StoryFn<GallerySchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        mockedImages: images,
      },
      scope: {
        assetsHandler: {
          images: {},
        },
        disabledFn: computed(() => true),
      },
    });
    return { args, context };
  },
  template,
});
WithDisabled.args = {
  label: "Gallery label",
  disabled: { method: "disabledFn" },
};

export const WithVisibilityMethod: StoryFn<GallerySchema> = (args) => ({
  components: { page },
  setup: () => {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        mockedImages: images,
      },
      scope: {
        assetsHandler: {
          images: {},
        },
        visibilityFn: isVisible,
      },
    });
    return { args, context, toggle };
  },
  template: templateWithVisibilityToggle,
});
WithVisibilityMethod.args = {
  label: "Gallery label",
  visibility: { method: "visibilityFn" },
};

export const FileUpload: StoryFn<GallerySchema> = (args) => ({
  components: { page },
  setup: () => {
    const image = ref([]);
    const context = reactive({
      item: {
        mockedImages: image,
      },
      scope: {
        assetsHandler,
      },
    });

    return { args, context };
  },
  template,
});
FileUpload.storyName = "Single file upload with hide after upload";
FileUpload.args = {
  variant: "file-upload",
  hideAfterUpload: true,
};

export const WithoutItemActions = Template.bind({});
WithoutItemActions.args = {
  label: "Gallery label",
  actions: {
    preview: false,
    edit: false,
    remove: false,
  },
};
