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
        title: "OFFERS.PAGES.DETAILS.TOOLBAR.SAVE",
        method: "saveChanges",
      },
      {
        id: "enable",
        icon: "fa fa-eye",
        title: "OFFERS.PAGES.DETAILS.TOOLBAR.ENABLE",
        method: "enable",
      },
      {
        id: "disable",
        icon: "fa fa-eye-slash",
        title: "OFFERS.PAGES.DETAILS.TOOLBAR.DISABLE",
        method: "disable",
      },
      {
        id: "setDefault",
        icon: "fas fa-marker",
        title: "OFFERS.PAGES.DETAILS.TOOLBAR.DEFAULT",
        method: "setDefault",
      },
      {
        id: "delete",
        icon: "fas fa-trash",
        title: "OFFERS.PAGES.DETAILS.TOOLBAR.DELETE",
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
          label: "OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.TITLE",
          placeholder: "OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.PLACEHOLDER",
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
          searchable: true,
          update: {
            method: "getProductItem",
          },
          disabled: {
            method: "disableProductSelect",
          },
        },
        {
          id: "inventoryCard",
          component: "vc-card",
          label: "OFFERS.PAGES.DETAILS.FIELDS.INVENTORY.TITLE",
          fields: [
            {
              id: "sku",
              component: "vc-input",
              label: "OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE",
              property: "sku",
              rules: {
                required: true,
              },
            },
            {
              id: "trackInventory",
              component: "vc-checkbox",
              property: "trackInventory",
              content: "OFFERS.PAGES.DETAILS.FIELDS.ALWAYS_IN_STOCK.TITLE",
              trueValue: false,
              falseValue: true,
              label: "OFFERS.PAGES.DETAILS.FIELDS.QTY.TITLE",
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
                  placeholder: "OFFERS.PAGES.DETAILS.FIELDS.AVAIL_QTY.PLACEHOLDER",
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
          label: "OFFERS.PAGES.DETAILS.FIELDS.PROPERTIES.TITLE",
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
          label: "OFFERS.PAGES.DETAILS.FIELDS.DATES.TITLE",
          fields: [
            {
              id: "validityDatesFieldset",
              component: "vc-fieldset",
              columns: 2,
              fields: [
                {
                  id: "startDate",
                  component: "vc-input",
                  label: "OFFERS.PAGES.DETAILS.FIELDS.DATES.VALID_FROM",
                  variant: "datetime-local",
                  property: "startDate",
                  rules: { before: "@endDate" },
                },
                {
                  id: "endDate",
                  component: "vc-input",
                  label: "OFFERS.PAGES.DETAILS.FIELDS.DATES.VALID_TO",
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
          label: "OFFERS.PAGES.DETAILS.FIELDS.GALLERY.TITLE",
          collapsible: true,
          fields: [
            {
              id: "imagesGallery",
              component: "vc-gallery",
              property: "images",
              multiple: true,
            },
          ],
        },
      ],
    },
  ],
};
