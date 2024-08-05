import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    id: "FulfillmentCenterDetails",
    component: "DynamicBladeForm",
    localizationPrefix: "FULFILLMENT_CENTERS",
    composable: "useFulfillmentCenter",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.SAVE",
        method: "saveChanges",
      },
      {
        id: "reset",
        icon: "fas fa-undo",
        title: "FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.RESET",
        method: "reset",
      },
      {
        id: "delete",
        icon: "fas fa-trash",
        title: "FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.DELETE",
        method: "remove",
      },
    ],
  },
  content: [
    {
      id: "fulfillmentCenterForm",
      component: "vc-form",
      children: [
        {
          id: "name",
          component: "vc-input",
          label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NAME.LABEL",
          property: "name",
          placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NAME.PLACEHOLDER",
          rules: { required: true },
        },
        {
          id: "outerId",
          component: "vc-input",
          label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.OUTER_ID.LABEL",
          property: "outerId",
          placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.OUTER_ID.PLACEHOLDER",
          rules: {},
        },
        {
          id: "shortDesc",
          component: "vc-textarea",
          label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.SHORT_DESC.LABEL",
          property: "shortDescription",
          placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.SHORT_DESC.PLACEHOLDER",
          rules: {
            max: 256,
          },
        },
        {
          id: "description",
          component: "vc-textarea",
          label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.DESCRIPTION.LABEL",
          property: "description",
          placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.DESCRIPTION.PLACEHOLDER",
          rules: {
            max: 1024,
          },
        },
        {
          id: "addressCard",
          component: "vc-card",
          label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.TITLE",
          fields: [
            {
              id: "addressFirst",
              component: "vc-fieldset",
              columns: 2,
              fields: [
                {
                  id: "country",
                  component: "vc-select",
                  label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.COUNTRY.LABEL",
                  property: "address.countryCode",
                  placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.COUNTRY.PLACEHOLDER",
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
                  placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.ZIP.PLACEHOLDER",
                  label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.ZIP.LABEL",
                  property: "address.postalCode",
                  rules: {
                    required: true,
                    max: 32,
                  },
                },
              ],
            },
            {
              id: "addressSecond",
              component: "vc-fieldset",
              columns: 2,
              fields: [
                {
                  id: "state",
                  component: "vc-select",
                  label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.STATE.LABEL",
                  placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.STATE.PLACEHOLDER",
                  property: "address.regionId",
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
                  placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.CITY.PLACEHOLDER",
                  label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.CITY.LABEL",
                  rules: {
                    required: true,
                    max: 128,
                  },
                  property: "address.city",
                },
              ],
            },
            {
              id: "addressLine1",
              component: "vc-input",
              property: "address.line1",
              label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.ADDRESS_1.LABEL",
              placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.ADDRESS_1.PLACEHOLDER",
              rules: {
                required: true,
                max: 128,
              },
            },
            {
              id: "addressLine2",
              component: "vc-input",
              property: "address.line2",
              label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.ADDRESS_2.LABEL",
              placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.ADDRESS_2.PLACEHOLDER",
              rules: {
                max: 128,
              },
            },
            {
              id: "contactInfo",
              component: "vc-fieldset",
              columns: 2,
              fields: [
                {
                  id: "phone",
                  component: "vc-input",
                  label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.PHONE.LABEL",
                  placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.PHONE.PLACEHOLDER",
                  rules: {
                    max: 64,
                  },
                  property: "address.phone",
                },
                {
                  id: "email",
                  component: "vc-input",
                  label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.EMAIL.LABEL",
                  placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.CARDS.ADDRESS.FORM.EMAIL.PLACEHOLDER",
                  rules: {
                    max: 256,
                    email: true,
                  },
                  property: "address.email",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
