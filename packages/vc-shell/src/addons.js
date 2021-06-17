import Vue from "vue";
import * as VcUiKit from "@virtocommerce/vc-ui-kit";
import * as VcExtStore from "@virtocommerce/ext-store";
import * as VcExtCatalog from "@virtocommerce/ext-product-catalog";
import * as VcExtAssets from "@virtocommerce/ext-assets-management";

const addons = [VcUiKit, VcExtStore, VcExtCatalog, VcExtAssets];
let routes = {};

const install = function () {
  addons.forEach(addon => {
    addon.default(Vue);
  });
}

addons.forEach(addon => {
  routes = {
    ...routes,
    ...(addon.routes || {})
  };
});

export default install;
export { routes };

export const drawer = [
  {
    id: 1,
    title: "Catalog",
    icon: "folder",
    ...routes.extCatalog,
    componentOptions: {},
  },
  {
    id: 2,
    title: "Assets",
    icon: "image",
    ...routes.extAssets,
    componentOptions: {},
  },
  {
    id: 3,
    title: "Stores",
    icon: "archive",
    ...routes.extStoreList,
    componentOptions: {},
  },
];
