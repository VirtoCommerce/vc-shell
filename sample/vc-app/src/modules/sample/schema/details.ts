import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  /**
   * @description Blade settings
   */
  settings: {
    /**
     * @description Blade url
     */
    url: "/person",
    /**
     * @description Required component name
     */
    name: "Person",
    /**
     * @description Blade default header title
     */
    titleTemplate: "Person",
    /**
     * @description Blade component view model
     */
    model: "DynamicBladeForm",
    /**
     * @description Locale key for VueI18n locale files
     */
    localeKey: "Team",
    /**
     * @description Composable to use at {@link details.settings.model } blade component view
     */
    composable: "useTeamDetails",
    /**
     * @description Toolbar items array
     * @default 'save', 'delete' in {@link SettingsDetails}
     */
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
  /**
   * @description Blade content
   */
  content: [
    /**
     * @description Blade form
     */
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
          method: "roles",
          rules: { required: true },
        },
      ],
    },
  ],
};
