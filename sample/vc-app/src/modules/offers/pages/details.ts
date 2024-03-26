import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    url: "/offer",
    routable: false,
    id: "Offer",
    localizationPrefix: "Offers",
    composable: "useOfferDetails",
    component: "DynamicBladeForm",
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
      component: "vc-form",
      children: [
        {
          id: "productId",
          component: "vc-select",
          label: "Product",
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
          component: "vc-card",
          label: "Inventory",
          fields: [
            {
              id: "sku",
              component: "vc-input",
              label: "SKU",
              property: "sku",
              rules: {
                required: true,
              },
            },
            {
              id: "trackInventory",
              component: "vc-checkbox",
              property: "trackInventory",
              content: "Always in stock",
              trueValue: false,
              falseValue: true,
              label: "Quantity in stock",
            },
            {
              id: "inventoryFieldset",
              component: "vc-fieldset",
              property: "inventory",
              fields: [
                {
                  id: "InStockQuantity",
                  component: "vc-input",
                  property: "inStockQuantity",
                  label: "{fulfillmentCenterName}",
                  placeholder: "Product current quantity",
                  clearable: true,
                  variant: "number",
                  rules: {
                    required: true,
                    bigint: true,
                    min_value: 0,
                  },
                  disabled: { method: "trackInventoryFn" },
                },
              ],
            },
          ],
        },
        {
          id: "propertiesCard",
          component: "vc-card",
          label: "Properties",
          fields: [
            {
              id: "dynamicProps",
              component: "vc-dynamic-properties",
              property: "properties",
              include: ["Variation"],
            },
          ],
        },
        {
          id: "pricingCard",
          component: "vc-card",
          label: "Pricing",
          action: {
            id: "addPrice",
            component: "vc-button",
            content: "Add price",
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
                  label: "List price",
                  property: "listPrice",
                  placeholder: "Set list price",
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
                  label: "Sales price",
                  property: "salePrice",
                  placeholder: "Set product sales price",
                  options: "currencies",
                  optionProperty: "currency",
                  optionValue: "value",
                  optionLabel: "title",
                },
                {
                  id: "minQuantity",
                  component: "vc-input",
                  label: "Minimum quantity",
                  property: "minQuantity",
                  placeholder: "Enter product minimal quantity in order",
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
          label: "Validity dates",
          fields: [
            {
              id: "validityDatesFieldset",
              component: "vc-fieldset",
              columns: 2,
              fields: [
                {
                  id: "startDate",
                  component: "vc-input",
                  label: "Validity from",
                  variant: "datetime-local",
                  property: "startDate",
                  rules: { before: "@endDate" },
                },
                {
                  id: "endDate",
                  component: "vc-input",
                  label: "Validity to",
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
          component: "vc-card",
          label: "Gallery",
          collapsible: true,
          fields: [
            {
              id: "imagesGallery",
              component: "vc-gallery",
              property: "images",
            },
          ],
        },
      ],
    },
  ],
};
