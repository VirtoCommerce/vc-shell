import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    url: "/sample-details",
    id: "SampleDetails",
    localizationPrefix: "SAMPLE_APP",
    composable: "useDetails",
    component: "DynamicBladeForm",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "SAMPLE_APP.PAGES.DETAILS.TOOLBAR.SAVE",
        method: "saveChanges",
      },
      {
        id: "delete",
        icon: "fas fa-trash",
        title: "SAMPLE_APP.PAGES.DETAILS.TOOLBAR.DELETE",
        method: "remove",
      },
    ],
  },
  content: [
    {
      id: "dynamicItemForm",
      component: "vc-form",
      children: [
        {
          id: "name",
          component: "vc-input",
          label: "SAMPLE_APP.PAGES.DETAILS.FIELDS.NAME",
          rules: { required: true },
          property: "name",
        },
        {
          id: "contentCard",
          component: "vc-card",
          label: "SAMPLE_APP.PAGES.DETAILS.FIELDS.CONTENT",
          fields: [
            {
              id: "guid",
              component: "vc-input",
              label: "SAMPLE_APP.PAGES.DETAILS.FIELDS.GUID",
              property: "guid",
              rules: {
                required: true,
                regex: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
              },
            },
            {
              id: "description",
              component: "vc-textarea",
              label: "SAMPLE_APP.PAGES.DETAILS.FIELDS.DESCRIPTION",
              property: "description",
              rules: { required: true },
            },
          ],
        },
        {
          id: "prices",
          component: "vc-card",
          label: "SAMPLE_APP.PAGES.DETAILS.FIELDS.PRICE",
          fields: [
            {
              id: "price-fieldset",
              component: "vc-fieldset",
              columns: 2,
              fields: [
                {
                  id: "price",
                  component: "vc-input-currency",
                  label: "SAMPLE_APP.PAGES.DETAILS.FIELDS.PRICE",
                  property: "price",
                  rules: { required: true },
                  options: "currencyOptions",
                  optionProperty: "currency",
                  optionValue: "value",
                  optionLabel: "label",
                },
                {
                  id: "salePrice",
                  component: "vc-input-currency",
                  label: "SAMPLE_APP.PAGES.DETAILS.FIELDS.SALE_PRICE",
                  property: "salePrice",
                  rules: { required: true },
                  options: "currencyOptions",
                  optionProperty: "currency",
                  optionValue: "value",
                  optionLabel: "label",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
