import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  /**
   * @description Blade settings
   */
  settings: {
    /**
     * @description Blade url
     */
    url: "/team-j",
    /**
     * @description Required component name
     */
    name: "TeamJ",
    /**
     * @description Blade component view model
     */
    model: "DynamicBladeList",
    /**
     * @description Locale key for VueI18n locale files
     */
    localeKey: "Team",
    /**
     * @description Blade default header title
     */
    titleTemplate: "My Team",
    /**
     * @description Module name which must be specified in only one schema in module and is used for display in the navigation menu
     */
    moduleName: "My Team",
    /**
     * @description Module icon for navigation menu
     */
    icon: "fas fa-file-alt",
    /**
     * @description Composable to use at {@link grid.settings.model } blade component view
     */
    composable: "useTeamList",
    /**
     * @description Toolbar items array
     * @default 'refresh', 'add' in {@link SettingsWorkspace}
     */
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
  /**
   * @description Blade content
   */
  content: [
    /**
     * @description Required block of type 'grid' for table component visualization
     */
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
