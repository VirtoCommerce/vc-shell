import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    id: "Video",
    titleTemplate: "Video details",
    localizationPrefix: "Videos",
    composable: "useVideoDetails",
    component: "DynamicBladeForm",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "Save",
        method: "saveChanges",
      },
      {
        id: "delete",
        icon: "fas fa-trash",
        title: "Delete",
        method: "remove",
      },
    ],
  },
  content: [
    {
      id: "videoForm",
      component: "vc-form",
      children: [
        {
          id: "videoUrl",
          component: "vc-input",
          label: "Video Url",
          property: "videoUrlHandler",
          placeholder: "Enter video Url",
          update: {
            method: "validateUrl",
          },
          rules: {
            min: 1,
          },
          visibility: {
            method: "needShowUrl",
          },
          append: {
            id: "addVideoButton",
            component: "vc-button",
            method: "createVideo",
            content: "Preview",
            disabled: {
              method: "previewDisabled",
            },
          },
        },
        {
          id: "videoThumbnailFieldset",
          component: "vc-fieldset",
          columns: 2,
          aspectRatio: [1, 2],
          visibility: {
            method: "needShowFields",
          },
          fields: [
            {
              id: "thumbnail",
              component: "vc-image",
              property: "thumbnailUrl",
              size: "xl",
              background: "contain",
              bordered: true,
            },
            {
              id: "videoLinksFieldset",
              component: "vc-fieldset",
              fields: [
                {
                  id: "uploadDate",
                  component: "vc-field",
                  label: "Created date",
                  property: "uploadDate",
                  variant: "date-ago",
                },
                {
                  id: "contentUrl",
                  component: "vc-field",
                  label: "Video Url",
                  property: "contentUrl",
                  variant: "link",
                  copyable: true,
                },
                {
                  id: "embeddedUrl",
                  component: "vc-field",
                  label: "Embedded Url",
                  property: "embedUrl",
                  variant: "link",
                  copyable: true,
                },
                {
                  id: "thumbnailUrl",
                  component: "vc-field",
                  label: "Thumbnail Url",
                  property: "thumbnailUrl",
                  variant: "link",
                  copyable: true,
                },
              ],
            },
          ],
        },
        {
          id: "name",
          component: "vc-input",
          label: "Name",
          property: "name",
          placeholder: "Enter video name",
          visibility: {
            method: "needShowFields",
          },
          disabled: {
            method: "videoDisabled",
          },
        },
        {
          id: "description",
          component: "vc-input",
          label: "Description",
          property: "description",
          placeholder: "Enter video description",
          visibility: {
            method: "needShowFields",
          },
          disabled: {
            method: "videoDisabled",
          },
        },
        {
          id: "preview",
          component: "vc-video",
          label: "Preview",
          property: "embedUrl",
          visibility: {
            method: "needShowFields",
          },
        },
      ],
    },
  ],
};
