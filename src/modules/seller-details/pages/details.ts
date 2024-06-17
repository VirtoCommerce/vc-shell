import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    url: "/seller-details-edit",
    id: "SellerDetails",
    isWorkspace: true,
    localizationPrefix: "SELLER_DETAILS",
    composable: "useSellerDetails",
    permissions: "seller:details:edit",
    component: "DynamicBladeForm",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "SELLER_DETAILS.TOOLBAR.SAVE",
        method: "saveChanges",
      },
      {
        id: "reset",
        icon: "fas fa-undo",
        title: "SELLER_DETAILS.TOOLBAR.RESET",
        method: "reset",
      },
    ],
    menuItem: {
      title: "SELLER_DETAILS.MENU.TITLE",
      groupIcon: "fas fa-store",
      icon: "fas fa-briefcase",
      group: "SETTINGS.MENU.TITLE",
      priority: 6,
    },
  },
  content: [
    {
      id: "sellerDetailsForm",
      component: "vc-form",
      children: [
        {
          id: "mainSellerFieldset",
          component: "vc-fieldset",
          columns: 2,
          fields: [
            {
              id: "basicInfoCard",
              component: "vc-card",
              label: "Basic Info",
              fields: [
                {
                  id: "companyName",
                  component: "vc-input",
                  label: "SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_NAME.LABEL",
                  placeholder: "SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_NAME.PLACEHOLDER",
                  rules: {
                    required: true,
                    max: 254,
                  },
                  property: "name",
                },
                {
                  id: "commissionFee",
                  component: "vc-field",
                  label: "SELLER_DETAILS.CARDS.INFO.FORM.COMMISSION.LABEL",
                  variant: "text",
                  property: "computedFee",
                },
                {
                  id: "companyFieldset",
                  component: "vc-fieldset",
                  columns: 2,
                  fields: [
                    {
                      id: "companyInfoFieldset",
                      component: "vc-fieldset",
                      fields: [
                        {
                          id: "companyRegistrationNum",
                          component: "vc-input",
                          label: "SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_REG_NUM.LABEL",
                          property: "registrationId",
                          placeholder: "SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_REG_NUM.PLACEHOLDER",
                          rules: {
                            max: 128,
                          },
                          clearable: true,
                        },
                        {
                          id: "companyOuterId",
                          component: "vc-input",
                          label: "SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_OUTER_ID.LABEL",
                          property: "outerId",
                          placeholder: "SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_OUTER_ID.PLACEHOLDER",
                          rules: {
                            max: 128,
                          },
                          clearable: true,
                        },
                      ],
                    },
                    {
                      id: "companyLogo",
                      component: "vc-gallery",
                      variant: "file-upload",
                      multiple: false,
                      property: "logoHandler",
                      uploadIcon: "fas fa-camera",
                      rules: {
                        fileWeight: 1024,
                      },
                      actions: {
                        preview: true,
                        edit: false,
                        remove: true,
                      },
                      hideAfterUpload: true,
                      customText: {
                        dragHere: "SELLER_DETAILS.CARDS.INFO.FORM.UPLOAD.DRAG",
                        browse: "SELLER_DETAILS.CARDS.INFO.FORM.UPLOAD.BROWSE",
                      },
                    },
                  ],
                },
                {
                  id: "aboutCompany",
                  component: "vc-textarea",
                  label: "SELLER_DETAILS.CARDS.INFO.FORM.ABOUT.LABEL",
                  placeholder: "SELLER_DETAILS.CARDS.INFO.FORM.ABOUT.PLACEHOLDER",
                  property: "description",
                  clearable: true,
                },
                {
                  id: "deliveryTime",
                  component: "vc-textarea",
                  label: "SELLER_DETAILS.CARDS.INFO.FORM.DELIVERY.LABEL",
                  placeholder: "SELLER_DETAILS.CARDS.INFO.FORM.DELIVERY.PLACEHOLDER",
                  property: "deliveryTime",
                  clearable: true,
                },
              ],
            },
            {
              id: "basicInfoCard",
              component: "vc-card",
              label: "SELLER_DETAILS.CARDS.ADDRESS.TITLE",
              fields: [
                {
                  id: "companyAddressFirst",
                  component: "vc-fieldset",
                  columns: 2,
                  fields: [
                    {
                      id: "country",
                      component: "vc-select",
                      label: "SELLER_DETAILS.CARDS.ADDRESS.FORM.COUNTRY.LABEL",
                      property: "addresses[0].countryCode",
                      placeholder: "SELLER_DETAILS.CARDS.ADDRESS.FORM.COUNTRY.PLACEHOLDER",
                      optionsMethod: "countriesList",
                      optionValue: "id",
                      optionLabel: "name",
                      searchable: true,
                      update: {
                        method: "onCountryChange",
                      },
                      rules: {
                        required: true,
                      },
                    },
                    {
                      id: "zipCode",
                      component: "vc-input",
                      placeholder: "SELLER_DETAILS.CARDS.ADDRESS.FORM.ZIP.PLACEHOLDER",
                      label: "SELLER_DETAILS.CARDS.ADDRESS.FORM.ZIP.LABEL",
                      property: "addresses[0].postalCode",
                      rules: {
                        required: true,
                        max: 32,
                      },
                    },
                  ],
                },
                {
                  id: "companyAddressSecond",
                  component: "vc-fieldset",
                  columns: 2,
                  fields: [
                    {
                      id: "state",
                      component: "vc-select",
                      label: "SELLER_DETAILS.CARDS.ADDRESS.FORM.STATE.LABEL",
                      placeholder: "SELLER_DETAILS.CARDS.ADDRESS.FORM.STATE.PLACEHOLDER",
                      property: "addresses[0].regionId",
                      optionsMethod: "regionsList",
                      optionValue: "id",
                      optionLabel: "name",
                      searchable: true,
                      update: {
                        method: "setRegion",
                      },
                    },
                    {
                      id: "city",
                      component: "vc-input",
                      placeholder: "SELLER_DETAILS.CARDS.ADDRESS.FORM.CITY.PLACEHOLDER",
                      label: "SELLER_DETAILS.CARDS.ADDRESS.FORM.CITY.LABEL",
                      rules: {
                        required: true,
                        max: 128,
                      },
                      property: "addresses[0].city",
                    },
                  ],
                },
                {
                  id: "addressLine1",
                  component: "vc-input",
                  property: "addresses[0].line1",
                  label: "SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_1.LABEL",
                  placeholder: "SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_1.PLACEHOLDER",
                  rules: {
                    required: true,
                    max: 128,
                  },
                },
                {
                  id: "addressLine2",
                  component: "vc-input",
                  property: "addresses[0].line2",
                  label: "SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_2.LABEL",
                  placeholder: "SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_2.PLACEHOLDER",
                  rules: {
                    max: 128,
                  },
                },
                {
                  id: "location",
                  component: "vc-input",
                  property: "location",
                  label: "SELLER_DETAILS.CARDS.ADDRESS.FORM.LONGLAT.LABEL",
                  placeholder: "SELLER_DETAILS.CARDS.ADDRESS.FORM.LONGLAT.PLACEHOLDER",
                  rules: {
                    max: 512,
                    regex:
                      /^([-+]?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?)),\s*([-+]?(?:180(?:\.0+)?|(?:(?:1[0-7]\d)|(?:[1-9]?\d))(?:\.\d+)?))$/,
                  },
                  tooltip: "SELLER_DETAILS.CARDS.ADDRESS.FORM.LONGLAT.DESCRIPTION",
                },
                {
                  id: "contactInfo",
                  component: "vc-fieldset",
                  columns: 2,
                  fields: [
                    {
                      id: "phone",
                      component: "vc-input",
                      label: "SELLER_DETAILS.CARDS.ADDRESS.FORM.PHONE.LABEL",
                      placeholder: "SELLER_DETAILS.CARDS.ADDRESS.FORM.PHONE.PLACEHOLDER",
                      rules: {
                        max: 64,
                      },
                      property: "phones[0]",
                      variant: "number",
                    },
                    {
                      id: "email",
                      component: "vc-input",
                      label: "SELLER_DETAILS.CARDS.ADDRESS.FORM.EMAIL.LABEL",
                      placeholder: "SELLER_DETAILS.CARDS.ADDRESS.FORM.EMAIL.PLACEHOLDER",
                      rules: {
                        max: 256,
                      },
                      property: "emails[0]",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
