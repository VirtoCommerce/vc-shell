import { DynamicGridSchema } from "@vc-shell/framework";

export const grid: DynamicGridSchema = {
  settings: {
    url: "/{{ModuleName}}",
    id: "{{ModuleNamePascalCase}}List",
    titleTemplate: "{{ModuleNameSentenceCase}} list",
    localizationPrefix: "{{ModuleNameUppercaseSnakeCase}}",
    isWorkspace: true,
    composable: "use{{ModuleNamePascalCase}}List",
    component: "DynamicBladeList",
    toolbar: [
      {
        id: "refresh",
        icon: "material-refresh",
        title: "Refresh",
        method: "refresh",
      },
    ],
    menuItem: {
      title: "{{ModuleNameUppercaseSnakeCase}}.MENU.TITLE",
      icon: "lucide-file",
      priority: 1,
    },
  },
  content: [
    {
      id: "itemsGrid",
      component: "vc-table",
      columns: [
        // You can add columns here
      ],
    },
  ],
};
