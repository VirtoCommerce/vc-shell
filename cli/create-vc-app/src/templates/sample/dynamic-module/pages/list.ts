import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    url: "/sample-list",
    id: "SampleList",
    titleTemplate: "Sample list",
    localizationPrefix: "SAMPLE_APP",
    isWorkspace: true,
    composable: "useList",
    component: "DynamicBladeList",
    toolbar: [
      {
        id: "refresh",
        icon: "fas fa-sync-alt",
        title: "SAMPLE_APP.PAGES.LIST.TOOLBAR.REFRESH",
        method: "refresh",
      },
      {
        id: "remove",
        icon: "fas fa-trash",
        title: "SAMPLE_APP.PAGES.LIST.TOOLBAR.REMOVE",
        method: "removeItems",
      },
    ],
    menuItem: {
      title: "SAMPLE_APP.MENU.TITLE",
      icon: "fas fa-file-alt",
      priority: 1,
    },
  },
  content: [
    {
      id: "itemsGrid",
      component: "vc-table",
      multiselect: true,
      actions: [
        {
          id: "delete",
          icon: "fas fa-trash",
          title: "SAMPLE_APP.PAGES.LIST.TABLE.ACTIONS.DELETE",
          method: "removeItems",
          position: "left",
          type: "danger",
        },
      ],
      columns: [
        {
          id: "imgSrc",
          title: "SAMPLE_APP.PAGES.LIST.TABLE.HEADER.IMAGE",
          type: "image",
          width: "70px",
        },
        {
          id: "name",
          title: "SAMPLE_APP.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME",
          alwaysVisible: true,
        },
        {
          id: "description",
          title: "SAMPLE_APP.PAGES.LIST.TABLE.HEADER.DESCRIPTION",
        },
        {
          id: "price",
          title: "SAMPLE_APP.PAGES.LIST.TABLE.HEADER.PRICE",
          type: "money",
          alwaysVisible: true,
        },
        {
          id: "salePrice",
          title: "SAMPLE_APP.PAGES.LIST.TABLE.HEADER.SALE_PRICE",
          type: "money",
        },
        {
          id: "currency.name",
          title: "SAMPLE_APP.PAGES.LIST.TABLE.HEADER.CURRENCY",
        },
      ],
    },
  ],
};
