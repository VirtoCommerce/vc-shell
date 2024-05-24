import { DynamicDetailsSchema } from "@vc-shell/framework";

export const specialPricesDetails: DynamicDetailsSchema = {
  settings: {
    routable: false,
    id: "SpecialPriceDetails",
    localizationPrefix: "SPECIAL_PRICES",
    composable: "useSpecialPriceDetails",
    component: "DynamicBladeForm",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "SPECIAL_PRICES.PAGES.DETAILS.TOOLBAR.SAVE",
        method: "saveChanges",
      },
      {
        id: "delete",
        icon: "fas fa-trash",
        title: "SPECIAL_PRICES.PAGES.DETAILS.TOOLBAR.DELETE",
        method: "remove",
      },
    ],
  },
  content: [
    {
      id: "specialPriceForm",
      component: "vc-form",
      children: [
        {
          id: "name",
          component: "vc-input",
          label: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.NAME.TITLE",
          placeholder: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER",
          property: "name",
        },
        // {
        //   id: "pricingCard",
        //   component: "vc-card",
        //   label: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.PRICING.TITLE",
        //   fields: [
        {
          id: "pricesTable",
          component: "vc-table",
          property: "prices",
          emptyTemplate: {
            component: "EmptyPricesTableTemplate",
          },
          addNewRowButton: {
            show: true,
            title: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.PRICING.ADD_PRICE",
            method: "addPrice",
          },
          removeRowButton: {
            show: true,
            method: "removePrice",
          },
          columns: [
            {
              id: "currency",
              title: "Currency",
              customTemplate: {
                component: "CurrenciesGridTemplate",
              },
              width: "100px",
            },
            {
              id: "listPrice",
              title: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.LIST_PRICE.TITLE",
              type: "money",
              rules: {
                min_value: 0,
                required: true,
              },
              editable: true,
              currencyField: "currency",
            },
            {
              id: "salePrice",
              title: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.SALE_PRICE.TITLE",
              type: "money",
              rules: {
                min_value: 0,
              },
              editable: true,
              currencyField: "currency",
            },
            {
              id: "minQuantity",
              title: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.MIN_QTY.TITLE",
              rules: {
                min_value: 0,
                required: true,
              },
              editable: true,
              type: "number",
              class: "!tw-text-left",
            },
          ],
        },
        //   ],
        // },
        {
          id: "validityDatesCard",
          component: "vc-card",
          label: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.DATES.TITLE",
          fields: [
            {
              id: "validityDatesFieldset",
              component: "vc-fieldset",
              columns: 2,
              fields: [
                {
                  id: "startDate",
                  component: "vc-input",
                  label: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.DATES.VALID_FROM",
                  variant: "datetime-local",
                  property: "startDate",
                  clearable: true,
                  rules: { before: "@endDate" },
                },
                {
                  id: "endDate",
                  component: "vc-input",
                  label: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.DATES.VALID_TO",
                  variant: "datetime-local",
                  property: "endDate",
                  clearable: true,
                  rules: { after: "@startDate" },
                },
              ],
            },
          ],
        },
        {
          id: "conditionsCard",
          component: "vc-card",
          label: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.CONDITIONS.TITLE",
          fields: [
            {
              id: "customerGroup",
              component: "vc-multivalue",
              label: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.CUSTOMER_GROUP.TITLE",
              property: "memberIds",
              optionValue: "id",
              optionLabel: "id",
              placeholder: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.CUSTOMER_GROUP.PLACEHOLDER",
            },
          ],
        },
      ],
    },
  ],
};
