import StoreList from "./components/StoreList.vue";
import StoreDetails from "./components/StoreDetails.vue";

export { StoreList, StoreDetails };

export const routes = {
  extStoreList: {
    url: "/store",
    component: StoreList,
  },
  extStoreDetails: {
    url: "/store/:id",
    component: StoreDetails,
  },
};
