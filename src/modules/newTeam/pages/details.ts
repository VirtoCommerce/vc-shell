import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    url: "/person",
    name: "Person",
    titleTemplate: "Person",
    template: "DynamicBladeForm",
    localizationPrefix: "Team",
    composable: "useTeamDetails",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "Save",
        method: "saveChanges",
      },
      {
        id: "delete",
        icon: "fas fa-trash",
        title: "Delete",
        method: "remove",
      },
    ],
  },
  content: [
    {
      id: "personForm",
      type: "form",
      children: [
        {
          id: "personName",
          type: "input",
          label: "First name",
          property: "firstName",
          rules: { required: true },
          name: "firstName",
        },
        {
          id: "personSurname",
          type: "input",
          label: "Last name",
          property: "lastName",
          rules: { required: true },
          name: "lastName",
        },
        {
          id: "email",
          type: "input",
          label: "Email",
          property: "email",
          rules: { required: true, email: true },
          name: "email",
          disabled: {
            method: "disableOnUser",
          },
        },
        {
          id: "role",
          type: "select",
          label: "Role",
          property: "role",
          name: "role",
          optionValue: "id",
          optionLabel: "name",
          optionsMethod: "roles",
          rules: { required: true },
        },
      ],
    },
  ],
};
