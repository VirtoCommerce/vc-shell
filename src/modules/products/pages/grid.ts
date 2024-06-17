import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    url: "/products",
    id: "Products",
    titleTemplate: "PRODUCTS.PAGES.LIST.TITLE",
    localizationPrefix: "Products",
    isWorkspace: true,
    composable: "useProductsList",
    component: "DynamicBladeList",
    toolbar: [
      {
        id: "refresh",
        icon: "fas fa-sync-alt",
        title: "PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH",
        method: "refresh",
      },
      {
        id: "add",
        icon: "fas fa-plus",
        title: "PRODUCTS.PAGES.LIST.TOOLBAR.ADD",
        method: "openAddBlade",
      },
      {
        id: "export",
        icon: "fas fa-file-export",
        title: "PRODUCTS.PAGES.LIST.TOOLBAR.EXPORT_CATEGORIES",
        method: "exportCategories",
      },
      {
        id: "deleteSelected",
        icon: "fas fa-trash",
        title: "PRODUCTS.PAGES.LIST.TOOLBAR.DELETE",
        method: "removeItems",
      },
    ],
    menuItem: {
      title: "PRODUCTS.MENU.MY_PRODUCTS",
      groupIcon: "fas fa-cubes",
      icon: "fas fa-dice-d6",
      group: "PRODUCTS.MENU.TITLE",
      priority: 2,
      inGroupPriority: 2,
    },
    pushNotificationType: "PublicationRequestStatusChangedDomainEvent",
  },
  content: [
    {
      id: "productsGrid",
      component: "vc-table",
      multiselect: true,
      selectAll: true,
      actions: [
        {
          id: "deleteItem",
          icon: "fas fa-trash",
          title: "PRODUCTS.PAGES.LIST.TABLE.ACTIONS.DELETE",
          type: "danger",
          position: "left",
          method: "removeItems",
        },
      ],
      mobileTemplate: {
        component: "ProductsMobileGridView",
      },
      notFoundTemplate: {
        component: "ProductNotFoundGridTemplate",
      },
      emptyTemplate: {
        component: "ProductsEmptyGridTemplate",
      },
      filter: {
        columns: [
          {
            id: "statusFilter",
            controls: [
              {
                id: "statusCheckbox",
                label: "PRODUCTS.PAGES.LIST.FILTERS.STATUS_FILTER",
                field: "status",
                component: "vc-checkbox",
                multiple: true,
                data: "statuses",
                optionValue: "value",
                optionLabel: "displayValue",
              },
            ],
          },
        ],
      },
      columns: [
        {
          id: "imgSrc",
          title: "PRODUCTS.PAGES.LIST.TABLE.HEADER.IMAGE",
          type: "image",
          alwaysVisible: true,
        },
        {
          id: "name",
          title: "PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME",
          sortable: true,
          alwaysVisible: true,
          customTemplate: {
            component: "GridName",
          },
        },
        {
          id: "createdDate",
          title: "PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED_DATE",
          sortable: true,
          type: "date-ago",
        },
        {
          id: "isPublished",
          title: "PRODUCTS.PAGES.LIST.TABLE.HEADER.PUBLISHED",
          sortable: true,
          type: "status-icon",
        },
        {
          id: "status",
          title: "PRODUCTS.PAGES.LIST.TABLE.HEADER.STATUS",
          sortable: true,
          alwaysVisible: true,
          customTemplate: {
            component: "MpProductStatus",
          },
        },
        {
          id: "gtin",
          field: "productData.gtin",
          title: "PRODUCTS.PAGES.LIST.TABLE.HEADER.GTIN",
          alwaysVisible: true,
        },
        {
          id: "productType",
          field: "productData.productType",
          title: "PRODUCTS.PAGES.LIST.TABLE.HEADER.PRODUCT_TYPE",
        },
      ],
    },
  ],
};
