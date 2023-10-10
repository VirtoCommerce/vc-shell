import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    url: "/team-j",
    name: "TeamJ",
    template: "DynamicBladeList",
    localizationPrefix: "Team",
    titleTemplate: "My Team",
    moduleName: "My Team",
    icon: "fas fa-file-alt",
    composable: "useTeamList",
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
        title: "Add member",
        method: "openAddBlade",
      },
    ],
  },
  content: [
    {
      id: "teamGrid",
      type: "grid",
      header: false,
      multiselect: false,
      columns: [
        {
          id: "firstName",
          title: "First name",
          alwaysVisible: true,
          sortable: true,
        },
        {
          id: "lastName",
          title: "Last name",
          alwaysVisible: true,
          sortable: true,
        },
        {
          id: "email",
          title: "Email",
          alwaysVisible: true,
        },
        {
          id: "role",
          title: "Role",
          alwaysVisible: true,
        },
        {
          id: "isLockedOut",
          title: "Status",
          alwaysVisible: true,
          customTemplate: {
            component: "TeamStatus",
          },
        },
      ],
    },
  ],
};
