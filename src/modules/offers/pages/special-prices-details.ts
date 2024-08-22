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
        {
          id: "pricingCard",
          component: "vc-card",
          removePadding: true,
          label: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.PRICING.TITLE",
          fields: [
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
              actions: [
                {
                  id: "deleteItem",
                  icon: "fas fa-trash",
                  title: "PRODUCTS.PAGES.LIST.TABLE.ACTIONS.DELETE",
                  type: "danger",
                  position: "left",
                  method: "removePrice",
                },
              ],
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
                    min_value: 1,
                    required: true,
                  },
                  editable: true,
                  type: "number",
                  class: "!tw-text-left",
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
              id: "validityDates",
              component: "vc-input",
              label: "SPECIAL_PRICES.PAGES.DETAILS.FIELDS.DATES.VALIDITY_DATES",
              variant: "datetime-local",
              property: "datesComputed",
              clearable: true,
              datePickerOptions: {
                multiCalendars: true,
                range: true,
              },
            },
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
