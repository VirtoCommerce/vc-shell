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
          id: "onCreateNewStatus",
          component: "vc-status",
          extend: true,
          outline: false,
          variant: "info-dark",
          icon: "far fa-lightbulb",
          iconSize: "l",
          content: {
            method: "createNewText",
          },
          visibility: {
            method: "createNewStatusVisibility",
          },
        },
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
          id: "productType",
          component: "vc-select",
          label: "OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.TITLE",
          property: "productType",
          optionValue: "value",
          optionLabel: "label",
          optionsMethod: "productTypeOptions",
          tooltip: "OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.TOOLTIP",
          rules: {
            required: true,
          },
          disabled: {
            method: "productTypeDisabled",
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
                min: 3,
              },
              update: {
                method: "validateSku",
              },
              maxlength: 64,
            },
            {
              id: "trackInventory",
              component: "vc-switch",
              property: "trackInventory",
              tooltip: "OFFERS.PAGES.DETAILS.FIELDS.ALWAYS_IN_STOCK.TITLE",
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
    {
      id: "offerWidgets",
      component: "vc-widgets",
      children: ["SpecialPricesWidget"],
    },
  ],
};
