import { DynamicGridSchema } from "@vc-shell/framework";

export const specialPricesList: DynamicGridSchema = {
  settings: {
    routable: false,
    id: "SpecialPricesList",
    titleTemplate: "SPECIAL_PRICES.PAGES.LIST.TITLE",
    localizationPrefix: "SPECIAL_PRICES",
    composable: "useSpecialPricesList",
    component: "DynamicBladeList",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-check",
        title: "SPECIAL_PRICES.PAGES.LIST.TOOLBAR.CONFIRM",
        method: "save",
      },
      {
        id: "add",
        icon: "fas fa-plus",
        title: "SPECIAL_PRICES.PAGES.LIST.TOOLBAR.ADD",
        method: "openAddBlade",
      },
    ],
  },
  content: [
    {
      id: "specialPricesGrid",
      component: "vc-table",
      header: false,
      columns: [
        {
          id: "name",
          title: "SPECIAL_PRICES.PAGES.LIST.TABLE.HEADER.NAME",
          sortable: true,
          alwaysVisible: true,
        },
        {
          id: "prices[0].listPrice",
          title: "SPECIAL_PRICES.PAGES.LIST.TABLE.HEADER.PRICE",
          sortable: true,
          alwaysVisible: true,
          customTemplate: {
            component: "ListPriceTemplate",
          },
        },
        {
          id: "startDate",
          title: "SPECIAL_PRICES.PAGES.LIST.TABLE.HEADER.START_DATE",
          sortable: true,
          alwaysVisible: true,
          type: "date-time",
        },
        {
          id: "endDate",
          title: "SPECIAL_PRICES.PAGES.LIST.TABLE.HEADER.END_DATE",
          sortable: true,
          alwaysVisible: true,
          type: "date-time",
        },
      ],
    },
  ],
};
