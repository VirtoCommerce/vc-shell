import type { ICommonAsset } from "@vc-shell/framework";

export interface IOfferListItem {
  id: string;
  productImage?: string;
  productName: string;
  createdDate: string | Date;
  sku: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface IOfferDetails {
  id?: string;
  productId: string;
  name: string;
  productType: "Physical" | "Digital";
  sku: string;
  trackInventory: boolean;
  fulfillmentCenterQuantities: Record<string, number>;
  images?: ICommonAsset[];
  isActive?: boolean;
  isDefault?: boolean;
  createdDate?: string | Date;
  modifiedDate?: string | Date;
}

export interface SearchOffersQuery {
  skip?: number;
  take?: number;
  keyword?: string;
  sort?: string;
  productName?: string;
  sku?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface SearchOffersResult {
  results: IOfferListItem[];
  totalCount: number;
}

export interface CreateNewOfferCommand {
  name: string;
  productId: string;
  productType: string;
  sku: string;
  trackInventory?: boolean;
  fulfillmentCenterQuantities?: Record<string, number>;
}

export interface UpdateOfferCommand {
  id: string;
  name?: string;
  productId?: string;
  productType?: string;
  sku?: string;
  trackInventory?: boolean;
  fulfillmentCenterQuantities?: Record<string, number>;
  isActive?: boolean;
}

export interface ValidateOfferQuery {
  sku: string;
  id?: string;
}

export interface ValidationFailure {
  propertyName: string;
  errorMessage: string;
}

export interface ValidateOfferResult {
  isValid: boolean;
  errors?: ValidationFailure[];
}

export interface BulkOffersDeleteCommand {
  ids: string[];
}

export interface ChangeOfferDefaultCommand {
  offerId: string;
}

export interface SearchProductsForNewOfferQuery {
  keyword: string;
  take?: number;
  skip?: number;
}

export interface IProduct {
  id: string;
  name: string;
  code: string;
  imgSrc?: string;
}

export interface IFulfillmentCenter {
  id: string;
  name: string;
}

export interface ILanguage {
  code: string;
  name: string;
}

export interface IMarketplaceSettings {
  allowDefault: boolean;
}
