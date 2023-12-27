import { OverridesSchema } from "@vc-shell/framework";

export const overrides: OverridesSchema = {
  upsert: [
    {
      id: "Products",
      path: "settings.url",
      value: "/mp-products",
    },
    {
      id: "Products",
      path: "settings.id",
      value: "MpProducts",
    },
    {
      id: "Products",
      path: "settings.titleTemplate",
      value: "Marketplace Products",
    },
    {
      id: "Products",
      path: "content[0].multiselect",
      value: false,
    },
    {
      id: "Products",
      path: "settings.permissions",
      value: "seller:products:search_from_all_sellers",
    },
    {
      id: "Product",
      path: "settings.url",
      value: "/mp-product",
    },
    {
      id: "Product",
      path: "settings.id",
      value: "MpProduct",
    },
    {
      id: "Product",
      path: "settings.titleTemplate",
      value: "Marketplace Product",
    },
    {
      id: "Product",
      path: "settings.permissions",
      value: "seller:products:search_from_all_sellers",
    },
    {
      id: "Products",
      path: "settings.menuItem",
      value: {
        title: "PRODUCTS.MENU.MARKETPLACE_PRODUCTS",
        icon: "fas fa-box-open",
        group: "PRODUCTS.MENU.TITLE",
        priority: 2,
      },
    },
  ],
  remove: [
    {
      id: "Products",
      path: "settings.toolbar[3]",
    },
    {
      id: "Products",
      path: "content[0].filter",
    },
  ],
};
