import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    url: "/dynamic-module-details",
    id: "DynamicItem",
    localizationPrefix: "DynamicModule",
    titleTemplate: "Dynamic module details",
    composable: "useDetails",
    component: "DynamicBladeForm",
    toolbar: [
      {
        id: "refresh",
        icon: "fas fa-sync-alt",
        title: "Refresh",
        method: "refresh",
      },
    ],
  },
  content: [
    {
      id: "dynamicItemForm",
      component: "vc-form",
      children: [
        {
          id: "itemName",
          component: "vc-input",
          label: "Name",
          property: "name",
        },
        {
          id: "itemCreatedDate",
          component: "vc-input",
          label: "Created date",
          property: "createdDate",
        },
      ],
    },
  ],
};
