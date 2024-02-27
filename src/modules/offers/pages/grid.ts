import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    url: "/offers",
    id: "Offers",
    titleTemplate: "OFFERS.PAGES.LIST.TITLE",
    localizationPrefix: "Offers",
    isWorkspace: true,
    composable: "useOffersList",
    component: "DynamicBladeList",
    toolbar: [
      {
        id: "refresh",
        icon: "fas fa-sync-alt",
        title: "OFFERS.PAGES.LIST.TOOLBAR.REFRESH",
        method: "refresh",
      },
      {
        id: "add",
        icon: "fas fa-plus",
        title: "OFFERS.PAGES.LIST.TOOLBAR.ADD",
        method: "openAddBlade",
      },
      {
        id: "deleteSelected",
        icon: "fas fa-trash",
        title: "OFFERS.PAGES.LIST.TOOLBAR.DELETE",
        method: "removeItems",
      },
    ],
    pushNotificationType: ["OfferDeletedDomainEvent", "OfferCreatedDomainEvent"],
    menuItem: {
      title: "OFFERS.MENU.TITLE",
      icon: "fas fa-file-invoice",
      priority: 3,
    },
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
      selectAll: true,
      actions: [
        {
          id: "deleteItem",
          icon: "fas fa-trash",
          title: "OFFERS.PAGES.LIST.TABLE.ACTIONS.DELETE",
          type: "danger",
          position: "left",
          method: "removeItems",
        },
      ],
      columns: [
        {
          id: "imgSrc",
          title: "OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_IMAGE",
          type: "image",
          alwaysVisible: true,
        },
        {
          id: "name",
          title: "OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME",
          sortable: true,
          alwaysVisible: true,
        },
        {
          id: "createdDate",
          title: "OFFERS.PAGES.LIST.TABLE.HEADER.CREATED_DATE",
          sortable: true,
          type: "date-ago",
        },
        {
          id: "sku",
          title: "OFFERS.PAGES.LIST.TABLE.HEADER.SKU",
          sortable: true,
          alwaysVisible: true,
        },
        {
          id: "isActive",
          title: "OFFERS.PAGES.LIST.TABLE.HEADER.ENABLED",
          sortable: true,
          alwaysVisible: true,
          type: "status-icon",
        },
        {
          id: "isDefault",
          title: "OFFERS.PAGES.LIST.TABLE.HEADER.DEFAULT",
          sortable: true,
          alwaysVisible: true,
          type: "status-icon",
          visible: { method: "needShowIsDefault" },
        },
        {
          id: "prices.salePrice",
          title: "OFFERS.PAGES.LIST.TABLE.HEADER.SALE_PRICE",
          sortable: true,
          type: "money",
        },
        {
          id: "minQuantity",
          title: "OFFERS.PAGES.LIST.TABLE.HEADER.MIN_QTY",
          sortable: true,
          type: "number",
        },
        {
          id: "inStockQuantity",
          title: "OFFERS.PAGES.LIST.TABLE.HEADER.QTY",
          sortable: true,
          type: "number",
        },
        {
          id: "availQuantity",
          title: "OFFERS.PAGES.LIST.TABLE.HEADER.AVAIL_QTY",
          sortable: true,
          type: "number",
        },
      ],
    },
  ],
};
