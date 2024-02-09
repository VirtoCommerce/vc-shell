import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    url: "/orders",
    id: "Orders",
    component: "DynamicBladeList",
    localizationPrefix: "ORDERS",
    titleTemplate: "ORDERS.PAGES.LIST.TITLE",
    isWorkspace: true,
    composable: "useOrders",
    width: "30%",
    pushNotificationType: "OrderCreatedEventHandler",
    toolbar: [
      {
        id: "refresh",
        icon: "fas fa-sync-alt",
        title: "ORDERS.PAGES.LIST.TOOLBAR.REFRESH",
        method: "refresh",
      },
    ],
    menuItem: {
      title: "ORDERS.MENU.TITLE",
      icon: "fas fa-shopping-cart",
      priority: 1,
    },
  },
  content: [
    {
      id: "ordersGrid",
      component: "vc-table",
      header: true,
      multiselect: false,
      mobileTemplate: {
        component: "OrdersMobileGridView",
      },
      emptyTemplate: {
        component: "OrdersEmptyGridTemplate",
      },
      notFoundTemplate: {
        component: "OrdersNotFoundGridTemplate",
      },
      filter: {
        columns: [
          {
            id: "statusFilter",
            title: "ORDERS.PAGES.LIST.TABLE.FILTER.STATUS.TITLE",
            controls: [
              {
                id: "statusCheckbox",
                field: "status",
                component: "vc-checkbox",
                multiple: false,
                data: "statuses",
                optionValue: "value",
                optionLabel: "displayValue",
              },
            ],
          },
          {
            id: "orderDateFilter",
            title: "ORDERS.PAGES.LIST.TABLE.FILTER.DATE.TITLE",
            controls: [
              {
                id: "startDateInput",
                field: "startDate",
                label: "ORDERS.PAGES.LIST.TABLE.FILTER.DATE.START_DATE",
                component: "vc-input",
              },
              {
                id: "endDateInput",
                field: "endDate",
                label: "ORDERS.PAGES.LIST.TABLE.FILTER.DATE.END_DATE",
                component: "vc-input",
              },
            ],
          },
        ],
      },
      columns: [
        {
          id: "number",
          title: "ORDERS.PAGES.LIST.TABLE.HEADER.NUMBER",
          width: 160,
          alwaysVisible: true,
          sortable: true,
        },
        {
          id: "customerName",
          title: "ORDERS.PAGES.LIST.TABLE.HEADER.CUSTOMER",
          alwaysVisible: true,
          sortable: true,
        },
        {
          id: "total",
          title: "ORDERS.PAGES.LIST.TABLE.HEADER.TOTAL",
          width: 120,
          alwaysVisible: true,
          sortable: true,
          type: "money",
        },
        {
          id: "status",
          title: "ORDERS.PAGES.LIST.TABLE.HEADER.STATUS",
          width: 120,
          alwaysVisible: true,
          sortable: true,
          customTemplate: {
            component: "OrderStatusTemplate",
          },
        },
        {
          id: "createdDate",
          title: "ORDERS.PAGES.LIST.TABLE.HEADER.CREATED",
          sortable: true,
          width: 180,
          type: "date-ago",
        },
      ],
    },
  ],
};
