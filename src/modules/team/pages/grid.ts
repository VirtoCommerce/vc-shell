import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    url: "/team",
    id: "Team",
    component: "DynamicBladeList",
    localizationPrefix: "Team",
    titleTemplate: "TEAM.PAGES.LIST.TITLE",
    isWorkspace: true,
    composable: "useTeamList",
    permissions: "seller:users:manage",
    toolbar: [
      {
        id: "refresh",
        icon: "fas fa-sync-alt",
        title: "TEAM.PAGES.LIST.TOOLBAR.REFRESH",
        method: "refresh",
      },
      {
        id: "add",
        icon: "fas fa-user-plus",
        title: "TEAM.PAGES.LIST.TOOLBAR.ADD_MEMBER",
        method: "openAddBlade",
      },
    ],
    menuItem: {
      title: "TEAM.MENU.TITLE",
      groupIcon: "fas fa-store",
      icon: "fas fa-users",
      group: "SETTINGS.MENU.TITLE",
      priority: 6,
    },
  },
  content: [
    {
      id: "teamGrid",
      component: "vc-table",
      header: false,
      multiselect: false,
      mobileTemplate: {
        component: "TeamGridMobileView",
      },
      emptyTemplate: {
        component: "TeamEmptyGridTemplate",
      },
      columns: [
        {
          id: "iconUrl",
          title: "TEAM.PAGES.LIST.TABLE.HEADER.IMAGE",
          emptyIcon: "fas fa-user",
          type: "image",
          alwaysVisible: true,
        },
        {
          id: "firstName",
          title: "TEAM.PAGES.LIST.TABLE.HEADER.FIRST_NAME",
          alwaysVisible: true,
          sortable: true,
        },
        {
          id: "lastName",
          title: "TEAM.PAGES.LIST.TABLE.HEADER.LAST_NAME",
          alwaysVisible: true,
          sortable: true,
        },
        {
          id: "email",
          title: "TEAM.PAGES.LIST.TABLE.HEADER.EMAIL",
          alwaysVisible: true,
        },
        {
          id: "role",
          title: "TEAM.PAGES.LIST.TABLE.HEADER.ROLE",
          alwaysVisible: true,
          customTemplate: {
            component: "TeamRole",
          },
        },
        {
          id: "isLockedOut",
          title: "TEAM.PAGES.LIST.TABLE.HEADER.STATUS",
          alwaysVisible: true,
          customTemplate: {
            component: "TeamStatus",
          },
        },
      ],
    },
  ],
};
