import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    url: "/videos",
    id: "Videos",
    titleTemplate: "Videos",
    localizationPrefix: "Videos",
    isWorkspace: true,
    composable: "useVideosList",
    component: "DynamicBladeList",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "Save",
        method: "save",
      },
      {
        id: "add",
        icon: "fas fa-plus",
        title: "Add",
        method: "openAddBlade",
      },
      {
        id: "deleteSelected",
        icon: "fas fa-trash",
        title: "Delete selected",
        method: "removeItems",
      },
    ],
  },
  content: [
    {
      id: "videosGrid",
      component: "vc-table",
      multiselect: true,
      reorderableRows: true,
      mobileTemplate: {
        component: "VideosMobileGridView",
      },
      notFoundTemplate: {
        component: "VideosNotFoundGridTemplate",
      },
      emptyTemplate: {
        component: "VideosEmptyGridTemplate",
        context: {
          opt: {
            catalogProductId: "ARRRR!",
          },
        },
      },
      columns: [
        {
          id: "thumbnailUrl",
          title: "Thumbnail",
          type: "image",
          alwaysVisible: true,
        },
        {
          id: "name",
          title: "Name",
          sortable: true,
          alwaysVisible: true,
          customTemplate: {
            component: "GridName",
          },
        },
        {
          id: "uploadDate",
          title: "Upload date",
          sortable: true,
          type: "date-ago",
        },
        {
          id: "sortOrder",
          title: "Sort order",
          sortable: true,
          type: "number",
        },
      ],
    },
  ],
};
