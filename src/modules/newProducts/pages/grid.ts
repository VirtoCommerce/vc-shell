import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    url: "/products-j",
    name: "ProductsJ",
    titleTemplate: "Products",
    localizationPrefix: "Products",
    moduleName: "Products",
    composable: "useProductsList",
    template: "DynamicBladeList",
    icon: "fas fa-file-alt",
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
        id: "export",
        icon: "fas fa-file-export",
        title: "Export categories",
        method: "exportCategories",
      },
      {
        id: "deleteSelected",
        icon: "fas fa-trash",
        title: "Delete selected",
        method: "removeItems",
      },
    ],
  },
  content: [
    {
      id: "productsGrid",
      type: "grid",
      multiselect: true,
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
            title: "Status filter",
            controls: [
              {
                id: "statusCheckbox",
                field: "status",
                type: "checkbox",
                data: [
                  {
                    value: "None",
                    displayName: "None",
                  },
                  { value: "Published", displayName: "Published" },
                  { value: "HasStagedChanges", displayName: "Has staged changes" },
                  { value: "WaitForApproval", displayName: "Wait for approval" },
                  { value: "RequiresChanges", displayName: "Requires changes" },
                  { value: "Rejected", displayName: "Rejected" },
                ],
              },
            ],
          },
        ],
      },
      columns: [
        {
          id: "imgSrc",
          title: "Image",
          type: "image",
        },
        {
          id: "name",
          title: "Name",
          sortable: true,
          alwaysVisible: true,
          customTemplate: {
            component: "GridName",
          },
        },
        {
          id: "createdDate",
          title: "Created date",
          sortable: true,
          type: "date-ago",
        },
        {
          id: "isPublished",
          title: "Is published",
          sortable: true,
          type: "status-icon",
        },
        {
          id: "status",
          title: "Status",
          sortable: true,
          alwaysVisible: true,
          customTemplate: {
            component: "MpProductStatus",
          },
        },
        {
          id: "gtin",
          field: "productData.gtin",
          title: "GTIN",
          alwaysVisible: true,
        },
        {
          id: "productType",
          field: "productData.productType",
          title: "Product type",
        },
      ],
    },
  ],
};
