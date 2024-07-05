import { DynamicGridSchema } from "@vc-shell/framework";

export const shippingGrid: DynamicGridSchema = {
  settings: {
    id: "Shipping",
    component: "DynamicBladeList",
    localizationPrefix: "SHIPPING",
    titleTemplate: "SHIPPING.PAGES.LIST.TITLE",
    composable: "useShipping",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "SHIPPING.PAGES.LIST.TOOLBAR.SAVE",
        method: "save",
      },
      {
        id: "add",
        icon: "fas fa-plus",
        title: "SHIPPING.PAGES.LIST.TOOLBAR.ADD",
        method: "openAddBlade",
      },
    ],
  },
  content: [
    {
      id: "shippingGrid",
      component: "vc-table",
      header: false,
      multiselect: false,
      emptyTemplate: {
        component: "ShippingEmptyGridTemplate",
      },
      columns: [
        {
          id: "shippingMethod.name",
          title: "SHIPPING.PAGES.LIST.TABLE.HEADER.METHOD",
          alwaysVisible: true,
        },
        {
          id: "trackingNumber",
          title: "SHIPPING.PAGES.LIST.TABLE.HEADER.TRACK_NUM",
          type: "number",
          alwaysVisible: true,
        },
        {
          id: "status",
          title: "SHIPPING.PAGES.LIST.TABLE.HEADER.STATUS",
          customTemplate: {
            component: "ShippingGridStatus",
          },
          alwaysVisible: true,
        },
        {
          id: "total",
          title: "SHIPPING.PAGES.LIST.TABLE.HEADER.TOTAL",
          type: "money",
          alwaysVisible: true,
        },
      ],
    },
  ],
};
