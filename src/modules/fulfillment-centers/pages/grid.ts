import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    url: "/fulfillment-centers",
    id: "FulfillmentCenters",
    component: "DynamicBladeList",
    localizationPrefix: "FULFILLMENT_CENTERS",
    titleTemplate: "FULFILLMENT_CENTERS.PAGES.LIST.TITLE",
    isWorkspace: true,
    composable: "useFulfillmentCenters",
    permissions: "seller:details:edit",
    toolbar: [
      {
        id: "refresh",
        icon: "fas fa-sync-alt",
        title: "FULFILLMENT_CENTERS.PAGES.LIST.TOOLBAR.REFRESH",
        method: "refresh",
      },
      {
        id: "addFulfillmentCenter",
        icon: "fas fa-plus",
        title: "FULFILLMENT_CENTERS.PAGES.LIST.TOOLBAR.ADD_FULFILLMENT_CENTER",
        method: "openAddBlade",
      },
    ],
    menuItem: {
      title: "FULFILLMENT_CENTERS.MENU.TITLE",
      icon: "fas fa-sliders-h",
      group: "SETTINGS.MENU.TITLE",
      priority: 6,
    },
  },
  content: [
    {
      id: "fulfillmentGrid",
      component: "vc-table",
      header: false,
      multiselect: false,
      mobileTemplate: {
        component: "FulfillmentMobileGridView",
      },
      columns: [
        {
          id: "name",
          title: "FULFILLMENT_CENTERS.PAGES.LIST.TABLE.HEADER.NAME",
          alwaysVisible: true,
          sortable: true,
        },
      ],
    },
  ],
};
