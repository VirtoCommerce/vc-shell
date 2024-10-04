import * as Offers from "./offers";
import * as Settings from "./settings";
import * as Products from "./products";
import * as MarketplaceProducts from "./mp-products";
import * as Videos from "./videos";
import * as SellerDetails from "./seller-details";
import * as Team from "./team";
import * as FulfillmentCenters from "./fulfillment-centers";
import * as Orders from "./orders";
import * as Common from "./common";

import {
  type OrderScope,
  type OrdersListScope,
  type ShippingScope,
  type ShippingDetailsScope,
  type ShippingItemScope,
} from "./orders/composables";

import { type FulfillmentCenterScope, type FulfillmentCentersScope } from "./fulfillment-centers/composables";

import {
  type OffersListScope,
  type OfferDetailsScope,
  type SpecialPricesListScope,
  type SpecialPricesDetailsScope,
} from "./offers/composables";

import { type ProductDetailsScope, type ProductListScope } from "./products/composables";

import { type ProductsListExtendedScope } from "./mp-products/composables";

import { type VideosListScope, type VideoDetailsScope } from "./videos/composables";

import { type SellerDetailsScope } from "./seller-details/composables";

import { type TeamDetailsScope, type TeamListScope } from "./team/composables";

import { type IUseDynamicProperties, type IUseMultilanguage, type IUseRoles } from "./common";

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

export { Common };

export type {
  OrderScope,
  OrdersListScope,
  ShippingScope,
  ShippingDetailsScope,
  ShippingItemScope,
  FulfillmentCenterScope,
  FulfillmentCentersScope,
  OffersListScope,
  OfferDetailsScope,
  SpecialPricesListScope,
  SpecialPricesDetailsScope,
  ProductDetailsScope,
  ProductListScope,
  ProductsListExtendedScope,
  VideosListScope,
  VideoDetailsScope,
  SellerDetailsScope,
  TeamDetailsScope,
  TeamListScope,
  IUseDynamicProperties,
  IUseMultilanguage,
  IUseRoles,
};

export * from "./types";
