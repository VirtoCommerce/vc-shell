import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    id: "Videos",
    titleTemplate: "VIDEOS.PAGES.LIST.TITLE",
    localizationPrefix: "Videos",
    isWorkspace: true,
    composable: "useVideosList",
    component: "DynamicBladeList",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "VIDEOS.PAGES.LIST.TOOLBAR.SAVE",
        method: "save",
      },
      {
        id: "add",
        icon: "fas fa-plus",
        title: "VIDEOS.PAGES.LIST.TOOLBAR.ADD",
        method: "openAddBlade",
      },
      {
        id: "deleteSelected",
        icon: "fas fa-trash",
        title: "VIDEOS.PAGES.LIST.TOOLBAR.DELETE",
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
      },
      columns: [
        {
          id: "thumbnailUrl",
          title: "VIDEOS.PAGES.LIST.TABLE.HEADER.THUMBNAIL",
          type: "image",
          alwaysVisible: true,
        },
        {
          id: "name",
          title: "VIDEOS.PAGES.LIST.TABLE.HEADER.NAME",
          sortable: true,
          alwaysVisible: true,
          customTemplate: {
            component: "GridName",
          },
        },
        {
          id: "uploadDate",
          title: "VIDEOS.PAGES.LIST.TABLE.HEADER.UPLOAD_DATE",
          sortable: true,
          type: "date-ago",
        },
        {
          id: "sortOrder",
          title: "VIDEOS.PAGES.LIST.TABLE.HEADER.SORT_ORDER",
          sortable: true,
          type: "number",
        },
      ],
    },
  ],
};
