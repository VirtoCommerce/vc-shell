import * as Offers from "./offers";
import * as Settings from "./settings";
import * as Products from "./products";
import * as MarketplaceProducts from "./mp-products";
import * as Videos from "./videos";
import * as SellerDetails from "./seller-details";
import * as Team from "./team";
import * as FulfillmentCenters from "./fulfillment-centers";
import * as Orders from "./orders";

import { type OrderScope } from "./orders/composables";

import "./../styles/index.scss";

export default {
  Offers,
  Orders,
  Settings,
  Products,
  MarketplaceProducts,
  Videos,
  SellerDetails,
  Team,
  FulfillmentCenters,
};

export type { OrderScope };

export * from "./types";
