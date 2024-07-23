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
      emptyTemplate: {
        component: "SpecialPricesEmptyGridTemplate",
      },
      columns: [
        {
          id: "name",
          title: "SPECIAL_PRICES.PAGES.LIST.TABLE.HEADER.NAME",
          alwaysVisible: true,
        },
        {
          id: "prices",
          title: "SPECIAL_PRICES.PAGES.LIST.TABLE.HEADER.PRICE",
          alwaysVisible: true,
          customTemplate: {
            component: "ListPriceTemplate",
          },
          field: "prices[0].listPrice",
        },
        {
          id: "startDate",
          title: "SPECIAL_PRICES.PAGES.LIST.TABLE.HEADER.START_DATE",
          alwaysVisible: true,
          type: "date-time",
        },
        {
          id: "endDate",
          title: "SPECIAL_PRICES.PAGES.LIST.TABLE.HEADER.END_DATE",
          alwaysVisible: true,
          type: "date-time",
        },
        {
          id: "conditions",
          title: "SPECIAL_PRICES.PAGES.LIST.TABLE.HEADER.CONDITIONS",
          alwaysVisible: true,
          customTemplate: {
            component: "ConditionsTemplate",
          },
        },
      ],
    },
  ],
};
