/** eslint-disable */
import * as ExtStore from "@virtocommerce/ext-store";

const addons = [ExtStore];
let routes: Record<string, any> = {};

addons.forEach(addon => {
  routes = {
    ...routes,
    ...(addon.routes || {})
  };
});

export { routes };

export const drawer = [
  {
    id: 1,
    title: "Stores",
    icon: "archive",
    ...routes.extStoreList,
    componentOptions: {},
  },
];
