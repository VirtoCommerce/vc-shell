import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    url: "/offer-j",
    name: "OfferJ",
    localizationPrefix: "Offers",
    titleTemplate: "Offer details",
    composable: "useOfferDetails",
    template: "DynamicBladeForm",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "Save",
        method: "saveChanges",
      },
      {
        id: "enable",
        icon: "fa fa-eye",
        title: "Enable",
        method: "enable",
      },
      {
        id: "disable",
        icon: "fa fa-eye-slash",
        title: "Disable",
        method: "disable",
      },
      {
        id: "delete",
        icon: "fas fa-trash",
        title: "Delete",
        method: "remove",
      },
    ],
  },
  content: [
    {
      id: "offersForm",
      type: "form",
      children: [
        {
          id: "productSelect",
          type: "select",
          label: "Product",
          name: "product",
          property: "productId",
          optionValue: "id",
          optionLabel: "name",
          optionsMethod: "fetchProducts",
          rules: {
            required: true,
          },
          customTemplate: {
            component: "OfferProductsSelectCategoryTemplate",
          },
        },
        {
          id: "inventoryCard",
          type: "card",
          label: "Inventory",
          fields: [
            {
              id: "skuInput",
              type: "input",
              label: "SKU",
              name: "sku",
              property: "sku",
              rules: {
                required: true,
              },
            },
            {
              id: "quantityCheckbox",
              type: "checkbox",
              property: "trackInventory",
              content: "Always in stock",
              trueValue: false,
              falseValue: true,
              label: "Quantity in stock",
              name: "trackInventory",
            },
            {
              id: "inventoryFieldset",
              type: "fieldset",
              property: "inventory",
              fields: [
                {
                  id: "inStockQuantityInput",
                  type: "input",
                  property: "inStockQuantity",
                  name: "InStockQuantity",
                  label: "{fulfillmentCenterName}",
                  placeholder: "Product current quantity",
                  clearable: true,
                  variant: "number",
                  rules: {
                    required: true,
                    bigint: true,
                    min_value: 0,
                  },
                  disabled: { method: "trackInventory" },
                },
              ],
            },
          ],
        },
        {
          id: "propertiesCard",
          type: "card",
          label: "Properties",
          fields: [
            {
              id: "dynamicProps",
              type: "dynamic-properties",
              label: "Properties",
              property: "properties",
              include: ["Variation"],
            },
          ],
        },
        {
          id: "pricingCard",
          type: "card",
          label: "Pricing",
          action: {
            id: "addPriceButton",
            type: "button",
            content: "Add price",
            small: true,
            method: "addPrice",
            name: "addPrice",
          },
          fields: [
            {
              id: "pricesFieldset",
              type: "fieldset",
              property: "prices",
              columns: 3,
              remove: {
                method: "removePrice",
              },
              fields: [
                {
                  id: "listPriceInputCurrency",
                  type: "input-currency",
                  label: "List price",
                  property: "listPrice",
                  placeholder: "Set list price",
                  optionProperty: "currency",
                  optionValue: "value",
                  optionLabel: "title",
                  rules: {
                    required: true,
                    min_value: 0,
                  },
                  name: "listPrice",
                },
                {
                  id: "salePriceInputCurrency",
                  type: "input-currency",
                  label: "Sales price",
                  property: "salePrice",
                  placeholder: "Set product sales price",
                  optionProperty: "currency",
                  optionValue: "value",
                  optionLabel: "title",
                  name: "salePrice",
                },
                {
                  id: "minQuantityInput",
                  type: "input",
                  label: "Minimum quantity",
                  property: "minQuantity",
                  placeholder: "Enter product minimal quantity in order",
                  clearable: true,
                  rules: {
                    required: true,
                    min_value: 0,
                  },
                  name: "minQuantity",
                  variant: "number",
                },
              ],
            },
          ],
        },
        {
          id: "validityDatesCard",
          type: "card",
          label: "Validity dates",
          fields: [
            {
              id: "validityDatesFieldset",
              type: "fieldset",
              label: "Validity dates",
              columns: 2,
              fields: [
                {
                  id: "validityFromInput",
                  type: "input",
                  label: "Validity from",
                  name: "startDate",
                  variant: "datetime-local",
                  property: "startDate",
                  rules: { before: "@endDate" },
                },
                {
                  id: "validityToInput",
                  type: "input",
                  label: "Validity to",
                  name: "endDate",
                  variant: "datetime-local",
                  property: "endDate",
                  rules: { after: "@startDate" },
                },
              ],
            },
          ],
        },
        {
          id: "galleryCard",
          type: "card",
          label: "Gallery",
          collapsible: true,
          fields: [
            {
              id: "imagesGallery",
              type: "gallery",
              property: "images",
              uploadFolder: "offers",
            },
          ],
        },
      ],
    },
  ],
};
