import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    url: "/reviews",
    id: "Reviews",
    component: "DynamicBladeList",
    localizationPrefix: "RATING",
    titleTemplate: "RATING.PAGES.LIST.TITLE",
    isWorkspace: true,
    composable: "useReviews",
    permissions: "seller:reviews:manage",
    width: "70%",
    toolbar: [
      {
        id: "refresh",
        icon: "fas fa-sync-alt",
        title: "RATING.PAGES.LIST.TOOLBAR.REFRESH",
        method: "refresh",
      },
    ],
    menuItem: {
      title: "RATING.MENU.TITLE",
      icon: "fas fa-star",
      priority: 5,
    },
  },
  content: [
    {
      id: "reviewsGrid",
      component: "vc-table",
      header: false,
      columns: [
        {
          id: "title",
          title: "RATING.PAGES.LIST.TABLE.HEADER.TITLE",
          alwaysVisible: true,
          class: "tw-truncate",
        },
        {
          id: "review",
          title: "RATING.PAGES.LIST.TABLE.HEADER.REVIEW",
          alwaysVisible: false,
          class: "tw-truncate",
        },
        {
          id: "rating",
          title: "RATING.PAGES.LIST.TABLE.HEADER.RATING",
          alwaysVisible: true,
          sortable: true,
          width: 140,
          customTemplate: {
            component: "RatingGrid",
          },
        },
        {
          id: "status",
          field: "reviewStatus",
          title: "RATING.PAGES.LIST.TABLE.HEADER.STATUS",
          alwaysVisible: true,
          width: 120,
          customTemplate: {
            component: "ReviewStatus",
          },
        },
        {
          id: "createdDate",
          title: "RATING.PAGES.LIST.TABLE.HEADER.CREATEDDATE",
          alwaysVisible: true,
          sortable: true,
          type: "date-ago",
          width: 120,
        },
        {
          id: "createdBy",
          title: "RATING.PAGES.LIST.TABLE.HEADER.CREATEDBY",
          alwaysVisible: true,
          width: 140,
        },
      ],
    },
  ],
};
