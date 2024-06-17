import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    id: "TeamMemberDetails",
    component: "DynamicBladeForm",
    localizationPrefix: "Team",
    composable: "useTeamDetails",
    toolbar: [
      {
        id: "invite",
        title: "TEAM.PAGES.DETAILS.TOOLBAR.CREATE",
        icon: "fas fa-paper-plane",
        method: "sendInvite",
      },
      {
        id: "save",
        icon: "fas fa-save",
        title: "TEAM.PAGES.DETAILS.TOOLBAR.SAVE",
        method: "saveChanges",
      },
      {
        id: "reset",
        icon: "fas fa-undo",
        title: "TEAM.PAGES.DETAILS.TOOLBAR.RESET",
        method: "reset",
      },
      {
        id: "delete",
        icon: "fas fa-trash",
        title: "TEAM.PAGES.DETAILS.TOOLBAR.DELETE",
        method: "remove",
      },
      {
        id: "resend-invite",
        icon: "fas fa-paper-plane",
        title: "TEAM.PAGES.DETAILS.TOOLBAR.RESEND",
        method: "resendInvite",
      },
    ],
  },
  content: [
    {
      id: "personForm",
      component: "vc-form",
      children: [
        {
          id: "nameAndAvatarFieldset",
          component: "vc-fieldset",
          columns: 2,
          fields: [
            {
              id: "nameFieldset",
              component: "vc-fieldset",
              fields: [
                {
                  id: "firstName",
                  component: "vc-input",
                  label: "TEAM.PAGES.DETAILS.FORM.FIRST_NAME.LABEL",
                  property: "firstName",
                  placeholder: "TEAM.PAGES.DETAILS.FORM.FIRST_NAME.PLACEHOLDER",
                  rules: { required: true },
                  disabled: {
                    method: "isOwnerReadonly",
                  },
                },
                {
                  id: "lastName",
                  component: "vc-input",
                  label: "TEAM.PAGES.DETAILS.FORM.LAST_NAME.LABEL",
                  property: "lastName",
                  placeholder: "TEAM.PAGES.DETAILS.FORM.LAST_NAME.PLACEHOLDER",
                  rules: { required: true },
                  disabled: {
                    method: "isOwnerReadonly",
                  },
                },
              ],
            },
            {
              id: "iconUrl",
              component: "vc-gallery",
              variant: "file-upload",
              multiple: false,
              property: "photoHandler",
              rules: {
                fileWeight: 300,
              },
              actions: {
                preview: true,
                edit: false,
                remove: true,
              },
              disabled: {
                method: "disableOnCurrent",
              },
              hideAfterUpload: true,
            },
          ],
        },
        {
          id: "email",
          component: "vc-input",
          placeholder: "TEAM.PAGES.DETAILS.FORM.EMAIL.PLACEHOLDER",
          label: "TEAM.PAGES.DETAILS.FORM.EMAIL.LABEL",
          property: "email",
          rules: { required: true, email: true },
          disabled: {
            method: "disableOnUser",
          },
        },
        {
          id: "role",
          component: "vc-select",
          label: "TEAM.PAGES.DETAILS.FORM.ROLE.LABEL",
          placeholder: "TEAM.PAGES.DETAILS.FORM.ROLE.PLACEHOLDER",
          property: "role",
          optionValue: "id",
          optionLabel: "name",
          optionsMethod: "roles",
          rules: { required: true },
          disabled: {
            method: "disableOnCurrent",
          },
        },
        {
          id: "is-active",
          component: "vc-switch",
          label: "TEAM.PAGES.DETAILS.FORM.IS_ACTIVE.LABEL",
          property: "isActive",
          trueValue: false,
          falseValue: true,
          visibility: {
            method: "isActiveSwitchVisible",
          },
          disabled: {
            method: "disableOnCurrent",
          },
        },
        {
          id: "send-invite",
          component: "vc-switch",
          label: "TEAM.PAGES.DETAILS.FORM.INVITE.LABEL",
          property: "sendInviteStatus",
          visibility: {
            method: "isActiveSwitchHidden",
          },
        },
      ],
    },
  ],
};
