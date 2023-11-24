import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    url: "/product",
    id: "Product",
    titleTemplate: "Product details",
    localizationPrefix: "Products",
    composable: "useProductDetails",
    component: "DynamicBladeForm",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "Save",
        method: "saveChanges",
      },
      {
        id: "saveAndSendToApprove",
        icon: "fas fa-share-square",
        title: "Send changes to approve",
        method: "saveAndSendToApprove",
      },
      {
        id: "revertStagedChanges",
        icon: "fas fa-undo",
        title: "Revert staged changes",
        method: "revertStagedChanges",
      },
      {
        id: "delete",
        icon: "fas fa-trash",
        title: "Delete",
        method: "remove",
      },
    ],
    status: {
      component: "MpProductStatus",
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
          title: "Decline reason",
          iconVariant: "danger",
          content: {
            method: "statusText",
          },
          visibility: {
            method: "declineReasonVisibility",
          },
        },
        {
          id: "productType",
          component: "vc-select",
          label: "Product type",
          property: "productType",
          optionValue: "value",
          optionLabel: "label",
          optionsMethod: "productTypeOptions",
          tooltip: "Product type: Physical or Digital",
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
          label: "Product name",
          property: "name",
          placeholder: "Enter product name",
          rules: {
            required: true,
          },
        },
        {
          id: "categoryId",
          component: "vc-select",
          label: "Select category",
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
          id: "propertiesCard",
          component: "vc-card",
          label: "Properties",
          collapsible: true,
          visibility: {
            method: "propertiesCardVisibility",
          },
          fields: [
            {
              id: "gtin",
              component: "vc-input",
              label: "GTIN",
              property: "gtin",
              placeholder: "Enter product identifier",
              rules: {
                required: true,
                min: 3,
              },
              update: {
                method: "validateGtin",
              },
            },
            {
              id: "description",
              component: "vc-editor",
              label: "Description",
              property: "description",
              placeholder: "Enter product description",
              multilanguage: true,
              rules: {
                required: true,
              },
            },
            {
              id: "productDynamicProperties",
              component: "vc-dynamic-properties",
              property: "properties",
              exclude: ["Category", "Variation"],
            },
          ],
        },
        {
          id: "productGalleryCard",
          component: "vc-card",
          label: "Gallery",
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
      ],
    },
    {
      id: "productWidgets",
      component: "vc-widgets",
      children: ["OffersWidget", "VideosWidget", "AssetsWidget"],
    },
  ],
};
