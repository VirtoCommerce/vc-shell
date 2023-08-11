import { offersDetails, offersList } from "./offers";
import { productsDetails, productsList } from "./products";

export const modulesListJSON = [
  {
    list: offersList,
    form: offersDetails,
  },
  {
    list: productsList,
    form: productsDetails,
  },
];
