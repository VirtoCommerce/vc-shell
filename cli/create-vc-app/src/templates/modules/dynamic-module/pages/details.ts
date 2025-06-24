import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    url: "/{{ModuleName}}-details",
    id: "{{ModuleNamePascalCase}}Details",
    localizationPrefix: "{{ModuleNameUppercaseSnakeCase}}",
    composable: "use{{ModuleNamePascalCase}}Details",
    component: "DynamicBladeForm",
  },
  content: [
    {
      id: "dynamicItemForm",
      component: "vc-form",
      children: [
        // You can add fields here
      ],
    },
  ],
};
