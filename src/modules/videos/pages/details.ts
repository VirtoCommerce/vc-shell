import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    id: "Video",
    localizationPrefix: "Videos",
    composable: "useVideoDetails",
    component: "DynamicBladeForm",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "VIDEOS.PAGES.DETAILS.TOOLBAR.SAVE",
        method: "saveChanges",
      },
      {
        id: "delete",
        icon: "fas fa-trash",
        title: "VIDEOS.PAGES.DETAILS.TOOLBAR.DELETE",
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
          label: "VIDEOS.PAGES.DETAILS.FIELDS.ADD.TITLE",
          property: "videoUrlHandler",
          placeholder: "VIDEOS.PAGES.DETAILS.FIELDS.ADD.PLACEHOLDER",
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
            content: "VIDEOS.PAGES.DETAILS.FIELDS.ADD.ADD_BUTTON",
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
                  label: "VIDEOS.PAGES.DETAILS.FIELDS.CREATED_DATE.TITLE",
                  property: "uploadDate",
                  variant: "date-ago",
                },
                {
                  id: "contentUrl",
                  component: "vc-field",
                  label: "VIDEOS.PAGES.DETAILS.FIELDS.CONTENT_URL.TITLE",
                  property: "contentUrl",
                  variant: "link",
                  copyable: true,
                },
                {
                  id: "embeddedUrl",
                  component: "vc-field",
                  label: "VIDEOS.PAGES.DETAILS.FIELDS.EMBED_URL.TITLE",
                  property: "embedUrl",
                  variant: "link",
                  copyable: true,
                },
                {
                  id: "thumbnailUrl",
                  component: "vc-field",
                  label: "VIDEOS.PAGES.DETAILS.FIELDS.THUMBNAIL_URL.TITLE",
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
          label: "VIDEOS.PAGES.DETAILS.FIELDS.NAME.TITLE",
          property: "name",
          placeholder: "VIDEOS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER",
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
          label: "VIDEOS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE",
          property: "description",
          placeholder: "VIDEOS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER",
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
          label: "VIDEOS.PAGES.DETAILS.FIELDS.PREVIEW.TITLE",
          property: "embedUrl",
          visibility: {
            method: "needShowFields",
          },
        },
      ],
    },
  ],
};
