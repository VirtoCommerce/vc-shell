import { OverridesSchema } from "@vc-shell/framework";

export const overrides: OverridesSchema = {
  upsert: [
    {
      id: "ProductsJ",
      path: "settings.url",
      value: "/mp-products",
    },
    {
      id: "ProductsJ",
      path: "settings.id",
      value: "MpProducts",
    },
    {
      id: "ProductsJ",
      path: "settings.titleTemplate",
      value: "Marketplace Products",
    },
    {
      id: "ProductsJ",
      path: "content[0].multiselect",
      value: false,
    },
    {
      id: "ProductsJ",
      path: "settings.permissions",
      value: "seller:products:search_from_all_sellers",
    },
    {
      id: "ProductJ",
      path: "settings.url",
      value: "/mp-product",
    },
    {
      id: "ProductJ",
      path: "settings.id",
      value: "MpProduct",
    },
    {
      id: "ProductJ",
      path: "settings.titleTemplate",
      value: "Marketplace Product",
    },
    {
      id: "ProductJ",
      path: "settings.permissions",
      value: "seller:products:search_from_all_sellers",
    },
  ],
  remove: [
    {
      id: "ProductsJ",
      path: "settings.toolbar[3]",
    },
    {
      id: "ProductsJ",
      path: "content[0].filter",
    },
  ],
};
