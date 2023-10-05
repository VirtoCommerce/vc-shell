import { OverridesSchema } from "@vc-shell/framework";

export const overrides: OverridesSchema = {
  upsert: [
    {
      name: "Person",
      path: "settings.toolbar",
      index: 1,
      value: {
        id: "newClick",
        icon: "fas fa-plus-square",
        title: "Override",
        method: "overrideSampleFn",
      },
    },
    {
      name: "Person",
      path: "content[0].children",
      value: {
        id: "personName",
        type: "input",
        label: "Replaced firstName input",
        property: "firstName",
        rules: { required: true },
        name: "firstName",
      },
    },
    {
      name: "Person",
      path: "content[0].children",
      index: 2,
      value: {
        id: "personNameExtend",
        type: "input",
        label: "Added new firstName input",
        property: "firstName",
        rules: { required: true },
        name: "firstNameExtend",
      },
    },
    {
      name: "Person",
      path: "content[0].children",
      value: {
        id: "extendCard",
        type: "card",
        label: "Extended card",
        fields: [
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
        ],
      },
    },
  ],
  remove: [
    {
      name: "Person",
      path: "settings.toolbar[0]",
    },
  ],
};
