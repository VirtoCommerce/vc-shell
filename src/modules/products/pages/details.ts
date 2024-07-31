import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    url: "/product",
    id: "Product",
    localizationPrefix: "Products",
    composable: "useProductDetails",
    component: "DynamicBladeForm",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE",
        method: "saveChanges",
      },
      {
        id: "saveAndSendToApprove",
        icon: "fas fa-share-square",
        title: "PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVEANDAPPROVE",
        method: "saveAndSendToApprove",
      },
      {
        id: "revertStagedChanges",
        icon: "fas fa-undo",
        title: "PRODUCTS.PAGES.DETAILS.TOOLBAR.REVERT",
        method: "revertStagedChanges",
      },
      {
        id: "saveAndPublish",
        icon: "fas fa-save",
        title: "PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVEANDPUBLISH",
        method: "saveAndPublish",
      },
      {
        id: "delete",
        icon: "fas fa-trash",
        title: "PRODUCTS.PAGES.DETAILS.TOOLBAR.DELETE",
        method: "remove",
      },
    ],
    status: {
      component: "ProductPublishedStatus",
    },
  },
  content: [
    {
      id: "productForm",
      component: "vc-form",
      children: [
        {
          id: "declineStatus",
          component: "vc-status",
          outline: false,
          extend: true,
          variant: "light-danger",
          icon: "fas fa-exclamation-circle",
          iconSize: "xxl",
          title: "PRODUCTS.PAGES.DETAILS.DECLINE_REASON",
          iconVariant: "danger",
          content: {
            method: "statusText",
          },
          visibility: {
            method: "declineReasonVisibility",
          },
        },
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
          id: "productType",
          component: "vc-select",
          label: "PRODUCTS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.TITLE",
          property: "productType",
          optionValue: "value",
          optionLabel: "label",
          optionsMethod: "productTypeOptions",
          tooltip: "PRODUCTS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.TOOLTIP",
          rules: {
            required: true,
          },
          disabled: {
            method: "productTypeDisabled",
          },
        },
        {
          id: "name",
          component: "vc-input",
          label: "PRODUCTS.PAGES.DETAILS.FIELDS.NAME.TITLE",
          property: "name",
          placeholder: "PRODUCTS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER",
          rules: {
            required: true,
          },
        },
        {
          id: "categoryId",
          component: "vc-select",
          label: "PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TITLE",
          tooltip: "PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TOOLTIP",
          placeholder: "PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.PLACEHOLDER",
          property: "categoryId",
          optionValue: "id",
          optionLabel: "name",
          optionsMethod: "fetchCategories",
          update: { method: "setCategory" },
          emitValue: false,
          searchable: true,
          rules: {
            required: true,
          },
          customTemplate: {
            component: "ProductsSelectCategoryTemplate",
          },
        },
        {
          id: "productGalleryCard",
          component: "vc-card",
          label: "PRODUCTS.PAGES.DETAILS.FIELDS.IMAGES.TITLE",
          visibility: {
            method: "galleryVisibility",
          },
          fields: [
            {
              id: "productGallery",
              component: "vc-gallery",
              property: "images",
              multiple: true,
            },
          ],
        },
        {
          id: "propertiesCard",
          component: "vc-card",
          label: "PRODUCTS.PAGES.DETAILS.FIELDS.TITLE",
          collapsible: true,
          visibility: {
            method: "propertiesCardVisibility",
          },
          fields: [
            {
              id: "gtin",
              component: "vc-input",
              label: "PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TITLE",
              tooltip: "PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TOOLTIP",
              property: "gtin",
              placeholder: "PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.PLACEHOLDER",
              rules: {
                required: true,
                min: 3,
              },
              update: {
                method: "validateGtin",
              },
              maxlength: 61,
            },
            {
              id: "description",
              component: "vc-editor",
              label: "PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE",
              property: "computedDescription",
              placeholder: "PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER",
              multilanguage: true,
              rules: {
                required: true,
              },
              assetsFolder: "catalog",
            },
            {
              id: "productDynamicProperties",
              component: "vc-dynamic-properties",
              property: "properties",
              exclude: ["Category", "Variation"],
            },
          ],
        },
      ],
    },
    {
      id: "productWidgets",
      component: "vc-widgets",
      children: ["OffersWidget", "VideosWidget", "AssetsWidget", "AssociationsWidget"],
    },
  ],
};
