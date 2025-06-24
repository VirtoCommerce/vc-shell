import { OverridesSchema } from "@vc-shell/framework";

export const overrides: OverridesSchema = {
  upsert: [
    // Adding a new input control that will display data from 'newField' property
    {
      id: "Offer",
      path: "content[0].children[1].fields",
      index: 0,
      value: {
        id: "exampleInput",
        component: "vc-input",
        label: "New Field",
        property: "newField",
      },
    },
    // Adding a new action button to the blade toolbar
    {
      id: "Offer",
      path: "settings.toolbar",
      index: 1,
      value: {
        id: "newToolbarAction",
        title: "Click me!",
        icon: "material-add",
        method: "showAlert",
      },
    },
  ],
};
