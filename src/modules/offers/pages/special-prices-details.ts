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
          property: "name",
        },
        {
          id: "pricingCard",
          component: "vc-card",
          label: "OFFERS.PAGES.DETAILS.FIELDS.PRICING.TITLE",
          action: {
            id: "addPrice",
            component: "vc-button",
            content: "OFFERS.PAGES.DETAILS.FIELDS.PRICING.ADD_PRICE",
            small: true,
            method: "addPrice",
          },
          fields: [
            {
              id: "pricesFieldset",
              component: "vc-fieldset",
              property: "prices",
              columns: 3,
              remove: {
                method: "removePrice",
              },
              fields: [
                {
                  id: "listPrice",
                  component: "vc-input-currency",
                  label: "OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.TITLE",
                  property: "listPrice",
                  placeholder: "OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.PLACEHOLDER",
                  options: "currencies",
                  optionProperty: "currency",
                  optionValue: "value",
                  optionLabel: "title",
                  rules: {
                    required: true,
                    min_value: 0,
                  },
                },
                {
                  id: "salePrice",
                  component: "vc-input-currency",
                  label: "OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.TITLE",
                  property: "salePrice",
                  placeholder: "OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.PLACEHOLDER",
                  options: "currencies",
                  optionProperty: "currency",
                  optionValue: "value",
                  optionLabel: "title",
                },
                {
                  id: "minQuantity",
                  component: "vc-input",
                  label: "OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.TITLE",
                  property: "minQuantity",
                  placeholder: "OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.PLACEHOLDER",
                  clearable: true,
                  rules: {
                    required: true,
                    min_value: 0,
                  },
                  variant: "number",
                },
              ],
            },
          ],
        },
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
                  rules: { before: "@endDate" },
                },
                {
                  id: "endDate",
                  component: "vc-input",
                  label: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.DATES.VALID_TO",
                  variant: "datetime-local",
                  property: "endDate",
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
            },
          ],
        },
      ],
    },
  ],
};
