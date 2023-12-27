import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    url: "/seller-details-edit",
    id: "SellerDetails",
    isWorkspace: true,
    titleTemplate: "Seller Details",
    localizationPrefix: "SELLER_DETAILS",
    composable: "useSellerDetails",
    component: "DynamicBladeForm",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "Save",
        method: "saveChanges",
      },
      {
        id: "reset",
        icon: "fas fa-undo",
        title: "Reset",
        method: "reset",
      },
    ],
    menuItem: {
      title: "SETTINGS.MENU.SELLER_DETAILS",
      icon: "fas fa-sliders-h",
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
                  label: "Company Name",
                  placeholder: "Enter company name",
                  rules: {
                    required: true,
                    max: 254,
                  },
                  property: "name",
                },
                {
                  id: "commissionFee",
                  component: "vc-field",
                  label: "Commission fee",
                  variant: "normal",
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
                          label: "Company Registration #",
                          property: "registrationId",
                          placeholder: "Enter registration number",
                          rules: {
                            max: 128,
                          },
                          clearable: true,
                        },
                        {
                          id: "companyOuterId",
                          component: "vc-input",
                          label: "Company Outer Id",
                          property: "outerId",
                          placeholder: "Enter outer Id",
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
                      rules: {
                        mindimensions: [120, 120],
                        fileWeight: 1024,
                      },
                      actions: {
                        preview: true,
                        edit: false,
                        remove: true,
                      },
                      hideAfterUpload: true,
                    },
                  ],
                },
                {
                  id: "aboutCompany",
                  component: "vc-textarea",
                  label: "About company",
                  placeholder: "Please enter value",
                  property: "description",
                  clearable: true,
                },
                {
                  id: "deliveryTime",
                  component: "vc-textarea",
                  label: "Average Delivery Time",
                  placeholder: "Please enter value",
                  property: "deliveryTime",
                  clearable: true,
                },
              ],
            },
            {
              id: "basicInfoCard",
              component: "vc-card",
              label: "Company address",
              fields: [
                {
                  id: "companyAddressFirst",
                  component: "vc-fieldset",
                  columns: 2,
                  fields: [
                    {
                      id: "country",
                      component: "vc-select",
                      label: "Country",
                      property: "addresses[0].countryCode",
                      placeholder: "Select country",
                      optionsMethod: "countriesList",
                      optionValue: "id",
                      optionLabel: "name",
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
                      placeholder: "Enter postal/zip code",
                      label: "Postal/ZIP code",
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
                      label: "State/Province",
                      property: "addresses[0].regionId",
                      optionsMethod: "regionsList",
                      optionValue: "id",
                      optionLabel: "name",
                      update: {
                        method: "setRegion",
                      },
                    },
                    {
                      id: "city",
                      component: "vc-input",
                      placeholder: "Enter value",
                      label: "City",
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
                  label: "Address line 1",
                  placeholder: "Enter value",
                  rules: {
                    required: true,
                    max: 128,
                  },
                },
                {
                  id: "addressLine2",
                  component: "vc-input",
                  property: "addresses[0].line2",
                  label: "Address line 1",
                  placeholder: "Enter value",
                  rules: {
                    max: 128,
                  },
                },
                {
                  id: "location",
                  component: "vc-input",
                  property: "location",
                  label: "Location (latitude & longitude)",
                  placeholder: "Enter value",
                  rules: {
                    max: 512,
                    regex:
                      /^([-+]?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?)),\s*([-+]?(?:180(?:\.0+)?|(?:(?:1[0-7]\d)|(?:[1-9]?\d))(?:\.\d+)?))$/,
                  },
                  tooltip: "Enter longitude and latitude separated by comma, eg: 34.059761, -118.276802",
                },
                {
                  id: "contactInfo",
                  component: "vc-fieldset",
                  columns: 2,
                  fields: [
                    {
                      id: "phone",
                      component: "vc-input",
                      label: "Contact Phone Number",
                      placeholder: "Enter value",
                      rules: {
                        max: 64,
                      },
                      property: "phones[0]",
                      variant: "number",
                    },
                    {
                      id: "email",
                      component: "vc-input",
                      label: "Contact E-mail Address",
                      placeholder: "Enter value",
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
