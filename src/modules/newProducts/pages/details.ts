import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    url: "/product-j",
    name: "ProductJ",
    titleTemplate: "Product details",
    localizationPrefix: "Products",
    composable: "useProductDetails",
    template: "DynamicBladeForm",
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
      type: "form",
      children: [
        {
          id: "productTypeSelect",
          type: "select",
          label: "Product type",
          property: "productType",
          name: "productType",
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
          id: "productName",
          type: "input",
          label: "Product name",
          property: "name",
          name: "name",
          placeholder: "Enter product name",
          rules: {
            required: true,
          },
        },
        {
          id: "selectCategory",
          type: "select",
          label: "Select category",
          property: "categoryId",
          name: "categoryId",
          optionValue: "id",
          optionLabel: "name",
          optionsMethod: "fetchCategories",
          update: { method: "setCategory" },
          emitValue: false,
          rules: {
            required: true,
          },
          customTemplate: {
            component: "ProductsSelectCategoryTemplate",
          },
        },
        {
          id: "propertiesCard",
          type: "card",
          label: "Properties",
          collapsible: true,
          visibility: {
            method: "propertiesCardVisibility",
          },
          fields: [
            {
              id: "gtinInput",
              type: "input",
              label: "GTIN",
              name: "gtin",
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
              id: "descriptionEditor",
              type: "editor",
              label: "Description",
              name: "description",
              property: "description.content",
              placeholder: "Enter product description",
              multilanguage: true,
              rules: {
                required: true,
              },
            },
            {
              id: "productDynamicProperties",
              type: "dynamic-properties",
              label: "Dynamic",
              property: "properties",
              exclude: ["Category", "Variation"],
            },
          ],
        },
        {
          id: "productGalleryCard",
          type: "card",
          label: "Gallery",
          visibility: {
            method: "galleryVisibility",
          },
          fields: [
            {
              id: "productGallery",
              type: "gallery",
              property: "images",
              uploadFolder: "catalog",
            },
          ],
        },
      ],
    },
    {
      id: "productWidgets",
      type: "widgets",
      children: ["OffersWidget", "AssetsWidget"],
    },
  ],
};
