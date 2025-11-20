/**
 * Offers Module Types
 * All TypeScript interfaces and types for the offers management module
 */

// ===== Core Entities =====

export interface IOffer {
  id: string;
  sku: string;
  name?: string;
  productId?: string;
  productType?: "Physical" | "Digital";
  isActive: boolean;
  isDefault: boolean;
  trackInventory?: boolean;
  createdDate: string;
  modifiedDate?: string;
  product?: IProduct;
}

export interface IOfferDetails extends IOffer {
  images?: IImage[];
  inventoryInfo?: IInventoryInfo[];
  priceList?: IOfferPriceList[];
  [key: string]: any;
}

export interface IProduct {
  id: string;
  name: string;
  sku: string;
  imgSrc?: string;
}

export interface IImage {
  id: string;
  url: string;
  name?: string;
  sortOrder?: number;
}

export interface IInventoryInfo {
  fulfillmentCenterId: string;
  fulfillmentCenterName: string;
  inStockQuantity: number;
}

export interface IOfferPriceList {
  id: string;
  pricelistId: string;
  pricelistName?: string;
  price: number;
  currency?: string;
}

// ===== API Query/Command Types =====

export interface SearchOffersQuery {
  skip?: number;
  take?: number;
  sort?: string;
  keyword?: string;
  filter?: Record<string, any>;
}

export interface SearchOffersResult {
  results: IOffer[];
  totalCount: number;
}

export interface CreateNewOfferCommand {
  sku: string;
  name?: string;
  productId: string;
  productType: "Physical" | "Digital";
  trackInventory?: boolean;
  inventoryInfo?: IInventoryInfo[];
}

export interface UpdateOfferCommand {
  id: string;
  sku?: string;
  name?: string;
  productId?: string;
  productType?: "Physical" | "Digital";
  trackInventory?: boolean;
  inventoryInfo?: IInventoryInfo[];
  images?: IImage[];
}

export interface BulkOffersDeleteCommand {
  ids: string[];
}

export interface ValidateOfferQuery {
  sku: string;
  id?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationFailure[];
}

export interface ValidationFailure {
  propertyName: string;
  errorMessage: string;
  errorCode?: string;
}

export interface ChangeOfferDefaultCommand {
  id: string;
}

export interface SearchProductsForNewOfferQuery {
  keyword: string;
  skip?: number;
  take?: number;
}

// ===== Settings and Configuration =====

export interface IMarketplaceSettings {
  allowMultipleOffers: boolean;
}

export interface ILanguage {
  code: string;
  displayName: string;
  isDefault?: boolean;
}

// ===== Fulfillment Centers =====

export interface IFulfillmentCenter {
  id: string;
  name: string;
  description?: string;
}

// ===== Domain Events =====

export interface OfferCreatedDomainEvent {
  offerId: string;
  offerName: string;
  productId: string;
  timestamp: string;
}

export interface OfferDeletedDomainEvent {
  offerId: string;
  timestamp: string;
}

// ===== Widget Props =====

export interface ISpecialPricesWidgetProps {
  offerId: string;
  priceCount: number;
}
