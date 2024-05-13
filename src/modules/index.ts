import * as Offers from "./offers";
import * as Settings from "./settings";
import * as Products from "./products";
import * as MarketplaceProducts from "./mp-products";
import * as Videos from "./videos";
import * as SellerDetails from "./seller-details";
import * as Team from "./team";
import * as FulfillmentCenters from "./fulfillment-centers";
import * as Orders from "./orders";
import * as Rating from "./rating";

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
  Rating,
};

const dashboardCardComponents = {
  orders: Orders.components.OrdersDashboardCard,
  reviews: Rating.components.RatingDashboardCard,
  products: Products.components.ProductsDashboardCard,
  offers: Offers.components.OffersDashboardCard,
};

export { dashboardCardComponents };

export * from "./types";
