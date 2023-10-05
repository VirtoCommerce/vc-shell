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
          id: "card",
          type: "card",
          label: "Card",
          action: {
            id: "Button",
            type: "button",
            content: "Simple button",
            small: true,
            method: "sampleButtonClick",
            name: "button-sample",
          },
          fields: [
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
            {
              id: "checkbox",
              type: "checkbox",
              property: "trackInventory",
              content: "Always in stock",
              trueValue: false,
              falseValue: true,
              label: "Quantity in stock",
              name: "trackInventory",
            },
            {
              id: "fieldset",
              type: "fieldset",
              columns: 2,
              fields: [
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
              ],
            },
          ],
        },
        {
          id: "galleryCard",
          type: "card",
          label: "Gallery",
          collapsible: true,
          fields: [
            {
              id: "imagesGallery",
              type: "gallery",
              property: "images",
              uploadFolder: "offers",
            },
          ],
        },
      ],
    },
  ],
};
