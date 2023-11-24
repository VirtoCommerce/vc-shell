import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    url: "/offers",
    id: "Offers",
    titleTemplate: "Offers",
    localizationPrefix: "Offers",
    isWorkspace: true,
    composable: "useOffersList",
    component: "DynamicBladeList",
    toolbar: [
      {
        id: "refresh",
        icon: "fas fa-sync-alt",
        title: "Refresh",
        method: "refresh",
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
    pushNotificationType: "OfferDeletedDomainEvent",
  },
  content: [
    {
      id: "offersGrid",
      component: "vc-table",
      mobileTemplate: {
        component: "OffersMobileGridView",
      },
      emptyTemplate: {
        component: "OffersEmptyGridTemplate",
      },
      notFoundTemplate: {
        component: "OffersNotFoundGridTemplate",
      },
      multiselect: true,
      columns: [
        {
          id: "imgSrc",
          title: "Pic",
          type: "image",
          alwaysVisible: true,
        },
        {
          id: "name",
          title: "Name",
          sortable: true,
          alwaysVisible: true,
        },
        {
          id: "createdDate",
          title: "Created date",
          sortable: true,
          type: "date-ago",
        },
        {
          id: "sku",
          title: "SKU#",
          sortable: true,
          alwaysVisible: true,
        },
        {
          id: "isActive",
          title: "Enabled",
          sortable: true,
          alwaysVisible: true,
          type: "status-icon",
        },
        {
          id: "prices.salePrice",
          title: "Sale price",
          sortable: true,
          type: "money",
        },
        {
          id: "minQuantity",
          title: "Min quantity",
          sortable: true,
          type: "number",
        },
        {
          id: "inStockQuantity",
          title: "Initial quantity",
          sortable: true,
          type: "number",
        },
        {
          id: "availQuantity",
          title: "Current quantity",
          sortable: true,
          type: "number",
        },
      ],
    },
  ],
};
