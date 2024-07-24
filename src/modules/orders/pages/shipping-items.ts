import { DynamicGridSchema } from "@vc-shell/framework";

export const shippingItems: DynamicGridSchema = {
  settings: {
    id: "ShippingItems",
    component: "DynamicBladeList",
    localizationPrefix: "SHIPPING",
    titleTemplate: "SHIPPING.PAGES.ITEMS_LIST.TITLE",
    composable: "useShippingItems",
    toolbar: [
      {
        id: "add",
        icon: "fas fa-plus",
        title: "SHIPPING.PAGES.ITEMS_LIST.TOOLBAR.ADD",
        method: "add",
      },
    ],
  },
  content: [
    {
      id: "itemsGrid",
      component: "vc-table",
      header: false,
      multiselect: true,
      footer: false,
      columns: [
        {
          id: "imageUrl",
          title: "SHIPPING.PAGES.ITEMS_LIST.TABLE.HEADER.IMAGE",
          type: "image",
          width: "100px",
        },
        {
          id: "sku",
          title: "SHIPPING.PAGES.ITEMS_LIST.TABLE.HEADER.SKU",
        },
        {
          id: "quantityOnShipment",
          title: "SHIPPING.PAGES.ITEMS_LIST.TABLE.HEADER.ORDER_QTY",
          type: "number",
          editable: true,
          rules: {
            min_value: 1,
          },
        },
        {
          id: "quantity",
          title: "SHIPPING.PAGES.ITEMS_LIST.TABLE.HEADER.AVAIL_QTY",
          type: "number",
        },
      ],
    },
  ],
};
