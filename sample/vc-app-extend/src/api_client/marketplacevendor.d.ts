/* eslint-disable */

export declare class AuthApiBase {
  authToken: string;
  protected constructor();
  getBaseUrl(defaultUrl: string, baseUrl: string): string;
  setAuthToken(token: string): void;
  protected transformOptions(options: any): Promise<any>;
}
export declare class VcmpCommonClient extends AuthApiBase {
  private http;
  private baseUrl;
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
  constructor(
    baseUrl?: string,
    http?: {
      fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    },
  );
  /**
   * @return Success
   */
  getVcmpSettings(): Promise<MarketplaceSettings>;
  protected processGetVcmpSettings(response: Response): Promise<MarketplaceSettings>;
}
export declare class VcmpFeeClient extends AuthApiBase {
  private http;
  private baseUrl;
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
  constructor(
    baseUrl?: string,
    http?: {
      fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    },
  );
  /**
   * @return Success
   */
  getNewFee(): Promise<DynamicCommissionFee>;
  protected processGetNewFee(response: Response): Promise<DynamicCommissionFee>;
  /**
   * @return Success
   */
  getFeeById(id: string): Promise<CommissionFee>;
  protected processGetFeeById(response: Response): Promise<CommissionFee>;
  /**
   * @param body (optional)
   * @return Success
   */
  createFee(body?: CreateFeeCommand | undefined): Promise<CommissionFee>;
  protected processCreateFee(response: Response): Promise<CommissionFee>;
  /**
   * @param body (optional)
   * @return Success
   */
  updateFee(body?: UpdateFeeCommand | undefined): Promise<CommissionFee>;
  protected processUpdateFee(response: Response): Promise<CommissionFee>;
  /**
   * @param ids (optional)
   * @return Success
   */
  deleteFee(ids?: string[] | undefined): Promise<void>;
  protected processDeleteFee(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchFee(body?: SearchCommissionFeesQuery | undefined): Promise<SearchCommissionFeesResult>;
  protected processSearchFee(response: Response): Promise<SearchCommissionFeesResult>;
}
export declare class VcmpSellerCatalogClient extends AuthApiBase {
  private http;
  private baseUrl;
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
  constructor(
    baseUrl?: string,
    http?: {
      fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    },
  );
  /**
   * @param body (optional)
   * @return Success
   */
  massChangeProductsStatus(status: string, body?: SearchProductsQuery | undefined): Promise<void>;
  protected processMassChangeProductsStatus(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  changeProductStatus(body?: ChangeRequestStatusCommand | undefined): Promise<void>;
  protected processChangeProductStatus(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchCategories(body?: SearchCategoriesQuery | undefined): Promise<CategorySearchResult>;
  protected processSearchCategories(response: Response): Promise<CategorySearchResult>;
  /**
   * @param body (optional)
   * @return Success
   */
  validateProduct(body?: ValidateProductQuery | undefined): Promise<ValidationFailure[]>;
  protected processValidateProduct(response: Response): Promise<ValidationFailure[]>;
  /**
   * @param body (optional)
   * @return Success
   */
  createSellerCategories(body?: CreateSellerCategoriesCommand | undefined): Promise<void>;
  protected processCreateSellerCategories(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  deleteSellerCategories(body?: DeleteSellerCategoriesCommand | undefined): Promise<void>;
  protected processDeleteSellerCategories(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  exportSellerCategories(body?: RunCategoriesExportCommand | undefined): Promise<void>;
  protected processExportSellerCategories(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchProducts(body?: SearchProductsQuery | undefined): Promise<SearchProductsResult>;
  protected processSearchProducts(response: Response): Promise<SearchProductsResult>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchPropertyDictionaryItems(
    body?: PropertyDictionaryItemSearchCriteria | undefined,
  ): Promise<PropertyDictionaryItemSearchResult>;
  protected processSearchPropertyDictionaryItems(response: Response): Promise<PropertyDictionaryItemSearchResult>;
  /**
   * @return Success
   */
  getProductById(productId: string): Promise<SellerProduct>;
  protected processGetProductById(response: Response): Promise<SellerProduct>;
  /**
   * @param body (optional)
   * @return Success
   */
  createNewProduct(body?: CreateNewProductCommand | undefined): Promise<SellerProduct>;
  protected processCreateNewProduct(response: Response): Promise<SellerProduct>;
  /**
   * @param body (optional)
   * @return Success
   */
  updateProductDetails(body?: UpdateProductDetailsCommand | undefined): Promise<SellerProduct>;
  protected processUpdateProductDetails(response: Response): Promise<SellerProduct>;
  /**
   * @param ids (optional)
   * @return Success
   */
  deleteProducts(ids?: string[] | undefined): Promise<void>;
  protected processDeleteProducts(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  bulkDeleteProducts(body?: BulkProductsDeleteCommand | undefined): Promise<void>;
  protected processBulkDeleteProducts(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  createNewPublicationRequest(
    body?: CreateNewPublicationRequestCommand | undefined,
  ): Promise<ProductPublicationRequest>;
  protected processCreateNewPublicationRequest(response: Response): Promise<ProductPublicationRequest>;
  /**
   * @return Success
   */
  revertStagedChanges(productId: string): Promise<ProductPublicationRequest>;
  protected processRevertStagedChanges(response: Response): Promise<ProductPublicationRequest>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchOffers(body?: SearchOffersQuery | undefined): Promise<SearchOffersResult>;
  protected processSearchOffers(response: Response): Promise<SearchOffersResult>;
  /**
   * @return Success
   */
  getOfferByIdGET(offerId: string): Promise<Offer>;
  protected processGetOfferByIdGET(response: Response): Promise<Offer>;
  /**
   * @return Success
   */
  getOfferByIdPOST(offerId: string): Promise<Offer>;
  protected processGetOfferByIdPOST(response: Response): Promise<Offer>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchOfferProducts(body?: SearchProductsForNewOfferQuery | undefined): Promise<SearchOfferProductsResult>;
  protected processSearchOfferProducts(response: Response): Promise<SearchOfferProductsResult>;
  /**
   * @param body (optional)
   * @return Success
   */
  createNewOffer(body?: CreateNewOfferCommand | undefined): Promise<Offer>;
  protected processCreateNewOffer(response: Response): Promise<Offer>;
  /**
   * @param body (optional)
   * @return Success
   */
  changeOfferState(body?: ChangeOfferStateCommand | undefined): Promise<Offer>;
  protected processChangeOfferState(response: Response): Promise<Offer>;
  /**
   * @param body (optional)
   * @return Success
   */
  updateOffer(body?: UpdateOfferCommand | undefined): Promise<Offer>;
  protected processUpdateOffer(response: Response): Promise<Offer>;
  /**
   * @param ids (optional)
   * @return Success
   */
  deleteOffers(ids?: string[] | undefined): Promise<void>;
  protected processDeleteOffers(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  bulkDeleteOffers(body?: BulkOffersDeleteCommand | undefined): Promise<void>;
  protected processBulkDeleteOffers(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchFulfillmentCenters(body?: SearchFulfillmentCentersQuery | undefined): Promise<SearchFulfillmentCentersResult>;
  protected processSearchFulfillmentCenters(response: Response): Promise<SearchFulfillmentCentersResult>;
  /**
   * @return Success
   */
  getFulfillmentCenterById(fulfillmentCenterId: string): Promise<FulfillmentCenter>;
  protected processGetFulfillmentCenterById(response: Response): Promise<FulfillmentCenter>;
  /**
   * @param body (optional)
   * @return Success
   */
  updateFulfillmentCenter(body?: UpdateFulfillmentCenterCommand | undefined): Promise<FulfillmentCenter>;
  protected processUpdateFulfillmentCenter(response: Response): Promise<FulfillmentCenter>;
  /**
   * @param ids (optional)
   * @return Success
   */
  deleteFulfillmentCenter(ids?: string[] | undefined): Promise<void>;
  protected processDeleteFulfillmentCenter(response: Response): Promise<void>;
  /**
   * @return Success
   */
  getAvailableLanguages(): Promise<string[]>;
  protected processGetAvailableLanguages(response: Response): Promise<string[]>;
}
export declare class VcmpSellerImportClient extends AuthApiBase {
  private http;
  private baseUrl;
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
  constructor(
    baseUrl?: string,
    http?: {
      fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    },
  );
  /**
   * @param body (optional)
   * @return Success
   */
  runImport(body?: RunImportCommand | undefined): Promise<ImportPushNotification>;
  protected processRunImport(response: Response): Promise<ImportPushNotification>;
  /**
   * @param body (optional)
   * @return Success
   */
  cancelJob(body?: ImportCancellationRequest | undefined): Promise<void>;
  protected processCancelJob(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  preview(body?: PreviewDataQuery | undefined): Promise<ImportDataPreview>;
  protected processPreview(response: Response): Promise<ImportDataPreview>;
  /**
   * @return Success
   */
  getImporters(): Promise<IDataImporter[]>;
  protected processGetImporters(response: Response): Promise<IDataImporter[]>;
  /**
   * @return Success
   */
  getImportProfileById(profileId: string): Promise<ImportProfile>;
  protected processGetImportProfileById(response: Response): Promise<ImportProfile>;
  /**
   * @param body (optional)
   * @return Success
   */
  createImportProfile(body?: ImportProfile | undefined): Promise<ImportProfile>;
  protected processCreateImportProfile(response: Response): Promise<ImportProfile>;
  /**
   * @param body (optional)
   * @return Success
   */
  updateImportProfile(body?: UpdateProfileCommand | undefined): Promise<ImportProfile>;
  protected processUpdateImportProfile(response: Response): Promise<ImportProfile>;
  /**
   * @param id (optional)
   * @param ids (optional)
   * @return Success
   */
  deleteProfile(id?: string | undefined, ids?: string[] | undefined): Promise<void>;
  protected processDeleteProfile(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchImportProfiles(body?: SearchImportProfilesQuery | undefined): Promise<SearchImportProfilesResult>;
  protected processSearchImportProfiles(response: Response): Promise<SearchImportProfilesResult>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchImportRunHistory(body?: SearchImportRunHistoryQuery | undefined): Promise<SearchImportRunHistoryResult>;
  protected processSearchImportRunHistory(response: Response): Promise<SearchImportRunHistoryResult>;
}
export declare class VcmpSellerOrdersClient extends AuthApiBase {
  private http;
  private baseUrl;
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
  constructor(
    baseUrl?: string,
    http?: {
      fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    },
  );
  /**
   * @return Success
   */
  sync(): Promise<void>;
  protected processSync(response: Response): Promise<void>;
  /**
   * @return Success
   */
  getById(orderId: string): Promise<CustomerOrder>;
  protected processGetById(response: Response): Promise<CustomerOrder>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchOrders(body?: SearchOrdersQuery | undefined): Promise<CustomerOrderSearchResult>;
  protected processSearchOrders(response: Response): Promise<CustomerOrderSearchResult>;
  /**
   * @param body (optional)
   * @return Success
   */
  updateOrderStatus(body?: ChangeOrderStatusCommand | undefined): Promise<void>;
  protected processUpdateOrderStatus(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  fulfill(body?: FulfillOrderCommand | undefined): Promise<void>;
  protected processFulfill(response: Response): Promise<void>;
}
export declare class VcmpSellerRatingAndReviewsClient extends AuthApiBase {
  private http;
  private baseUrl;
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
  constructor(
    baseUrl?: string,
    http?: {
      fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    },
  );
  /**
   * @return Success
   */
  getCurrentSellerRating(): Promise<SellerRating>;
  protected processGetCurrentSellerRating(response: Response): Promise<SellerRating>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchCustomerReviews(body?: SearchCustomerReviewsQuery | undefined): Promise<SearchCustomerReviewsResult>;
  protected processSearchCustomerReviews(response: Response): Promise<SearchCustomerReviewsResult>;
}
export declare class VcmpSellerSecurityClient extends AuthApiBase {
  private http;
  private baseUrl;
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
  constructor(
    baseUrl?: string,
    http?: {
      fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    },
  );
  /**
   * @param memberId (optional)
   * @return Success
   */
  sendInvitation(memberId?: string | undefined): Promise<void>;
  protected processSendInvitation(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  sendUserInvitation(body?: SendSellerUserInvitationCommand | undefined): Promise<void>;
  protected processSendUserInvitation(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  validateSeller(body?: ValidateProductQuery | undefined): Promise<ValidationFailure[]>;
  protected processValidateSeller(response: Response): Promise<ValidationFailure[]>;
  /**
   * @return Success
   */
  getCurrentSeller(): Promise<Seller>;
  protected processGetCurrentSeller(response: Response): Promise<Seller>;
  /**
   * @param ids (optional)
   * @return Success
   */
  deleteSellers(ids?: string[] | undefined): Promise<void>;
  protected processDeleteSellers(response: Response): Promise<void>;
  /**
   * @return Success
   */
  getSellerById(id: string): Promise<Seller>;
  protected processGetSellerById(response: Response): Promise<Seller>;
  /**
   * @param body (optional)
   * @return Success
   */
  createSeller(body?: CreateSellerCommand | undefined): Promise<void>;
  protected processCreateSeller(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  updateSeller(body?: UpdateSellerCommand | undefined): Promise<void>;
  protected processUpdateSeller(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchSellers(body?: SearchSellersQuery | undefined): Promise<SearchSellersResult>;
  protected processSearchSellers(response: Response): Promise<SearchSellersResult>;
  /**
   * @param body (optional)
   * @return Success
   */
  createSellerUser(body?: CreateSellerUserCommand | undefined): Promise<SellerUser>;
  protected processCreateSellerUser(response: Response): Promise<SellerUser>;
  /**
   * @param body (optional)
   * @return Success
   */
  validateUser(body?: ValidateSellerUserQuery | undefined): Promise<ValidationFailure[]>;
  protected processValidateUser(response: Response): Promise<ValidationFailure[]>;
  /**
   * @param body (optional)
   * @return Success
   */
  updateSellerUser(body?: UpdateSellerUserCommand | undefined): Promise<SellerUser>;
  protected processUpdateSellerUser(response: Response): Promise<SellerUser>;
  /**
   * @param ids (optional)
   * @return Success
   */
  deleteSellerUsers(ids?: string[] | undefined): Promise<void>;
  protected processDeleteSellerUsers(response: Response): Promise<void>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchSellerUsers(body?: SearchSellerUsersQuery | undefined): Promise<SearchSellerUsersResult>;
  protected processSearchSellerUsers(response: Response): Promise<SearchSellerUsersResult>;
  /**
   * @param body (optional)
   * @return Success
   */
  forgotPassword(body?: ForgotPasswordCommand | undefined): Promise<void>;
  protected processForgotPassword(response: Response): Promise<void>;
}
export declare class VcmpSmClient extends AuthApiBase {
  private http;
  private baseUrl;
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
  constructor(
    baseUrl?: string,
    http?: {
      fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    },
  );
  /**
   * @param body (optional)
   * @return Success
   */
  search(body?: SearchStateMachineDefinitionsQuery | undefined): Promise<SearchStateMachineDefinitionsResult>;
  protected processSearch(response: Response): Promise<SearchStateMachineDefinitionsResult>;
  /**
   * @param body (optional)
   * @return Success
   */
  createNewDefinition(body?: CreateStateMachineDefinitionCommand | undefined): Promise<StateMachineDefinition>;
  protected processCreateNewDefinition(response: Response): Promise<StateMachineDefinition>;
  /**
   * @return Success
   */
  getStateMachineById(definitionId: string): Promise<StateMachineDefinition>;
  protected processGetStateMachineById(response: Response): Promise<StateMachineDefinition>;
  /**
   * @param body (optional)
   * @return Success
   */
  validateDefinition(body?: StateMachineDefinition | undefined): Promise<StateMachineDefinition>;
  protected processValidateDefinition(response: Response): Promise<StateMachineDefinition>;
  /**
   * @param body (optional)
   * @return Success
   */
  searchInstance(body?: SearchStateMachineInstancesQuery | undefined): Promise<SearchStateMachineInstancesResult>;
  protected processSearchInstance(response: Response): Promise<SearchStateMachineInstancesResult>;
  /**
   * @return Success
   */
  getStateMachineInstanceById(instanceId: string): Promise<StateMachineInstance>;
  protected processGetStateMachineInstanceById(response: Response): Promise<StateMachineInstance>;
  /**
   * @param instanceId (optional)
   * @param body (optional)
   * @return Success
   */
  createNewInstance(
    definitionId: string,
    instanceId?: string | undefined,
    body?: IHasDynamicProperties | undefined,
  ): Promise<StateMachineInstance>;
  protected processCreateNewInstance(response: Response): Promise<StateMachineInstance>;
  /**
   * @return Success
   */
  fire(instanceId: string, trigger: string, entityId: string): Promise<StateMachineInstance>;
  protected processFire(response: Response): Promise<StateMachineInstance>;
}
export declare class VcmpSyncClient extends AuthApiBase {
  private http;
  private baseUrl;
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
  constructor(
    baseUrl?: string,
    http?: {
      fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    },
  );
  /**
   * @param body (optional)
   * @return Success
   */
  runSynchronization(body?: SyncContext | undefined): Promise<SyncPushNotification>;
  protected processRunSynchronization(response: Response): Promise<SyncPushNotification>;
  /**
   * @param body (optional)
   * @return Success
   */
  cancelJob(body?: SyncJobCancellationRequest | undefined): Promise<void>;
  protected processCancelJob(response: Response): Promise<void>;
  /**
   * @return Success
   */
  getSyncClients(): Promise<ISyncClient[]>;
  protected processGetSyncClients(response: Response): Promise<ISyncClient[]>;
}
export declare enum AddressType {
  Undefined = "Undefined",
  Billing = "Billing",
  Shipping = "Shipping",
  BillingAndShipping = "BillingAndShipping",
  Pickup = "Pickup",
}
export declare class Asset implements IAsset {
  mimeType?: string | undefined;
  size?: number;
  readonly readableSize?: string | undefined;
  binaryData?: string | undefined;
  relativeUrl?: string | undefined;
  url?: string | undefined;
  description?: string | undefined;
  sortOrder?: number;
  /** Gets or sets the asset type identifier. */
  typeId?: string | undefined;
  /** Gets or sets the asset group name. */
  group?: string | undefined;
  /** Gets or sets the asset name. */
  name?: string | undefined;
  outerId?: string | undefined;
  /** Gets or sets the asset language. */
  languageCode?: string | undefined;
  /** System flag used to mark that object was inherited from other */
  readonly isInherited?: boolean;
  readonly seoObjectType?: string | undefined;
  seoInfos?: SeoInfo[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IAsset);
  init(_data?: any): void;
  static fromJS(data: any): Asset;
  toJSON(data?: any): any;
}
export interface IAsset {
  mimeType?: string | undefined;
  size?: number;
  readableSize?: string | undefined;
  binaryData?: string | undefined;
  relativeUrl?: string | undefined;
  url?: string | undefined;
  description?: string | undefined;
  sortOrder?: number;
  /** Gets or sets the asset type identifier. */
  typeId?: string | undefined;
  /** Gets or sets the asset group name. */
  group?: string | undefined;
  /** Gets or sets the asset name. */
  name?: string | undefined;
  outerId?: string | undefined;
  /** Gets or sets the asset language. */
  languageCode?: string | undefined;
  /** System flag used to mark that object was inherited from other */
  isInherited?: boolean;
  seoObjectType?: string | undefined;
  seoInfos?: SeoInfo[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class BulkOffersDeleteCommand implements IBulkOffersDeleteCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  offerIds?: string[] | undefined;
  query?: SearchOffersQuery | undefined;
  all?: boolean;
  pushNotification?: SellerPushNotification | undefined;
  constructor(data?: IBulkOffersDeleteCommand);
  init(_data?: any): void;
  static fromJS(data: any): BulkOffersDeleteCommand;
  toJSON(data?: any): any;
}
export interface IBulkOffersDeleteCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  offerIds?: string[] | undefined;
  query?: SearchOffersQuery | undefined;
  all?: boolean;
  pushNotification?: SellerPushNotification | undefined;
}
export declare class BulkProductsDeleteCommand implements IBulkProductsDeleteCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  productIds?: string[] | undefined;
  query?: SearchProductsQuery | undefined;
  all?: boolean;
  constructor(data?: IBulkProductsDeleteCommand);
  init(_data?: any): void;
  static fromJS(data: any): BulkProductsDeleteCommand;
  toJSON(data?: any): any;
}
export interface IBulkProductsDeleteCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  productIds?: string[] | undefined;
  query?: SearchProductsQuery | undefined;
  all?: boolean;
}
export declare enum CancelledState {
  Undefined = "Undefined",
  Requested = "Requested",
  Completed = "Completed",
}
export declare class Capture implements ICapture {
  objectType?: string | undefined;
  amount?: number;
  vendorId?: string | undefined;
  transactionId?: string | undefined;
  customerOrderId?: string | undefined;
  paymentId?: string | undefined;
  items?: CaptureItem[] | undefined;
  operationType?: string | undefined;
  parentOperationId?: string | undefined;
  number?: string | undefined;
  isApproved?: boolean;
  status?: string | undefined;
  comment?: string | undefined;
  currency?: string | undefined;
  sum?: number;
  outerId?: string | undefined;
  /** For system use to handle canellation flow */
  cancelledState?: CaptureCancelledState;
  /** Used by payment provides to indicate that cancellation operation has completed */
  isCancelled?: boolean;
  cancelledDate?: Date | undefined;
  cancelReason?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  operationsLog?: OperationLog[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: ICapture);
  init(_data?: any): void;
  static fromJS(data: any): Capture;
  toJSON(data?: any): any;
}
export interface ICapture {
  objectType?: string | undefined;
  amount?: number;
  vendorId?: string | undefined;
  transactionId?: string | undefined;
  customerOrderId?: string | undefined;
  paymentId?: string | undefined;
  items?: CaptureItem[] | undefined;
  operationType?: string | undefined;
  parentOperationId?: string | undefined;
  number?: string | undefined;
  isApproved?: boolean;
  status?: string | undefined;
  comment?: string | undefined;
  currency?: string | undefined;
  sum?: number;
  outerId?: string | undefined;
  /** For system use to handle canellation flow */
  cancelledState?: CaptureCancelledState;
  /** Used by payment provides to indicate that cancellation operation has completed */
  isCancelled?: boolean;
  cancelledDate?: Date | undefined;
  cancelReason?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  operationsLog?: OperationLog[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class CaptureItem implements ICaptureItem {
  quantity?: number;
  lineItemId?: string | undefined;
  lineItem?: OrderLineItem | undefined;
  captureId?: string | undefined;
  outerId?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: ICaptureItem);
  init(_data?: any): void;
  static fromJS(data: any): CaptureItem;
  toJSON(data?: any): any;
}
export interface ICaptureItem {
  quantity?: number;
  lineItemId?: string | undefined;
  lineItem?: OrderLineItem | undefined;
  captureId?: string | undefined;
  outerId?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class CatalogProduct implements ICatalogProduct {
  /** The type of product. Can be "Physical", "Digital", etc. */
  productType?: string | undefined;
  /** The Stock Keeping Unit (SKU) code for the product. */
  code?: string | undefined;
  /** The manufacturer's part number for the product. */
  manufacturerPartNumber?: string | undefined;
  /** The Global Trade Item Number (GTIN) for the product. This can include UPC (in North America), EAN (in Europe), JAN (in Japan), and ISBN (for books). */
  gtin?: string | undefined;
  /** The name of the product. */
  name?: string | undefined;
  /** The ID of the catalog to which this product belongs. */
  catalogId?: string | undefined;
  /** The ID of the category to which this product belongs. */
  categoryId?: string | undefined;
  /** Product outline in physical catalog (all parent categories ids concatenated. E.g. (1/21/344)) */
  readonly outline?: string | undefined;
  /** Product path in physical catalog (all parent categories names concatenated. E.g. (parent1/parent2)) */
  readonly path?: string | undefined;
  readonly titularItemId?: string | undefined;
  /** The ID of the main product associated with this product variation. */
  mainProductId?: string | undefined;
  /** Specifies whether the product is currently visible on the store for customers to view and purchase.
If set to false, the product is currently sold out. */
  isActive?: boolean | undefined;
  /** Specifies whether the product is currently visible on the store for customers to view and purchase.
If set to false, the product is currently ouf of stock. */
  isBuyable?: boolean | undefined;
  /** Indicates whether the inventory service is tracking the availability of this product.
If set to false, the product is considered in stock without any inventory limitations. */
  trackInventory?: boolean | undefined;
  /** The date and time when the product was last indexed for search. */
  indexingDate?: Date | undefined;
  /** The maximum quantity of the product that can be purchased in a single order. A value of 0 indicates that there are no limitations on the maximum quantity. */
  maxQuantity?: number | undefined;
  /** The minimum quantity of the product that must be purchased in a single order. A value of 0 indicates that there are no limitations on the minimum quantity. */
  minQuantity?: number | undefined;
  /** First listed date and time. If you do not specify an end date, the product will be active until you deactivate it.If you do not specify an end date, the product will be active until you deactivate it.If you do not specify a start date, the product will become active immediately once you save it. */
  startDate?: Date;
  /** Listing expires on the specific date and time. If you do not specify an end date, the product will be active until you deactivate it. */
  endDate?: Date | undefined;
  /** The type of package for this product, which determines the product's specific dimensions. */
  packageType?: string | undefined;
  /** The unit of measurement for the product's weight. */
  weightUnit?: string | undefined;
  /** The weight of the product, in the unit specified by the WeightUnit property. */
  weight?: number | undefined;
  /** The unit of measurement for the product's height, length, and width. */
  measureUnit?: string | undefined;
  /** The height of the product, in the unit specified by the MeasureUnit property. */
  height?: number | undefined;
  /** The length of the product, in the unit specified by the MeasureUnit property. */
  length?: number | undefined;
  /** The width of the product, in the unit specified by the MeasureUnit property. */
  width?: number | undefined;
  enableReview?: boolean | undefined;
  /** The maximum number of times the product can be downloaded. A value of 0 indicates no limit. */
  maxNumberOfDownload?: number | undefined;
  /** The date and time when the download link or access to the product will expire. */
  downloadExpiration?: Date | undefined;
  /** The type of product download. Valid values include: "Standard Product", "Software", and "Music". */
  downloadType?: string | undefined;
  /** Indicates whether the product requires the user to agree to any terms or conditions before downloading. */
  hasUserAgreement?: boolean | undefined;
  /** Specifies the type of shipping option available for the product. */
  shippingType?: string | undefined;
  /** Specifies the type of tax applied to the product. */
  taxType?: string | undefined;
  /** ID of the vendor associated with the product. */
  vendor?: string | undefined;
  /** Indicates the position of the product in the catalog for ordering purposes. */
  priority?: number;
  /** An external identifier for the product that can be used for integration with external systems. */
  outerId?: string | undefined;
  properties?: Property[] | undefined;
  excludedProperties?: ExcludedProperty[] | undefined;
  propertyValues?: PropertyValue[] | undefined;
  /** Gets the default image for the product. */
  readonly imgSrc?: string | undefined;
  images?: Image[] | undefined;
  assets?: Asset[] | undefined;
  links?: CategoryLink[] | undefined;
  variations?: Variation[] | undefined;
  /** Each descendant type should override this property to use other object type for seo records */
  readonly seoObjectType?: string | undefined;
  seoInfos?: SeoInfo[] | undefined;
  reviews?: EditorialReview[] | undefined;
  associations?: ProductAssociation[] | undefined;
  referencedAssociations?: ProductAssociation[] | undefined;
  outlines?: Outline[] | undefined;
  /** System flag used to mark that object was inherited from other */
  readonly isInherited?: boolean;
  readonly parentCategoryIsActive?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: ICatalogProduct);
  init(_data?: any): void;
  static fromJS(data: any): CatalogProduct;
  toJSON(data?: any): any;
}
export interface ICatalogProduct {
  /** The type of product. Can be "Physical", "Digital", etc. */
  productType?: string | undefined;
  /** The Stock Keeping Unit (SKU) code for the product. */
  code?: string | undefined;
  /** The manufacturer's part number for the product. */
  manufacturerPartNumber?: string | undefined;
  /** The Global Trade Item Number (GTIN) for the product. This can include UPC (in North America), EAN (in Europe), JAN (in Japan), and ISBN (for books). */
  gtin?: string | undefined;
  /** The name of the product. */
  name?: string | undefined;
  /** The ID of the catalog to which this product belongs. */
  catalogId?: string | undefined;
  /** The ID of the category to which this product belongs. */
  categoryId?: string | undefined;
  /** Product outline in physical catalog (all parent categories ids concatenated. E.g. (1/21/344)) */
  outline?: string | undefined;
  /** Product path in physical catalog (all parent categories names concatenated. E.g. (parent1/parent2)) */
  path?: string | undefined;
  titularItemId?: string | undefined;
  /** The ID of the main product associated with this product variation. */
  mainProductId?: string | undefined;
  /** Specifies whether the product is currently visible on the store for customers to view and purchase.
If set to false, the product is currently sold out. */
  isActive?: boolean | undefined;
  /** Specifies whether the product is currently visible on the store for customers to view and purchase.
If set to false, the product is currently ouf of stock. */
  isBuyable?: boolean | undefined;
  /** Indicates whether the inventory service is tracking the availability of this product.
If set to false, the product is considered in stock without any inventory limitations. */
  trackInventory?: boolean | undefined;
  /** The date and time when the product was last indexed for search. */
  indexingDate?: Date | undefined;
  /** The maximum quantity of the product that can be purchased in a single order. A value of 0 indicates that there are no limitations on the maximum quantity. */
  maxQuantity?: number | undefined;
  /** The minimum quantity of the product that must be purchased in a single order. A value of 0 indicates that there are no limitations on the minimum quantity. */
  minQuantity?: number | undefined;
  /** First listed date and time. If you do not specify an end date, the product will be active until you deactivate it.If you do not specify an end date, the product will be active until you deactivate it.If you do not specify a start date, the product will become active immediately once you save it. */
  startDate?: Date;
  /** Listing expires on the specific date and time. If you do not specify an end date, the product will be active until you deactivate it. */
  endDate?: Date | undefined;
  /** The type of package for this product, which determines the product's specific dimensions. */
  packageType?: string | undefined;
  /** The unit of measurement for the product's weight. */
  weightUnit?: string | undefined;
  /** The weight of the product, in the unit specified by the WeightUnit property. */
  weight?: number | undefined;
  /** The unit of measurement for the product's height, length, and width. */
  measureUnit?: string | undefined;
  /** The height of the product, in the unit specified by the MeasureUnit property. */
  height?: number | undefined;
  /** The length of the product, in the unit specified by the MeasureUnit property. */
  length?: number | undefined;
  /** The width of the product, in the unit specified by the MeasureUnit property. */
  width?: number | undefined;
  enableReview?: boolean | undefined;
  /** The maximum number of times the product can be downloaded. A value of 0 indicates no limit. */
  maxNumberOfDownload?: number | undefined;
  /** The date and time when the download link or access to the product will expire. */
  downloadExpiration?: Date | undefined;
  /** The type of product download. Valid values include: "Standard Product", "Software", and "Music". */
  downloadType?: string | undefined;
  /** Indicates whether the product requires the user to agree to any terms or conditions before downloading. */
  hasUserAgreement?: boolean | undefined;
  /** Specifies the type of shipping option available for the product. */
  shippingType?: string | undefined;
  /** Specifies the type of tax applied to the product. */
  taxType?: string | undefined;
  /** ID of the vendor associated with the product. */
  vendor?: string | undefined;
  /** Indicates the position of the product in the catalog for ordering purposes. */
  priority?: number;
  /** An external identifier for the product that can be used for integration with external systems. */
  outerId?: string | undefined;
  properties?: Property[] | undefined;
  excludedProperties?: ExcludedProperty[] | undefined;
  propertyValues?: PropertyValue[] | undefined;
  /** Gets the default image for the product. */
  imgSrc?: string | undefined;
  images?: Image[] | undefined;
  assets?: Asset[] | undefined;
  links?: CategoryLink[] | undefined;
  variations?: Variation[] | undefined;
  /** Each descendant type should override this property to use other object type for seo records */
  seoObjectType?: string | undefined;
  seoInfos?: SeoInfo[] | undefined;
  reviews?: EditorialReview[] | undefined;
  associations?: ProductAssociation[] | undefined;
  referencedAssociations?: ProductAssociation[] | undefined;
  outlines?: Outline[] | undefined;
  /** System flag used to mark that object was inherited from other */
  isInherited?: boolean;
  parentCategoryIsActive?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class Category implements ICategory {
  catalogId?: string | undefined;
  parentId?: string | undefined;
  code?: string | undefined;
  name?: string | undefined;
  /** Category outline in physical catalog (all parent categories ids concatenated. E.g. (1/21/344)) */
  readonly outline?: string | undefined;
  /** Category path in physical catalog (all parent categories names concatenated. E.g. (parent1/parent2)) */
  path?: string | undefined;
  isVirtual?: boolean;
  level?: number;
  packageType?: string | undefined;
  priority?: number;
  isActive?: boolean | undefined;
  outerId?: string | undefined;
  properties?: Property[] | undefined;
  excludedProperties?: ExcludedProperty[] | undefined;
  links?: CategoryLink[] | undefined;
  taxType?: string | undefined;
  readonly seoObjectType?: string | undefined;
  seoInfos?: SeoInfo[] | undefined;
  enableDescription?: boolean | undefined;
  descriptions?: CategoryDescription[] | undefined;
  /** Gets the default image */
  readonly imgSrc?: string | undefined;
  images?: Image[] | undefined;
  outlines?: Outline[] | undefined;
  /** System flag used to mark that object was inherited from other */
  readonly isInherited?: boolean;
  readonly parentIsActive?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: ICategory);
  init(_data?: any): void;
  static fromJS(data: any): Category;
  toJSON(data?: any): any;
}
export interface ICategory {
  catalogId?: string | undefined;
  parentId?: string | undefined;
  code?: string | undefined;
  name?: string | undefined;
  /** Category outline in physical catalog (all parent categories ids concatenated. E.g. (1/21/344)) */
  outline?: string | undefined;
  /** Category path in physical catalog (all parent categories names concatenated. E.g. (parent1/parent2)) */
  path?: string | undefined;
  isVirtual?: boolean;
  level?: number;
  packageType?: string | undefined;
  priority?: number;
  isActive?: boolean | undefined;
  outerId?: string | undefined;
  properties?: Property[] | undefined;
  excludedProperties?: ExcludedProperty[] | undefined;
  links?: CategoryLink[] | undefined;
  taxType?: string | undefined;
  seoObjectType?: string | undefined;
  seoInfos?: SeoInfo[] | undefined;
  enableDescription?: boolean | undefined;
  descriptions?: CategoryDescription[] | undefined;
  /** Gets the default image */
  imgSrc?: string | undefined;
  images?: Image[] | undefined;
  outlines?: Outline[] | undefined;
  /** System flag used to mark that object was inherited from other */
  isInherited?: boolean;
  parentIsActive?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class CategoryDescription implements ICategoryDescription {
  content?: string | undefined;
  descriptionType?: string | undefined;
  languageCode?: string | undefined;
  isInherited?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: ICategoryDescription);
  init(_data?: any): void;
  static fromJS(data: any): CategoryDescription;
  toJSON(data?: any): any;
}
export interface ICategoryDescription {
  content?: string | undefined;
  descriptionType?: string | undefined;
  languageCode?: string | undefined;
  isInherited?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class CategoryLink implements ICategoryLink {
  /** Entry identifier which this link belongs to */
  readonly entryId?: string | undefined;
  listEntryId?: string | undefined;
  /** Gets or sets the type of the list entry. E.g. "product", "category" */
  listEntryType?: string | undefined;
  /** Product order position in virtual catalog */
  priority?: number;
  catalogId?: string | undefined;
  categoryId?: string | undefined;
  /** Gets the Id of either target Catetory or Catalog */
  readonly targetId?: string | undefined;
  /** Gets the name of either target Catetory or Catalog */
  readonly name?: string | undefined;
  constructor(data?: ICategoryLink);
  init(_data?: any): void;
  static fromJS(data: any): CategoryLink;
  toJSON(data?: any): any;
}
export interface ICategoryLink {
  /** Entry identifier which this link belongs to */
  entryId?: string | undefined;
  listEntryId?: string | undefined;
  /** Gets or sets the type of the list entry. E.g. "product", "category" */
  listEntryType?: string | undefined;
  /** Product order position in virtual catalog */
  priority?: number;
  catalogId?: string | undefined;
  categoryId?: string | undefined;
  /** Gets the Id of either target Catetory or Catalog */
  targetId?: string | undefined;
  /** Gets the name of either target Catetory or Catalog */
  name?: string | undefined;
}
export declare class CategorySearchCriteria implements ICategorySearchCriteria {
  code?: string | undefined;
  catalogId?: string | undefined;
  catalogIds?: string[] | undefined;
  /** Parent category id */
  categoryId?: string | undefined;
  outerIds?: string[] | undefined;
  searchOnlyInRoot?: boolean;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ICategorySearchCriteria);
  init(_data?: any): void;
  static fromJS(data: any): CategorySearchCriteria;
  toJSON(data?: any): any;
}
export interface ICategorySearchCriteria {
  code?: string | undefined;
  catalogId?: string | undefined;
  catalogIds?: string[] | undefined;
  /** Parent category id */
  categoryId?: string | undefined;
  outerIds?: string[] | undefined;
  searchOnlyInRoot?: boolean;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class CategorySearchResult implements ICategorySearchResult {
  totalCount?: number;
  results?: Category[] | undefined;
  constructor(data?: ICategorySearchResult);
  init(_data?: any): void;
  static fromJS(data: any): CategorySearchResult;
  toJSON(data?: any): any;
}
export interface ICategorySearchResult {
  totalCount?: number;
  results?: Category[] | undefined;
}
export declare class ChangeOfferStateCommand implements IChangeOfferStateCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  offerId: string;
  isActive: boolean;
  constructor(data?: IChangeOfferStateCommand);
  init(_data?: any): void;
  static fromJS(data: any): ChangeOfferStateCommand;
  toJSON(data?: any): any;
}
export interface IChangeOfferStateCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  offerId: string;
  isActive: boolean;
}
export declare class ChangeOrderStatusCommand implements IChangeOrderStatusCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  orderId: string;
  newStatus: string;
  constructor(data?: IChangeOrderStatusCommand);
  init(_data?: any): void;
  static fromJS(data: any): ChangeOrderStatusCommand;
  toJSON(data?: any): any;
}
export interface IChangeOrderStatusCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  orderId: string;
  newStatus: string;
}
export declare class ChangeRequestStatusCommand implements IChangeRequestStatusCommand {
  operatorId: string;
  operatorName: string;
  requestId?: string | undefined;
  sellerProductId?: string | undefined;
  comment?: string | undefined;
  newStatus: ChangeRequestStatusCommandNewStatus;
  constructor(data?: IChangeRequestStatusCommand);
  init(_data?: any): void;
  static fromJS(data: any): ChangeRequestStatusCommand;
  toJSON(data?: any): any;
}
export interface IChangeRequestStatusCommand {
  operatorId: string;
  operatorName: string;
  requestId?: string | undefined;
  sellerProductId?: string | undefined;
  comment?: string | undefined;
  newStatus: ChangeRequestStatusCommandNewStatus;
}
export declare class CommissionFee implements ICommissionFee {
  name?: string | undefined;
  description?: string | undefined;
  type?: CommissionFeeType;
  calculationType?: CommissionFeeCalculationType;
  fee?: number;
  priority?: number;
  isDefault?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: ICommissionFee);
  init(_data?: any): void;
  static fromJS(data: any): CommissionFee;
  toJSON(data?: any): any;
}
export interface ICommissionFee {
  name?: string | undefined;
  description?: string | undefined;
  type?: CommissionFeeType;
  calculationType?: CommissionFeeCalculationType;
  fee?: number;
  priority?: number;
  isDefault?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class CommissionFeeDetails implements ICommissionFeeDetails {
  id?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  type?: CommissionFeeDetailsType;
  calculationType?: CommissionFeeDetailsCalculationType;
  fee?: number;
  priority?: number;
  isDefault?: boolean;
  isActive?: boolean;
  expressionTree?: DynamicCommissionFeeTree | undefined;
  constructor(data?: ICommissionFeeDetails);
  init(_data?: any): void;
  static fromJS(data: any): CommissionFeeDetails;
  toJSON(data?: any): any;
}
export interface ICommissionFeeDetails {
  id?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  type?: CommissionFeeDetailsType;
  calculationType?: CommissionFeeDetailsCalculationType;
  fee?: number;
  priority?: number;
  isDefault?: boolean;
  isActive?: boolean;
  expressionTree?: DynamicCommissionFeeTree | undefined;
}
export declare class CreateFeeCommand implements ICreateFeeCommand {
  feeDetails?: CommissionFeeDetails | undefined;
  constructor(data?: ICreateFeeCommand);
  init(_data?: any): void;
  static fromJS(data: any): CreateFeeCommand;
  toJSON(data?: any): any;
}
export interface ICreateFeeCommand {
  feeDetails?: CommissionFeeDetails | undefined;
}
export declare class CreateNewOfferCommand implements ICreateNewOfferCommand {
  outerId?: string | undefined;
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  storeId?: string | undefined;
  storeName?: string | undefined;
  details: OfferDetails;
  productId?: string | undefined;
  sellerProductId?: string | undefined;
  constructor(data?: ICreateNewOfferCommand);
  init(_data?: any): void;
  static fromJS(data: any): CreateNewOfferCommand;
  toJSON(data?: any): any;
}
export interface ICreateNewOfferCommand {
  outerId?: string | undefined;
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  storeId?: string | undefined;
  storeName?: string | undefined;
  details: OfferDetails;
  productId?: string | undefined;
  sellerProductId?: string | undefined;
}
export declare class CreateNewProductCommand implements ICreateNewProductCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  productDetails?: ProductDetails | undefined;
  constructor(data?: ICreateNewProductCommand);
  init(_data?: any): void;
  static fromJS(data: any): CreateNewProductCommand;
  toJSON(data?: any): any;
}
export interface ICreateNewProductCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  productDetails?: ProductDetails | undefined;
}
export declare class CreateNewPublicationRequestCommand implements ICreateNewPublicationRequestCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  storeId?: string | undefined;
  productId: string;
  comment?: string | undefined;
  constructor(data?: ICreateNewPublicationRequestCommand);
  init(_data?: any): void;
  static fromJS(data: any): CreateNewPublicationRequestCommand;
  toJSON(data?: any): any;
}
export interface ICreateNewPublicationRequestCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  storeId?: string | undefined;
  productId: string;
  comment?: string | undefined;
}
export declare class CreateSellerCategoriesCommand implements ICreateSellerCategoriesCommand {
  sellerId?: string | undefined;
  categoryIds?: string[] | undefined;
  searchCriteria?: CategorySearchCriteria | undefined;
  constructor(data?: ICreateSellerCategoriesCommand);
  init(_data?: any): void;
  static fromJS(data: any): CreateSellerCategoriesCommand;
  toJSON(data?: any): any;
}
export interface ICreateSellerCategoriesCommand {
  sellerId?: string | undefined;
  categoryIds?: string[] | undefined;
  searchCriteria?: CategorySearchCriteria | undefined;
}
export declare class CreateSellerCommand implements ICreateSellerCommand {
  sellerName: string;
  ownerDetails: SellerOwnerDetails;
  categoryIds?: string[] | undefined;
  commissionFeeId: string;
  groups?: string[] | undefined;
  constructor(data?: ICreateSellerCommand);
  init(_data?: any): void;
  static fromJS(data: any): CreateSellerCommand;
  toJSON(data?: any): any;
}
export interface ICreateSellerCommand {
  sellerName: string;
  ownerDetails: SellerOwnerDetails;
  categoryIds?: string[] | undefined;
  commissionFeeId: string;
  groups?: string[] | undefined;
}
export declare class CreateSellerUserCommand implements ICreateSellerUserCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  readonly seller?: Seller | undefined;
  userDetails?: SellerUserDetails | undefined;
  sendInvitation?: boolean;
  constructor(data?: ICreateSellerUserCommand);
  init(_data?: any): void;
  static fromJS(data: any): CreateSellerUserCommand;
  toJSON(data?: any): any;
}
export interface ICreateSellerUserCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  seller?: Seller | undefined;
  userDetails?: SellerUserDetails | undefined;
  sendInvitation?: boolean;
}
export declare class CreateStateMachineDefinitionCommand implements ICreateStateMachineDefinitionCommand {
  definition?: StateMachineDefinition | undefined;
  constructor(data?: ICreateStateMachineDefinitionCommand);
  init(_data?: any): void;
  static fromJS(data: any): CreateStateMachineDefinitionCommand;
  toJSON(data?: any): any;
}
export interface ICreateStateMachineDefinitionCommand {
  definition?: StateMachineDefinition | undefined;
}
export declare class CustomerAddress implements ICustomerAddress {
  addressType?: CustomerAddressAddressType;
  key?: string | undefined;
  name?: string | undefined;
  organization?: string | undefined;
  countryCode?: string | undefined;
  countryName?: string | undefined;
  city?: string | undefined;
  postalCode?: string | undefined;
  zip?: string | undefined;
  line1?: string | undefined;
  line2?: string | undefined;
  regionId?: string | undefined;
  regionName?: string | undefined;
  firstName?: string | undefined;
  middleName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  outerId?: string | undefined;
  isDefault?: boolean;
  description?: string | undefined;
  constructor(data?: ICustomerAddress);
  init(_data?: any): void;
  static fromJS(data: any): CustomerAddress;
  toJSON(data?: any): any;
}
export interface ICustomerAddress {
  addressType?: CustomerAddressAddressType;
  key?: string | undefined;
  name?: string | undefined;
  organization?: string | undefined;
  countryCode?: string | undefined;
  countryName?: string | undefined;
  city?: string | undefined;
  postalCode?: string | undefined;
  zip?: string | undefined;
  line1?: string | undefined;
  line2?: string | undefined;
  regionId?: string | undefined;
  regionName?: string | undefined;
  firstName?: string | undefined;
  middleName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  outerId?: string | undefined;
  isDefault?: boolean;
  description?: string | undefined;
}
export declare class CustomerOrder implements ICustomerOrder {
  rowVersion?: string | undefined;
  customerId?: string | undefined;
  customerName?: string | undefined;
  channelId?: string | undefined;
  storeId?: string | undefined;
  storeName?: string | undefined;
  organizationId?: string | undefined;
  organizationName?: string | undefined;
  employeeId?: string | undefined;
  employeeName?: string | undefined;
  /** The base shopping cart ID the order was created with */
  shoppingCartId?: string | undefined;
  /** This checkbox determines whether the order is a prototype */
  isPrototype?: boolean;
  /** The order internal number provided by customer */
  purchaseOrderNumber?: string | undefined;
  /** Number of subscription associated with this order */
  subscriptionNumber?: string | undefined;
  /** The ID of subscription associated with this order */
  subscriptionId?: string | undefined;
  objectType?: string | undefined;
  addresses?: OrderAddress[] | undefined;
  inPayments?: PaymentIn[] | undefined;
  items?: OrderLineItem[] | undefined;
  shipments?: OrderShipment[] | undefined;
  feeDetails?: FeeDetail[] | undefined;
  discounts?: Discount[] | undefined;
  /** When a discount is applied to the order, the tax calculation has already been applied and is shown in the tax field.
Therefore, the discount will not be taking tax into account.
For instance, if the cart subtotal is $100, and the tax subtotal is $15, a 10% discount will yield a total of $105 ($100 subtotal – $10 discount + $15 tax). */
  discountAmount?: number;
  taxDetails?: TaxDetail[] | undefined;
  scopes?: string[] | undefined;
  /** Order grand total */
  total?: number;
  /** Amount of the item prices */
  subTotal?: number;
  /** Amount of the item prices with tax */
  subTotalWithTax?: number;
  /** Amount of the item discount total */
  subTotalDiscount?: number;
  /** Amount of the item discount total with tax */
  subTotalDiscountWithTax?: number;
  /** Amount of the item tax total */
  subTotalTaxTotal?: number;
  /** Amount of the shipment total */
  shippingTotal?: number;
  /** Amount of the shipment total with tax */
  shippingTotalWithTax?: number;
  /** Amount of the shipment prices */
  shippingSubTotal?: number;
  /** Amount of the shipment prices with tax */
  shippingSubTotalWithTax?: number;
  /** Amount of the shipment discount amounts */
  shippingDiscountTotal?: number;
  /** Amount of the shipment discount amounts with tax */
  shippingDiscountTotalWithTax?: number;
  /** Reserved for future needs */
  shippingTaxTotal?: number;
  /** Amount of the payments totals */
  paymentTotal?: number;
  /** Amount of the payment totals with tax */
  paymentTotalWithTax?: number;
  /** Amount of the payment prices */
  paymentSubTotal?: number;
  /** Amount of the payment prices with tax */
  paymentSubTotalWithTax?: number;
  /** Amount of the payments discount amounts */
  paymentDiscountTotal?: number;
  /** Amount of the payment discount amounts with tax */
  paymentDiscountTotalWithTax?: number;
  /** Reserved for future needs */
  paymentTaxTotal?: number;
  /** Amount of the discount amounts of items, shipments and payments, and the order discount amount */
  discountTotal?: number;
  /** Amount of the discount amounts with tax of items, shipments and payments, and the order discount amount with tax */
  discountTotalWithTax?: number;
  /** Any extra fees applied to the order. This value comes from the cart */
  fee?: number;
  /** Order fee with applied tax factor */
  feeWithTax?: number;
  /** Amount of the order fee, as well as any item, shipment, and payment fees */
  feeTotal?: number;
  /** Total fee with applied tax factor */
  feeTotalWithTax?: number;
  /** Reserved for future needs */
  handlingTotal?: number;
  /** Reserved for future needs */
  handlingTotalWithTax?: number;
  /** Tax category or type */
  taxType?: string | undefined;
  /** Amount of tax totals for items, shipments, and payments without the order discount amount with tax factor applied */
  taxTotal?: number;
  taxPercentRate?: number;
  languageCode?: string | undefined;
  operationType?: string | undefined;
  parentOperationId?: string | undefined;
  number?: string | undefined;
  isApproved?: boolean;
  status?: string | undefined;
  comment?: string | undefined;
  currency?: string | undefined;
  sum?: number;
  outerId?: string | undefined;
  /** For system use to handle canellation flow */
  cancelledState?: CustomerOrderCancelledState;
  /** Used by payment provides to indicate that cancellation operation has completed */
  isCancelled?: boolean;
  cancelledDate?: Date | undefined;
  cancelReason?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  operationsLog?: OperationLog[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: ICustomerOrder);
  init(_data?: any): void;
  static fromJS(data: any): CustomerOrder;
  toJSON(data?: any): any;
}
export interface ICustomerOrder {
  rowVersion?: string | undefined;
  customerId?: string | undefined;
  customerName?: string | undefined;
  channelId?: string | undefined;
  storeId?: string | undefined;
  storeName?: string | undefined;
  organizationId?: string | undefined;
  organizationName?: string | undefined;
  employeeId?: string | undefined;
  employeeName?: string | undefined;
  /** The base shopping cart ID the order was created with */
  shoppingCartId?: string | undefined;
  /** This checkbox determines whether the order is a prototype */
  isPrototype?: boolean;
  /** The order internal number provided by customer */
  purchaseOrderNumber?: string | undefined;
  /** Number of subscription associated with this order */
  subscriptionNumber?: string | undefined;
  /** The ID of subscription associated with this order */
  subscriptionId?: string | undefined;
  objectType?: string | undefined;
  addresses?: OrderAddress[] | undefined;
  inPayments?: PaymentIn[] | undefined;
  items?: OrderLineItem[] | undefined;
  shipments?: OrderShipment[] | undefined;
  feeDetails?: FeeDetail[] | undefined;
  discounts?: Discount[] | undefined;
  /** When a discount is applied to the order, the tax calculation has already been applied and is shown in the tax field.
Therefore, the discount will not be taking tax into account.
For instance, if the cart subtotal is $100, and the tax subtotal is $15, a 10% discount will yield a total of $105 ($100 subtotal – $10 discount + $15 tax). */
  discountAmount?: number;
  taxDetails?: TaxDetail[] | undefined;
  scopes?: string[] | undefined;
  /** Order grand total */
  total?: number;
  /** Amount of the item prices */
  subTotal?: number;
  /** Amount of the item prices with tax */
  subTotalWithTax?: number;
  /** Amount of the item discount total */
  subTotalDiscount?: number;
  /** Amount of the item discount total with tax */
  subTotalDiscountWithTax?: number;
  /** Amount of the item tax total */
  subTotalTaxTotal?: number;
  /** Amount of the shipment total */
  shippingTotal?: number;
  /** Amount of the shipment total with tax */
  shippingTotalWithTax?: number;
  /** Amount of the shipment prices */
  shippingSubTotal?: number;
  /** Amount of the shipment prices with tax */
  shippingSubTotalWithTax?: number;
  /** Amount of the shipment discount amounts */
  shippingDiscountTotal?: number;
  /** Amount of the shipment discount amounts with tax */
  shippingDiscountTotalWithTax?: number;
  /** Reserved for future needs */
  shippingTaxTotal?: number;
  /** Amount of the payments totals */
  paymentTotal?: number;
  /** Amount of the payment totals with tax */
  paymentTotalWithTax?: number;
  /** Amount of the payment prices */
  paymentSubTotal?: number;
  /** Amount of the payment prices with tax */
  paymentSubTotalWithTax?: number;
  /** Amount of the payments discount amounts */
  paymentDiscountTotal?: number;
  /** Amount of the payment discount amounts with tax */
  paymentDiscountTotalWithTax?: number;
  /** Reserved for future needs */
  paymentTaxTotal?: number;
  /** Amount of the discount amounts of items, shipments and payments, and the order discount amount */
  discountTotal?: number;
  /** Amount of the discount amounts with tax of items, shipments and payments, and the order discount amount with tax */
  discountTotalWithTax?: number;
  /** Any extra fees applied to the order. This value comes from the cart */
  fee?: number;
  /** Order fee with applied tax factor */
  feeWithTax?: number;
  /** Amount of the order fee, as well as any item, shipment, and payment fees */
  feeTotal?: number;
  /** Total fee with applied tax factor */
  feeTotalWithTax?: number;
  /** Reserved for future needs */
  handlingTotal?: number;
  /** Reserved for future needs */
  handlingTotalWithTax?: number;
  /** Tax category or type */
  taxType?: string | undefined;
  /** Amount of tax totals for items, shipments, and payments without the order discount amount with tax factor applied */
  taxTotal?: number;
  taxPercentRate?: number;
  languageCode?: string | undefined;
  operationType?: string | undefined;
  parentOperationId?: string | undefined;
  number?: string | undefined;
  isApproved?: boolean;
  status?: string | undefined;
  comment?: string | undefined;
  currency?: string | undefined;
  sum?: number;
  outerId?: string | undefined;
  /** For system use to handle canellation flow */
  cancelledState?: CustomerOrderCancelledState;
  /** Used by payment provides to indicate that cancellation operation has completed */
  isCancelled?: boolean;
  cancelledDate?: Date | undefined;
  cancelReason?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  operationsLog?: OperationLog[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class CustomerOrderSearchResult implements ICustomerOrderSearchResult {
  totalCount?: number;
  results?: CustomerOrder[] | undefined;
  constructor(data?: ICustomerOrderSearchResult);
  init(_data?: any): void;
  static fromJS(data: any): CustomerOrderSearchResult;
  toJSON(data?: any): any;
}
export interface ICustomerOrderSearchResult {
  totalCount?: number;
  results?: CustomerOrder[] | undefined;
}
export declare class CustomerReview implements ICustomerReview {
  title?: string | undefined;
  review?: string | undefined;
  rating?: number;
  userId?: string | undefined;
  userName?: string | undefined;
  entityId?: string | undefined;
  entityType?: string | undefined;
  entityName?: string | undefined;
  storeId?: string | undefined;
  reviewStatus?: CustomerReviewReviewStatus;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: ICustomerReview);
  init(_data?: any): void;
  static fromJS(data: any): CustomerReview;
  toJSON(data?: any): any;
}
export interface ICustomerReview {
  title?: string | undefined;
  review?: string | undefined;
  rating?: number;
  userId?: string | undefined;
  userName?: string | undefined;
  entityId?: string | undefined;
  entityType?: string | undefined;
  entityName?: string | undefined;
  storeId?: string | undefined;
  reviewStatus?: CustomerReviewReviewStatus;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare enum CustomerReviewStatus {
  New = "New",
  Approved = "Approved",
  Rejected = "Rejected",
}
export declare class DeleteSellerCategoriesCommand implements IDeleteSellerCategoriesCommand {
  sellerId?: string | undefined;
  categoryIds: string[];
  constructor(data?: IDeleteSellerCategoriesCommand);
  init(_data?: any): void;
  static fromJS(data: any): DeleteSellerCategoriesCommand;
  toJSON(data?: any): any;
}
export interface IDeleteSellerCategoriesCommand {
  sellerId?: string | undefined;
  categoryIds: string[];
}
export declare class Discount implements IDiscount {
  promotionId?: string | undefined;
  currency?: string | undefined;
  discountAmount?: number;
  discountAmountWithTax?: number;
  coupon?: string | undefined;
  description?: string | undefined;
  id?: string | undefined;
  constructor(data?: IDiscount);
  init(_data?: any): void;
  static fromJS(data: any): Discount;
  toJSON(data?: any): any;
}
export interface IDiscount {
  promotionId?: string | undefined;
  currency?: string | undefined;
  discountAmount?: number;
  discountAmountWithTax?: number;
  coupon?: string | undefined;
  description?: string | undefined;
  id?: string | undefined;
}
export declare class DynamicCommissionFee implements IDynamicCommissionFee {
  isActive?: boolean;
  expressionTree?: DynamicCommissionFeeTree | undefined;
  name?: string | undefined;
  description?: string | undefined;
  type?: DynamicCommissionFeeType;
  calculationType?: DynamicCommissionFeeCalculationType;
  fee?: number;
  priority?: number;
  isDefault?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IDynamicCommissionFee);
  init(_data?: any): void;
  static fromJS(data: any): DynamicCommissionFee;
  toJSON(data?: any): any;
}
export interface IDynamicCommissionFee {
  isActive?: boolean;
  expressionTree?: DynamicCommissionFeeTree | undefined;
  name?: string | undefined;
  description?: string | undefined;
  type?: DynamicCommissionFeeType;
  calculationType?: DynamicCommissionFeeCalculationType;
  fee?: number;
  priority?: number;
  isDefault?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class DynamicCommissionFeeTree implements IDynamicCommissionFeeTree {
  all?: boolean;
  not?: boolean;
  readonly id?: string | undefined;
  availableChildren?: IConditionTree[] | undefined;
  children?: IConditionTree[] | undefined;
  constructor(data?: IDynamicCommissionFeeTree);
  init(_data?: any): void;
  static fromJS(data: any): DynamicCommissionFeeTree;
  toJSON(data?: any): any;
}
export interface IDynamicCommissionFeeTree {
  all?: boolean;
  not?: boolean;
  id?: string | undefined;
  availableChildren?: IConditionTree[] | undefined;
  children?: IConditionTree[] | undefined;
}
export declare class DynamicObjectProperty implements IDynamicObjectProperty {
  objectId?: string | undefined;
  values?: DynamicPropertyObjectValue[] | undefined;
  name?: string | undefined;
  /** dynamic property description */
  description?: string | undefined;
  objectType?: string | undefined;
  /** Defines whether a property supports multiple values. */
  isArray?: boolean;
  /** Dictionary has a predefined set of values. User can select one or more of them and cannot enter arbitrary values. */
  isDictionary?: boolean;
  /** For multilingual properties user can enter different values for each of registered languages. */
  isMultilingual?: boolean;
  isRequired?: boolean;
  displayOrder?: number | undefined;
  /** The storage property type */
  valueType?: DynamicObjectPropertyValueType;
  /** Property names for different languages. */
  displayNames?: DynamicPropertyName[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IDynamicObjectProperty);
  init(_data?: any): void;
  static fromJS(data: any): DynamicObjectProperty;
  toJSON(data?: any): any;
}
export interface IDynamicObjectProperty {
  objectId?: string | undefined;
  values?: DynamicPropertyObjectValue[] | undefined;
  name?: string | undefined;
  /** dynamic property description */
  description?: string | undefined;
  objectType?: string | undefined;
  /** Defines whether a property supports multiple values. */
  isArray?: boolean;
  /** Dictionary has a predefined set of values. User can select one or more of them and cannot enter arbitrary values. */
  isDictionary?: boolean;
  /** For multilingual properties user can enter different values for each of registered languages. */
  isMultilingual?: boolean;
  isRequired?: boolean;
  displayOrder?: number | undefined;
  /** The storage property type */
  valueType?: DynamicObjectPropertyValueType;
  /** Property names for different languages. */
  displayNames?: DynamicPropertyName[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class DynamicPropertyName implements IDynamicPropertyName {
  /** Language ID, e.g. en-US. */
  locale?: string | undefined;
  name?: string | undefined;
  constructor(data?: IDynamicPropertyName);
  init(_data?: any): void;
  static fromJS(data: any): DynamicPropertyName;
  toJSON(data?: any): any;
}
export interface IDynamicPropertyName {
  /** Language ID, e.g. en-US. */
  locale?: string | undefined;
  name?: string | undefined;
}
export declare class DynamicPropertyObjectValue implements IDynamicPropertyObjectValue {
  objectType?: string | undefined;
  objectId?: string | undefined;
  locale?: string | undefined;
  value?: any | undefined;
  valueId?: string | undefined;
  valueType?: DynamicPropertyObjectValueValueType;
  propertyId?: string | undefined;
  propertyName?: string | undefined;
  constructor(data?: IDynamicPropertyObjectValue);
  init(_data?: any): void;
  static fromJS(data: any): DynamicPropertyObjectValue;
  toJSON(data?: any): any;
}
export interface IDynamicPropertyObjectValue {
  objectType?: string | undefined;
  objectId?: string | undefined;
  locale?: string | undefined;
  value?: any | undefined;
  valueId?: string | undefined;
  valueType?: DynamicPropertyObjectValueValueType;
  propertyId?: string | undefined;
  propertyName?: string | undefined;
}
export declare enum DynamicPropertyValueType {
  Undefined = "Undefined",
  ShortText = "ShortText",
  LongText = "LongText",
  Integer = "Integer",
  Decimal = "Decimal",
  DateTime = "DateTime",
  Boolean = "Boolean",
  Html = "Html",
  Image = "Image",
}
export declare class EditorialReview implements IEditorialReview {
  content?: string | undefined;
  reviewType?: string | undefined;
  languageCode?: string | undefined;
  isInherited?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IEditorialReview);
  init(_data?: any): void;
  static fromJS(data: any): EditorialReview;
  toJSON(data?: any): any;
}
export interface IEditorialReview {
  content?: string | undefined;
  reviewType?: string | undefined;
  languageCode?: string | undefined;
  isInherited?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare enum EntryState {
  Detached = "Detached",
  Unchanged = "Unchanged",
  Added = "Added",
  Deleted = "Deleted",
  Modified = "Modified",
}
export declare class ExcludedProperty implements IExcludedProperty {
  name?: string | undefined;
  isInherited?: boolean;
  constructor(data?: IExcludedProperty);
  init(_data?: any): void;
  static fromJS(data: any): ExcludedProperty;
  toJSON(data?: any): any;
}
export interface IExcludedProperty {
  name?: string | undefined;
  isInherited?: boolean;
}
/** Basic query information for data sources to retrieve exported data: included properties, paging, sorting, etc... Applied data sources expand it by adding certain criteria (for example, additional information for searching) */
export declare class ExportDataQuery implements IExportDataQuery {
  /** This used to instantiate a data query of this type at export start. */
  readonly exportTypeName?: string | undefined;
  /** Keyword to search data */
  keyword?: string | undefined;
  /** Object keys to search data */
  objectIds?: string[] | undefined;
  /** How to sort the dataset matching a query */
  sort?: string | undefined;
  /** User selected properties to export */
  includedProperties?: ExportedTypePropertyInfo[] | undefined;
  /** Paging: skip records */
  skip?: number | undefined;
  /** Paging: records in one page */
  take?: number | undefined;
  /** True means preview (lightweight) data is queried, false - full version requested */
  isPreview?: boolean;
  constructor(data?: IExportDataQuery);
  init(_data?: any): void;
  static fromJS(data: any): ExportDataQuery;
  toJSON(data?: any): any;
}
/** Basic query information for data sources to retrieve exported data: included properties, paging, sorting, etc... Applied data sources expand it by adding certain criteria (for example, additional information for searching) */
export interface IExportDataQuery {
  /** This used to instantiate a data query of this type at export start. */
  exportTypeName?: string | undefined;
  /** Keyword to search data */
  keyword?: string | undefined;
  /** Object keys to search data */
  objectIds?: string[] | undefined;
  /** How to sort the dataset matching a query */
  sort?: string | undefined;
  /** User selected properties to export */
  includedProperties?: ExportedTypePropertyInfo[] | undefined;
  /** Paging: skip records */
  skip?: number | undefined;
  /** Paging: records in one page */
  take?: number | undefined;
  /** True means preview (lightweight) data is queried, false - full version requested */
  isPreview?: boolean;
}
/** Export property information */
export declare class ExportedTypePropertyInfo implements IExportedTypePropertyInfo {
  /** Property name with the path from the exportable entity (e.g. for entity containing PropertyA with nested properties it could be "PropertyA.PropertyB.PropertyC"). */
  fullName?: string | undefined;
  /** Property group. Properties can be divided into different groups to simplify selection.
Group could be used for grouping property infos. */
  group?: string | undefined;
  /** User-friendly name for this property */
  displayName?: string | undefined;
  /** * Reserved for future use */
  isRequired?: boolean;
  constructor(data?: IExportedTypePropertyInfo);
  init(_data?: any): void;
  static fromJS(data: any): ExportedTypePropertyInfo;
  toJSON(data?: any): any;
}
/** Export property information */
export interface IExportedTypePropertyInfo {
  /** Property name with the path from the exportable entity (e.g. for entity containing PropertyA with nested properties it could be "PropertyA.PropertyB.PropertyC"). */
  fullName?: string | undefined;
  /** Property group. Properties can be divided into different groups to simplify selection.
Group could be used for grouping property infos. */
  group?: string | undefined;
  /** User-friendly name for this property */
  displayName?: string | undefined;
  /** * Reserved for future use */
  isRequired?: boolean;
}
export declare enum FeeCalculationType {
  Fixed = "Fixed",
  Percent = "Percent",
}
export declare class FeeDetail implements IFeeDetail {
  feeId?: string | undefined;
  currency?: string | undefined;
  amount?: number;
  description?: string | undefined;
  constructor(data?: IFeeDetail);
  init(_data?: any): void;
  static fromJS(data: any): FeeDetail;
  toJSON(data?: any): any;
}
export interface IFeeDetail {
  feeId?: string | undefined;
  currency?: string | undefined;
  amount?: number;
  description?: string | undefined;
}
export declare class ForgotPasswordCommand implements IForgotPasswordCommand {
  loginOrEmail: string;
  constructor(data?: IForgotPasswordCommand);
  init(_data?: any): void;
  static fromJS(data: any): ForgotPasswordCommand;
  toJSON(data?: any): any;
}
export interface IForgotPasswordCommand {
  loginOrEmail: string;
}
export declare class FulfillmentCenter implements IFulfillmentCenter {
  name?: string | undefined;
  description?: string | undefined;
  shortDescription?: string | undefined;
  geoLocation?: string | undefined;
  address?: InventoryAddress | undefined;
  outerId?: string | undefined;
  organizationId?: string | undefined;
  readonly objectType?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IFulfillmentCenter);
  init(_data?: any): void;
  static fromJS(data: any): FulfillmentCenter;
  toJSON(data?: any): any;
}
export interface IFulfillmentCenter {
  name?: string | undefined;
  description?: string | undefined;
  shortDescription?: string | undefined;
  geoLocation?: string | undefined;
  address?: InventoryAddress | undefined;
  outerId?: string | undefined;
  organizationId?: string | undefined;
  objectType?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class FulfillOrderCommand implements IFulfillOrderCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  orderId: string;
  fulfillDetails?: FulfillOrderDetails | undefined;
  constructor(data?: IFulfillOrderCommand);
  init(_data?: any): void;
  static fromJS(data: any): FulfillOrderCommand;
  toJSON(data?: any): any;
}
export interface IFulfillOrderCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  orderId: string;
  fulfillDetails?: FulfillOrderDetails | undefined;
}
export declare class FulfillOrderDetails implements IFulfillOrderDetails {
  trackingNumber?: string | undefined;
  trackingUrl?: string | undefined;
  deliveryDate?: Date | undefined;
  constructor(data?: IFulfillOrderDetails);
  init(_data?: any): void;
  static fromJS(data: any): FulfillOrderDetails;
  toJSON(data?: any): any;
}
export interface IFulfillOrderDetails {
  trackingNumber?: string | undefined;
  trackingUrl?: string | undefined;
  deliveryDate?: Date | undefined;
}
export declare class IAuthorizationRequirement implements IIAuthorizationRequirement {
  constructor(data?: IIAuthorizationRequirement);
  init(_data?: any): void;
  static fromJS(data: any): IAuthorizationRequirement;
  toJSON(data?: any): any;
}
export interface IIAuthorizationRequirement {}
export declare class IConditionTree implements IIConditionTree {
  readonly id?: string | undefined;
  /** List of all available children for current tree node (is used in expression designer) */
  readonly availableChildren?: IConditionTree[] | undefined;
  readonly children?: IConditionTree[] | undefined;
  constructor(data?: IIConditionTree);
  init(_data?: any): void;
  static fromJS(data: any): IConditionTree;
  toJSON(data?: any): any;
}
export interface IIConditionTree {
  id?: string | undefined;
  /** List of all available children for current tree node (is used in expression designer) */
  availableChildren?: IConditionTree[] | undefined;
  children?: IConditionTree[] | undefined;
}
export declare class IDataImporter implements IIDataImporter {
  readonly typeName?: string | undefined;
  readonly metadata?:
    | {
        [key: string]: string;
      }
    | undefined;
  availSettings?: SettingDescriptor[] | undefined;
  authorizationRequirement?: IAuthorizationRequirement | undefined;
  constructor(data?: IIDataImporter);
  init(_data?: any): void;
  static fromJS(data: any): IDataImporter;
  toJSON(data?: any): any;
}
export interface IIDataImporter {
  typeName?: string | undefined;
  metadata?:
    | {
        [key: string]: string;
      }
    | undefined;
  availSettings?: SettingDescriptor[] | undefined;
  authorizationRequirement?: IAuthorizationRequirement | undefined;
}
export declare class IExportProviderConfiguration implements IIExportProviderConfiguration {
  /** Type discriminator to instantiate proper descendant (e.g. thru the universal PolymorphJsonConverter) */
  type?: string | undefined;
  constructor(data?: IIExportProviderConfiguration);
  init(_data?: any): void;
  static fromJS(data: any): IExportProviderConfiguration;
  toJSON(data?: any): any;
}
export interface IIExportProviderConfiguration {
  /** Type discriminator to instantiate proper descendant (e.g. thru the universal PolymorphJsonConverter) */
  type?: string | undefined;
}
export declare class IHasDynamicProperties implements IIHasDynamicProperties {
  readonly objectType?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  id?: string | undefined;
  constructor(data?: IIHasDynamicProperties);
  init(_data?: any): void;
  static fromJS(data: any): IHasDynamicProperties;
  toJSON(data?: any): any;
}
export interface IIHasDynamicProperties {
  objectType?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  id?: string | undefined;
}
export declare class Image implements IImage {
  binaryData?: string | undefined;
  altText?: string | undefined;
  relativeUrl?: string | undefined;
  url?: string | undefined;
  description?: string | undefined;
  sortOrder?: number;
  /** Gets or sets the asset type identifier. */
  typeId?: string | undefined;
  /** Gets or sets the asset group name. */
  group?: string | undefined;
  /** Gets or sets the asset name. */
  name?: string | undefined;
  outerId?: string | undefined;
  /** Gets or sets the asset language. */
  languageCode?: string | undefined;
  /** System flag used to mark that object was inherited from other */
  readonly isInherited?: boolean;
  readonly seoObjectType?: string | undefined;
  seoInfos?: SeoInfo[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IImage);
  init(_data?: any): void;
  static fromJS(data: any): Image;
  toJSON(data?: any): any;
}
export interface IImage {
  binaryData?: string | undefined;
  altText?: string | undefined;
  relativeUrl?: string | undefined;
  url?: string | undefined;
  description?: string | undefined;
  sortOrder?: number;
  /** Gets or sets the asset type identifier. */
  typeId?: string | undefined;
  /** Gets or sets the asset group name. */
  group?: string | undefined;
  /** Gets or sets the asset name. */
  name?: string | undefined;
  outerId?: string | undefined;
  /** Gets or sets the asset language. */
  languageCode?: string | undefined;
  /** System flag used to mark that object was inherited from other */
  isInherited?: boolean;
  seoObjectType?: string | undefined;
  seoInfos?: SeoInfo[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class ImportCancellationRequest implements IImportCancellationRequest {
  jobId?: string | undefined;
  constructor(data?: IImportCancellationRequest);
  init(_data?: any): void;
  static fromJS(data: any): ImportCancellationRequest;
  toJSON(data?: any): any;
}
export interface IImportCancellationRequest {
  jobId?: string | undefined;
}
export declare class ImportDataPreview implements IImportDataPreview {
  totalCount?: number;
  fileName?: string | undefined;
  records?: any[] | undefined;
  errors?: string[] | undefined;
  constructor(data?: IImportDataPreview);
  init(_data?: any): void;
  static fromJS(data: any): ImportDataPreview;
  toJSON(data?: any): any;
}
export interface IImportDataPreview {
  totalCount?: number;
  fileName?: string | undefined;
  records?: any[] | undefined;
  errors?: string[] | undefined;
}
export declare class ImportProfile implements IImportProfile {
  name?: string | undefined;
  dataImporterType?: string | undefined;
  userId?: string | undefined;
  userName?: string | undefined;
  settings?: ObjectSettingEntry[] | undefined;
  readonly typeName?: string | undefined;
  profileType?: string | undefined;
  importFileUrl?: string | undefined;
  importReportUrl?: string | undefined;
  importReporterType?: string | undefined;
  previewObjectCount?: number;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IImportProfile);
  init(_data?: any): void;
  static fromJS(data: any): ImportProfile;
  toJSON(data?: any): any;
}
export interface IImportProfile {
  name?: string | undefined;
  dataImporterType?: string | undefined;
  userId?: string | undefined;
  userName?: string | undefined;
  settings?: ObjectSettingEntry[] | undefined;
  typeName?: string | undefined;
  profileType?: string | undefined;
  importFileUrl?: string | undefined;
  importReportUrl?: string | undefined;
  importReporterType?: string | undefined;
  previewObjectCount?: number;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class ImportPushNotification implements IImportPushNotification {
  profileId?: string | undefined;
  profileName?: string | undefined;
  jobId?: string | undefined;
  estimatingRemaining?: boolean;
  estimatedRemaining?: string | undefined;
  finished?: Date | undefined;
  totalCount?: number;
  processedCount?: number;
  readonly errorCount?: number;
  errors?: string[] | undefined;
  reportUrl?: string | undefined;
  serverId?: string | undefined;
  creator?: string | undefined;
  created?: Date;
  isNew?: boolean;
  notifyType?: string | undefined;
  description?: string | undefined;
  title?: string | undefined;
  repeatCount?: number;
  id?: string | undefined;
  constructor(data?: IImportPushNotification);
  init(_data?: any): void;
  static fromJS(data: any): ImportPushNotification;
  toJSON(data?: any): any;
}
export interface IImportPushNotification {
  profileId?: string | undefined;
  profileName?: string | undefined;
  jobId?: string | undefined;
  estimatingRemaining?: boolean;
  estimatedRemaining?: string | undefined;
  finished?: Date | undefined;
  totalCount?: number;
  processedCount?: number;
  errorCount?: number;
  errors?: string[] | undefined;
  reportUrl?: string | undefined;
  serverId?: string | undefined;
  creator?: string | undefined;
  created?: Date;
  isNew?: boolean;
  notifyType?: string | undefined;
  description?: string | undefined;
  title?: string | undefined;
  repeatCount?: number;
  id?: string | undefined;
}
export declare class ImportRunHistory implements IImportRunHistory {
  userId?: string | undefined;
  userName?: string | undefined;
  jobId?: string | undefined;
  profileId?: string | undefined;
  profileName?: string | undefined;
  executed?: Date;
  finished?: Date | undefined;
  totalCount?: number;
  processedCount?: number;
  errorsCount?: number;
  errors?: string[] | undefined;
  fileUrl?: string | undefined;
  reportUrl?: string | undefined;
  readonly typeName?: string | undefined;
  settings?: ObjectSettingEntry[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IImportRunHistory);
  init(_data?: any): void;
  static fromJS(data: any): ImportRunHistory;
  toJSON(data?: any): any;
}
export interface IImportRunHistory {
  userId?: string | undefined;
  userName?: string | undefined;
  jobId?: string | undefined;
  profileId?: string | undefined;
  profileName?: string | undefined;
  executed?: Date;
  finished?: Date | undefined;
  totalCount?: number;
  processedCount?: number;
  errorsCount?: number;
  errors?: string[] | undefined;
  fileUrl?: string | undefined;
  reportUrl?: string | undefined;
  typeName?: string | undefined;
  settings?: ObjectSettingEntry[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class InventoryAddress implements IInventoryAddress {
  addressType?: InventoryAddressAddressType;
  key?: string | undefined;
  name?: string | undefined;
  organization?: string | undefined;
  countryCode?: string | undefined;
  countryName?: string | undefined;
  city?: string | undefined;
  postalCode?: string | undefined;
  zip?: string | undefined;
  line1?: string | undefined;
  line2?: string | undefined;
  regionId?: string | undefined;
  regionName?: string | undefined;
  firstName?: string | undefined;
  middleName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  outerId?: string | undefined;
  isDefault?: boolean;
  description?: string | undefined;
  constructor(data?: IInventoryAddress);
  init(_data?: any): void;
  static fromJS(data: any): InventoryAddress;
  toJSON(data?: any): any;
}
export interface IInventoryAddress {
  addressType?: InventoryAddressAddressType;
  key?: string | undefined;
  name?: string | undefined;
  organization?: string | undefined;
  countryCode?: string | undefined;
  countryName?: string | undefined;
  city?: string | undefined;
  postalCode?: string | undefined;
  zip?: string | undefined;
  line1?: string | undefined;
  line2?: string | undefined;
  regionId?: string | undefined;
  regionName?: string | undefined;
  firstName?: string | undefined;
  middleName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  outerId?: string | undefined;
  isDefault?: boolean;
  description?: string | undefined;
}
export declare class InventoryInfo implements IInventoryInfo {
  fulfillmentCenterId?: string | undefined;
  fulfillmentCenterName?: string | undefined;
  fulfillmentCenter?: FulfillmentCenter | undefined;
  productId?: string | undefined;
  inStockQuantity?: number;
  reservedQuantity?: number;
  reorderMinQuantity?: number;
  preorderQuantity?: number;
  backorderQuantity?: number;
  allowBackorder?: boolean;
  allowPreorder?: boolean;
  inTransit?: number;
  preorderAvailabilityDate?: Date | undefined;
  backorderAvailabilityDate?: Date | undefined;
  status?: InventoryInfoStatus;
  outerId?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IInventoryInfo);
  init(_data?: any): void;
  static fromJS(data: any): InventoryInfo;
  toJSON(data?: any): any;
}
export interface IInventoryInfo {
  fulfillmentCenterId?: string | undefined;
  fulfillmentCenterName?: string | undefined;
  fulfillmentCenter?: FulfillmentCenter | undefined;
  productId?: string | undefined;
  inStockQuantity?: number;
  reservedQuantity?: number;
  reorderMinQuantity?: number;
  preorderQuantity?: number;
  backorderQuantity?: number;
  allowBackorder?: boolean;
  allowPreorder?: boolean;
  inTransit?: number;
  preorderAvailabilityDate?: Date | undefined;
  backorderAvailabilityDate?: Date | undefined;
  status?: InventoryInfoStatus;
  outerId?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare enum InventoryStatus {
  Disabled = "Disabled",
  Enabled = "Enabled",
  Ignored = "Ignored",
}
export declare class IOperation implements IIOperation {
  operationType?: string | undefined;
  parentOperationId?: string | undefined;
  number?: string | undefined;
  isApproved?: boolean;
  status?: string | undefined;
  comment?: string | undefined;
  currency?: string | undefined;
  childrenOperations?: IOperation[] | undefined;
  id?: string | undefined;
  constructor(data?: IIOperation);
  init(_data?: any): void;
  static fromJS(data: any): IOperation;
  toJSON(data?: any): any;
}
export interface IIOperation {
  operationType?: string | undefined;
  parentOperationId?: string | undefined;
  number?: string | undefined;
  isApproved?: boolean;
  status?: string | undefined;
  comment?: string | undefined;
  currency?: string | undefined;
  childrenOperations?: IOperation[] | undefined;
  id?: string | undefined;
}
export declare class ISyncClient implements IISyncClient {
  readonly typeName?: string | undefined;
  readonly displayName?: string | undefined;
  readonly isActive?: boolean;
  readonly lastSyncDate?: Date | undefined;
  readonly lastSyncError?: string | undefined;
  constructor(data?: IISyncClient);
  init(_data?: any): void;
  static fromJS(data: any): ISyncClient;
  toJSON(data?: any): any;
}
export interface IISyncClient {
  typeName?: string | undefined;
  displayName?: string | undefined;
  isActive?: boolean;
  lastSyncDate?: Date | undefined;
  lastSyncError?: string | undefined;
}
export declare class MarketplaceSettings implements IMarketplaceSettings {
  defaultCurrency?: string | undefined;
  currencies?: string[] | undefined;
  defaultLanguage?: string | undefined;
  languages?: string[] | undefined;
  defaultProductType?: string | undefined;
  productTypes?: string[] | undefined;
  masterCatalogId: string;
  storeId: string;
  vendorPortalUrl?: string | undefined;
  constructor(data?: IMarketplaceSettings);
  init(_data?: any): void;
  static fromJS(data: any): MarketplaceSettings;
  toJSON(data?: any): any;
}
export interface IMarketplaceSettings {
  defaultCurrency?: string | undefined;
  currencies?: string[] | undefined;
  defaultLanguage?: string | undefined;
  languages?: string[] | undefined;
  defaultProductType?: string | undefined;
  productTypes?: string[] | undefined;
  masterCatalogId: string;
  storeId: string;
  vendorPortalUrl?: string | undefined;
}
export declare class ObjectSettingEntry implements IObjectSettingEntry {
  readonly itHasValues?: boolean;
  /** Setting may belong to any object in system */
  objectId?: string | undefined;
  objectType?: string | undefined;
  /** Flag indicates the this setting is read only and can't be changed */
  isReadOnly?: boolean;
  value?: any | undefined;
  id?: string | undefined;
  /** The flag indicates that you need to restart the application to apply this setting changes. */
  restartRequired?: boolean;
  /** The module id which setting belong to */
  moduleId?: string | undefined;
  /** Setting group name */
  groupName?: string | undefined;
  /** Setting name */
  name?: string | undefined;
  /** Display setting name */
  displayName?: string | undefined;
  isRequired?: boolean;
  /** Flag indicates that this setting doesn't need to be displayed on the UI */
  isHidden?: boolean;
  valueType?: ObjectSettingEntryValueType;
  allowedValues?: any[] | undefined;
  defaultValue?: any | undefined;
  /** The flag indicates what current setting is just editable dictionary and hasn't any concrete value */
  isDictionary?: boolean;
  constructor(data?: IObjectSettingEntry);
  init(_data?: any): void;
  static fromJS(data: any): ObjectSettingEntry;
  toJSON(data?: any): any;
}
export interface IObjectSettingEntry {
  itHasValues?: boolean;
  /** Setting may belong to any object in system */
  objectId?: string | undefined;
  objectType?: string | undefined;
  /** Flag indicates the this setting is read only and can't be changed */
  isReadOnly?: boolean;
  value?: any | undefined;
  id?: string | undefined;
  /** The flag indicates that you need to restart the application to apply this setting changes. */
  restartRequired?: boolean;
  /** The module id which setting belong to */
  moduleId?: string | undefined;
  /** Setting group name */
  groupName?: string | undefined;
  /** Setting name */
  name?: string | undefined;
  /** Display setting name */
  displayName?: string | undefined;
  isRequired?: boolean;
  /** Flag indicates that this setting doesn't need to be displayed on the UI */
  isHidden?: boolean;
  valueType?: ObjectSettingEntryValueType;
  allowedValues?: any[] | undefined;
  defaultValue?: any | undefined;
  /** The flag indicates what current setting is just editable dictionary and hasn't any concrete value */
  isDictionary?: boolean;
}
export declare class Offer implements IOffer {
  isSuspended?: boolean;
  isActive?: boolean;
  outerId?: string | undefined;
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  storeId?: string | undefined;
  storeName?: string | undefined;
  name?: string | undefined;
  sku?: string | undefined;
  readonly imgSrc?: string | undefined;
  images?: Image[] | undefined;
  categoryId?: string | undefined;
  path?: string | undefined;
  prices?: OfferPrice[] | undefined;
  properties?: Property[] | undefined;
  inStockQuantity?: number;
  readonly availQuantity?: number;
  trackInventory?: boolean;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  estimatedDeliveryDate?: string | undefined;
  productId?: string | undefined;
  mainProductData?: CatalogProduct | undefined;
  stagedProductId?: string | undefined;
  readonly variationId?: string | undefined;
  variationData?: CatalogProduct | undefined;
  sellerProductId?: string | undefined;
  inventory?: InventoryInfo[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  newField?: string;
  constructor(data?: IOffer);
  init(_data?: any): void;
  static fromJS(data: any): Offer;
  toJSON(data?: any): any;
}
export interface IOffer {
  isSuspended?: boolean;
  isActive?: boolean;
  outerId?: string | undefined;
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  storeId?: string | undefined;
  storeName?: string | undefined;
  name?: string | undefined;
  sku?: string | undefined;
  imgSrc?: string | undefined;
  images?: Image[] | undefined;
  categoryId?: string | undefined;
  path?: string | undefined;
  prices?: OfferPrice[] | undefined;
  properties?: Property[] | undefined;
  inStockQuantity?: number;
  availQuantity?: number;
  trackInventory?: boolean;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  estimatedDeliveryDate?: string | undefined;
  productId?: string | undefined;
  mainProductData?: CatalogProduct | undefined;
  stagedProductId?: string | undefined;
  variationId?: string | undefined;
  variationData?: CatalogProduct | undefined;
  sellerProductId?: string | undefined;
  inventory?: InventoryInfo[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  mockInputData?: string;
}
export declare class OfferDetails implements IOfferDetails {
  productId?: string | undefined;
  isActive?: boolean;
  outerId?: string | undefined;
  name?: string | undefined;
  sku: string;
  prices?: OfferPrice[] | undefined;
  inStockQuantity?: number;
  trackInventory?: boolean;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  estimatedDeliveryDate?: string | undefined;
  images?: Image[] | undefined;
  properties?: Property[] | undefined;
  inventory?: InventoryInfo[] | undefined;
  constructor(data?: IOfferDetails);
  init(_data?: any): void;
  static fromJS(data: any): OfferDetails;
  toJSON(data?: any): any;
}
export interface IOfferDetails {
  productId?: string | undefined;
  isActive?: boolean;
  outerId?: string | undefined;
  name?: string | undefined;
  sku: string;
  prices?: OfferPrice[] | undefined;
  inStockQuantity?: number;
  trackInventory?: boolean;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  estimatedDeliveryDate?: string | undefined;
  images?: Image[] | undefined;
  properties?: Property[] | undefined;
  inventory?: InventoryInfo[] | undefined;
}
export declare class OfferPrice implements IOfferPrice {
  currency: string;
  listPrice: number;
  salePrice?: number | undefined;
  minQuantity: number;
  id?: string | undefined;
  constructor(data?: IOfferPrice);
  init(_data?: any): void;
  static fromJS(data: any): OfferPrice;
  toJSON(data?: any): any;
}
export interface IOfferPrice {
  currency: string;
  listPrice: number;
  salePrice?: number | undefined;
  minQuantity: number;
  id?: string | undefined;
}
export declare class OfferProduct implements IOfferProduct {
  name?: string | undefined;
  sellerProductId?: string | undefined;
  sku?: string | undefined;
  imgSrc?: string | undefined;
  categoryId?: string | undefined;
  path?: string | undefined;
  properties?: Property[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IOfferProduct);
  init(_data?: any): void;
  static fromJS(data: any): OfferProduct;
  toJSON(data?: any): any;
}
export interface IOfferProduct {
  name?: string | undefined;
  sellerProductId?: string | undefined;
  sku?: string | undefined;
  imgSrc?: string | undefined;
  categoryId?: string | undefined;
  path?: string | undefined;
  properties?: Property[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class OperationLog implements IOperationLog {
  objectType?: string | undefined;
  objectId?: string | undefined;
  operationType?: OperationLogOperationType;
  detail?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IOperationLog);
  init(_data?: any): void;
  static fromJS(data: any): OperationLog;
  toJSON(data?: any): any;
}
export interface IOperationLog {
  objectType?: string | undefined;
  objectId?: string | undefined;
  operationType?: OperationLogOperationType;
  detail?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class OrderAddress implements IOrderAddress {
  addressType?: OrderAddressAddressType;
  key?: string | undefined;
  name?: string | undefined;
  organization?: string | undefined;
  countryCode?: string | undefined;
  countryName?: string | undefined;
  city?: string | undefined;
  postalCode?: string | undefined;
  zip?: string | undefined;
  line1?: string | undefined;
  line2?: string | undefined;
  regionId?: string | undefined;
  regionName?: string | undefined;
  firstName?: string | undefined;
  middleName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  outerId?: string | undefined;
  isDefault?: boolean;
  description?: string | undefined;
  constructor(data?: IOrderAddress);
  init(_data?: any): void;
  static fromJS(data: any): OrderAddress;
  toJSON(data?: any): any;
}
export interface IOrderAddress {
  addressType?: OrderAddressAddressType;
  key?: string | undefined;
  name?: string | undefined;
  organization?: string | undefined;
  countryCode?: string | undefined;
  countryName?: string | undefined;
  city?: string | undefined;
  postalCode?: string | undefined;
  zip?: string | undefined;
  line1?: string | undefined;
  line2?: string | undefined;
  regionId?: string | undefined;
  regionName?: string | undefined;
  firstName?: string | undefined;
  middleName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  outerId?: string | undefined;
  isDefault?: boolean;
  description?: string | undefined;
}
export declare class OrderLineItem implements IOrderLineItem {
  /** Price id */
  priceId?: string | undefined;
  currency?: string | undefined;
  /** unit price without discount and tax */
  price?: number;
  priceWithTax?: number;
  /** Resulting price with discount for one unit */
  placedPrice?: number;
  placedPriceWithTax?: number;
  extendedPrice?: number;
  extendedPriceWithTax?: number;
  /** Gets the value of the single qty line item discount amount */
  discountAmount?: number;
  discountAmountWithTax?: number;
  discountTotal?: number;
  discountTotalWithTax?: number;
  fee?: number;
  feeWithTax?: number;
  /** Tax category or type */
  taxType?: string | undefined;
  taxTotal?: number;
  taxPercentRate?: number;
  /** Reserve quantity */
  reserveQuantity?: number;
  quantity?: number;
  productId?: string | undefined;
  sku?: string | undefined;
  productType?: string | undefined;
  catalogId?: string | undefined;
  categoryId?: string | undefined;
  name?: string | undefined;
  comment?: string | undefined;
  status?: string | undefined;
  imageUrl?: string | undefined;
  isGift?: boolean | undefined;
  shippingMethodCode?: string | undefined;
  fulfillmentLocationCode?: string | undefined;
  fulfillmentCenterId?: string | undefined;
  fulfillmentCenterName?: string | undefined;
  outerId?: string | undefined;
  feeDetails?: FeeDetail[] | undefined;
  vendorId?: string | undefined;
  weightUnit?: string | undefined;
  weight?: number | undefined;
  measureUnit?: string | undefined;
  height?: number | undefined;
  length?: number | undefined;
  width?: number | undefined;
  isCancelled?: boolean;
  cancelledDate?: Date | undefined;
  cancelReason?: string | undefined;
  readonly objectType?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  discounts?: Discount[] | undefined;
  taxDetails?: TaxDetail[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IOrderLineItem);
  init(_data?: any): void;
  static fromJS(data: any): OrderLineItem;
  toJSON(data?: any): any;
}
export interface IOrderLineItem {
  /** Price id */
  priceId?: string | undefined;
  currency?: string | undefined;
  /** unit price without discount and tax */
  price?: number;
  priceWithTax?: number;
  /** Resulting price with discount for one unit */
  placedPrice?: number;
  placedPriceWithTax?: number;
  extendedPrice?: number;
  extendedPriceWithTax?: number;
  /** Gets the value of the single qty line item discount amount */
  discountAmount?: number;
  discountAmountWithTax?: number;
  discountTotal?: number;
  discountTotalWithTax?: number;
  fee?: number;
  feeWithTax?: number;
  /** Tax category or type */
  taxType?: string | undefined;
  taxTotal?: number;
  taxPercentRate?: number;
  /** Reserve quantity */
  reserveQuantity?: number;
  quantity?: number;
  productId?: string | undefined;
  sku?: string | undefined;
  productType?: string | undefined;
  catalogId?: string | undefined;
  categoryId?: string | undefined;
  name?: string | undefined;
  comment?: string | undefined;
  status?: string | undefined;
  imageUrl?: string | undefined;
  isGift?: boolean | undefined;
  shippingMethodCode?: string | undefined;
  fulfillmentLocationCode?: string | undefined;
  fulfillmentCenterId?: string | undefined;
  fulfillmentCenterName?: string | undefined;
  outerId?: string | undefined;
  feeDetails?: FeeDetail[] | undefined;
  vendorId?: string | undefined;
  weightUnit?: string | undefined;
  weight?: number | undefined;
  measureUnit?: string | undefined;
  height?: number | undefined;
  length?: number | undefined;
  width?: number | undefined;
  isCancelled?: boolean;
  cancelledDate?: Date | undefined;
  cancelReason?: string | undefined;
  objectType?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  discounts?: Discount[] | undefined;
  taxDetails?: TaxDetail[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class OrderShipment implements IOrderShipment {
  organizationId?: string | undefined;
  organizationName?: string | undefined;
  fulfillmentCenterId?: string | undefined;
  fulfillmentCenterName?: string | undefined;
  employeeId?: string | undefined;
  employeeName?: string | undefined;
  /** Current shipment method code */
  shipmentMethodCode?: string | undefined;
  /** Current shipment option code */
  shipmentMethodOption?: string | undefined;
  /** Shipment method contains additional shipment method information */
  shippingMethod?: ShippingMethod | undefined;
  customerOrderId?: string | undefined;
  customerOrder?: CustomerOrder | undefined;
  items?: OrderShipmentItem[] | undefined;
  packages?: ShipmentPackage[] | undefined;
  inPayments?: PaymentIn[] | undefined;
  feeDetails?: FeeDetail[] | undefined;
  weightUnit?: string | undefined;
  weight?: number | undefined;
  measureUnit?: string | undefined;
  height?: number | undefined;
  length?: number | undefined;
  width?: number | undefined;
  discounts?: Discount[] | undefined;
  deliveryAddress?: OrderAddress | undefined;
  price?: number;
  priceWithTax?: number;
  total?: number;
  totalWithTax?: number;
  discountAmount?: number;
  discountAmountWithTax?: number;
  fee?: number;
  feeWithTax?: number;
  /** Tracking information */
  trackingNumber?: string | undefined;
  trackingUrl?: string | undefined;
  deliveryDate?: Date | undefined;
  objectType?: string | undefined;
  vendorId?: string | undefined;
  /** Tax category or type */
  taxType?: string | undefined;
  taxTotal?: number;
  taxPercentRate?: number;
  taxDetails?: TaxDetail[] | undefined;
  operationType?: string | undefined;
  parentOperationId?: string | undefined;
  number?: string | undefined;
  isApproved?: boolean;
  status?: string | undefined;
  comment?: string | undefined;
  currency?: string | undefined;
  sum?: number;
  outerId?: string | undefined;
  /** For system use to handle canellation flow */
  cancelledState?: OrderShipmentCancelledState;
  /** Used by payment provides to indicate that cancellation operation has completed */
  isCancelled?: boolean;
  cancelledDate?: Date | undefined;
  cancelReason?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  operationsLog?: OperationLog[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IOrderShipment);
  init(_data?: any): void;
  static fromJS(data: any): OrderShipment;
  toJSON(data?: any): any;
}
export interface IOrderShipment {
  organizationId?: string | undefined;
  organizationName?: string | undefined;
  fulfillmentCenterId?: string | undefined;
  fulfillmentCenterName?: string | undefined;
  employeeId?: string | undefined;
  employeeName?: string | undefined;
  /** Current shipment method code */
  shipmentMethodCode?: string | undefined;
  /** Current shipment option code */
  shipmentMethodOption?: string | undefined;
  /** Shipment method contains additional shipment method information */
  shippingMethod?: ShippingMethod | undefined;
  customerOrderId?: string | undefined;
  customerOrder?: CustomerOrder | undefined;
  items?: OrderShipmentItem[] | undefined;
  packages?: ShipmentPackage[] | undefined;
  inPayments?: PaymentIn[] | undefined;
  feeDetails?: FeeDetail[] | undefined;
  weightUnit?: string | undefined;
  weight?: number | undefined;
  measureUnit?: string | undefined;
  height?: number | undefined;
  length?: number | undefined;
  width?: number | undefined;
  discounts?: Discount[] | undefined;
  deliveryAddress?: OrderAddress | undefined;
  price?: number;
  priceWithTax?: number;
  total?: number;
  totalWithTax?: number;
  discountAmount?: number;
  discountAmountWithTax?: number;
  fee?: number;
  feeWithTax?: number;
  /** Tracking information */
  trackingNumber?: string | undefined;
  trackingUrl?: string | undefined;
  deliveryDate?: Date | undefined;
  objectType?: string | undefined;
  vendorId?: string | undefined;
  /** Tax category or type */
  taxType?: string | undefined;
  taxTotal?: number;
  taxPercentRate?: number;
  taxDetails?: TaxDetail[] | undefined;
  operationType?: string | undefined;
  parentOperationId?: string | undefined;
  number?: string | undefined;
  isApproved?: boolean;
  status?: string | undefined;
  comment?: string | undefined;
  currency?: string | undefined;
  sum?: number;
  outerId?: string | undefined;
  /** For system use to handle canellation flow */
  cancelledState?: OrderShipmentCancelledState;
  /** Used by payment provides to indicate that cancellation operation has completed */
  isCancelled?: boolean;
  cancelledDate?: Date | undefined;
  cancelReason?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  operationsLog?: OperationLog[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class OrderShipmentItem implements IOrderShipmentItem {
  lineItemId?: string | undefined;
  lineItem?: OrderLineItem | undefined;
  barCode?: string | undefined;
  quantity?: number;
  outerId?: string | undefined;
  status?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IOrderShipmentItem);
  init(_data?: any): void;
  static fromJS(data: any): OrderShipmentItem;
  toJSON(data?: any): any;
}
export interface IOrderShipmentItem {
  lineItemId?: string | undefined;
  lineItem?: OrderLineItem | undefined;
  barCode?: string | undefined;
  quantity?: number;
  outerId?: string | undefined;
  status?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
/** Represents the path from the catalog to one of the child objects (product or category): catalog/parent-category1/.../parent-categoryN/object */
export declare class Outline implements IOutline {
  /** Outline parts */
  items?: OutlineItem[] | undefined;
  constructor(data?: IOutline);
  init(_data?: any): void;
  static fromJS(data: any): Outline;
  toJSON(data?: any): any;
}
/** Represents the path from the catalog to one of the child objects (product or category): catalog/parent-category1/.../parent-categoryN/object */
export interface IOutline {
  /** Outline parts */
  items?: OutlineItem[] | undefined;
}
/** Represents one outline element: catalog, category or product. */
export declare class OutlineItem implements IOutlineItem {
  /** Object id */
  id?: string | undefined;
  /** Object type */
  seoObjectType?: string | undefined;
  /** All SEO records for the object */
  seoInfos?: SeoInfo[] | undefined;
  /** The name of current item */
  name?: string | undefined;
  /** True when this object is linked to the virtual parent. */
  hasVirtualParent?: boolean;
  constructor(data?: IOutlineItem);
  init(_data?: any): void;
  static fromJS(data: any): OutlineItem;
  toJSON(data?: any): any;
}
/** Represents one outline element: catalog, category or product. */
export interface IOutlineItem {
  /** Object id */
  id?: string | undefined;
  /** Object type */
  seoObjectType?: string | undefined;
  /** All SEO records for the object */
  seoInfos?: SeoInfo[] | undefined;
  /** The name of current item */
  name?: string | undefined;
  /** True when this object is linked to the virtual parent. */
  hasVirtualParent?: boolean;
}
export declare class PaymentGatewayTransaction implements IPaymentGatewayTransaction {
  amount?: number;
  currencyCode?: string | undefined;
  /** Flag represent that current transaction is processed */
  isProcessed?: boolean;
  /** Date when this transaction was handled */
  processedDate?: Date | undefined;
  processError?: string | undefined;
  processAttemptCount?: number;
  /** Raw request data */
  requestData?: string | undefined;
  /** Raw response data */
  responseData?: string | undefined;
  /** Gateway or VC response status code */
  responseCode?: string | undefined;
  /** Gateway IP address */
  gatewayIpAddress?: string | undefined;
  /** The type of payment interaction.The payment can be Capture or CheckReceived.
The value also includes customer payment interactions such as Website, Call, Store, or Unknown. */
  type?: string | undefined;
  /** "Active", "Expired", and "Inactive" or other */
  status?: string | undefined;
  note?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IPaymentGatewayTransaction);
  init(_data?: any): void;
  static fromJS(data: any): PaymentGatewayTransaction;
  toJSON(data?: any): any;
}
export interface IPaymentGatewayTransaction {
  amount?: number;
  currencyCode?: string | undefined;
  /** Flag represent that current transaction is processed */
  isProcessed?: boolean;
  /** Date when this transaction was handled */
  processedDate?: Date | undefined;
  processError?: string | undefined;
  processAttemptCount?: number;
  /** Raw request data */
  requestData?: string | undefined;
  /** Raw response data */
  responseData?: string | undefined;
  /** Gateway or VC response status code */
  responseCode?: string | undefined;
  /** Gateway IP address */
  gatewayIpAddress?: string | undefined;
  /** The type of payment interaction.The payment can be Capture or CheckReceived.
The value also includes customer payment interactions such as Website, Call, Store, or Unknown. */
  type?: string | undefined;
  /** "Active", "Expired", and "Inactive" or other */
  status?: string | undefined;
  note?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class PaymentIn implements IPaymentIn {
  orderId?: string | undefined;
  purpose?: string | undefined;
  /** Payment method (gateway) code */
  gatewayCode?: string | undefined;
  /** Payment method contains additional payment method information */
  paymentMethod?: PaymentMethod | undefined;
  organizationId?: string | undefined;
  organizationName?: string | undefined;
  customerId?: string | undefined;
  customerName?: string | undefined;
  incomingDate?: Date | undefined;
  billingAddress?: OrderAddress | undefined;
  paymentStatus?: PaymentInPaymentStatus;
  authorizedDate?: Date | undefined;
  capturedDate?: Date | undefined;
  voidedDate?: Date | undefined;
  processPaymentResult?: ProcessPaymentRequestResult | undefined;
  price?: number;
  priceWithTax?: number;
  total?: number;
  totalWithTax?: number;
  discountAmount?: number;
  discountAmountWithTax?: number;
  objectType?: string | undefined;
  feeDetails?: FeeDetail[] | undefined;
  vendorId?: string | undefined;
  /** Tax category or type */
  taxType?: string | undefined;
  taxTotal?: number;
  taxPercentRate?: number;
  taxDetails?: TaxDetail[] | undefined;
  discounts?: Discount[] | undefined;
  transactions?: PaymentGatewayTransaction[] | undefined;
  refunds?: Refund[] | undefined;
  captures?: Capture[] | undefined;
  operationType?: string | undefined;
  parentOperationId?: string | undefined;
  number?: string | undefined;
  isApproved?: boolean;
  status?: string | undefined;
  comment?: string | undefined;
  currency?: string | undefined;
  sum?: number;
  outerId?: string | undefined;
  /** For system use to handle canellation flow */
  cancelledState?: PaymentInCancelledState;
  /** Used by payment provides to indicate that cancellation operation has completed */
  isCancelled?: boolean;
  cancelledDate?: Date | undefined;
  cancelReason?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  operationsLog?: OperationLog[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IPaymentIn);
  init(_data?: any): void;
  static fromJS(data: any): PaymentIn;
  toJSON(data?: any): any;
}
export interface IPaymentIn {
  orderId?: string | undefined;
  purpose?: string | undefined;
  /** Payment method (gateway) code */
  gatewayCode?: string | undefined;
  /** Payment method contains additional payment method information */
  paymentMethod?: PaymentMethod | undefined;
  organizationId?: string | undefined;
  organizationName?: string | undefined;
  customerId?: string | undefined;
  customerName?: string | undefined;
  incomingDate?: Date | undefined;
  billingAddress?: OrderAddress | undefined;
  paymentStatus?: PaymentInPaymentStatus;
  authorizedDate?: Date | undefined;
  capturedDate?: Date | undefined;
  voidedDate?: Date | undefined;
  processPaymentResult?: ProcessPaymentRequestResult | undefined;
  price?: number;
  priceWithTax?: number;
  total?: number;
  totalWithTax?: number;
  discountAmount?: number;
  discountAmountWithTax?: number;
  objectType?: string | undefined;
  feeDetails?: FeeDetail[] | undefined;
  vendorId?: string | undefined;
  /** Tax category or type */
  taxType?: string | undefined;
  taxTotal?: number;
  taxPercentRate?: number;
  taxDetails?: TaxDetail[] | undefined;
  discounts?: Discount[] | undefined;
  transactions?: PaymentGatewayTransaction[] | undefined;
  refunds?: Refund[] | undefined;
  captures?: Capture[] | undefined;
  operationType?: string | undefined;
  parentOperationId?: string | undefined;
  number?: string | undefined;
  isApproved?: boolean;
  status?: string | undefined;
  comment?: string | undefined;
  currency?: string | undefined;
  sum?: number;
  outerId?: string | undefined;
  /** For system use to handle canellation flow */
  cancelledState?: PaymentInCancelledState;
  /** Used by payment provides to indicate that cancellation operation has completed */
  isCancelled?: boolean;
  cancelledDate?: Date | undefined;
  cancelReason?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  operationsLog?: OperationLog[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class PaymentMethod implements IPaymentMethod {
  code?: string | undefined;
  name?: string | undefined;
  logoUrl?: string | undefined;
  isActive?: boolean;
  priority?: number;
  isAvailableForPartial?: boolean;
  allowDeferredPayment?: boolean;
  currency?: string | undefined;
  price?: number;
  readonly priceWithTax?: number;
  readonly total?: number;
  readonly totalWithTax?: number;
  discountAmount?: number;
  readonly discountAmountWithTax?: number;
  storeId?: string | undefined;
  description?: string | undefined;
  readonly typeName?: string | undefined;
  settings?: ObjectSettingEntry[] | undefined;
  taxType?: string | undefined;
  readonly taxTotal?: number;
  taxPercentRate?: number;
  taxDetails?: TaxDetail[] | undefined;
  readonly paymentMethodType?: PaymentMethodType2;
  readonly paymentMethodGroupType?: PaymentMethodGroupType2;
  id?: string | undefined;
  constructor(data?: IPaymentMethod);
  init(_data?: any): void;
  static fromJS(data: any): PaymentMethod;
  toJSON(data?: any): any;
}
export interface IPaymentMethod {
  code?: string | undefined;
  name?: string | undefined;
  logoUrl?: string | undefined;
  isActive?: boolean;
  priority?: number;
  isAvailableForPartial?: boolean;
  allowDeferredPayment?: boolean;
  currency?: string | undefined;
  price?: number;
  priceWithTax?: number;
  total?: number;
  totalWithTax?: number;
  discountAmount?: number;
  discountAmountWithTax?: number;
  storeId?: string | undefined;
  description?: string | undefined;
  typeName?: string | undefined;
  settings?: ObjectSettingEntry[] | undefined;
  taxType?: string | undefined;
  taxTotal?: number;
  taxPercentRate?: number;
  taxDetails?: TaxDetail[] | undefined;
  paymentMethodType?: PaymentMethodType2;
  paymentMethodGroupType?: PaymentMethodGroupType2;
  id?: string | undefined;
}
export declare enum PaymentMethodGroupType {
  Paypal = "Paypal",
  BankCard = "BankCard",
  Alternative = "Alternative",
  Manual = "Manual",
}
export declare enum PaymentMethodType {
  Unknown = "Unknown",
  Standard = "Standard",
  Redirection = "Redirection",
  PreparedForm = "PreparedForm",
}
export declare enum PaymentStatus {
  New = "New",
  Pending = "Pending",
  Authorized = "Authorized",
  Paid = "Paid",
  PartiallyRefunded = "PartiallyRefunded",
  Refunded = "Refunded",
  Voided = "Voided",
  Custom = "Custom",
  Cancelled = "Cancelled",
  Declined = "Declined",
  Error = "Error",
}
export declare class PreviewDataQuery implements IPreviewDataQuery {
  importProfile?: ImportProfile | undefined;
  constructor(data?: IPreviewDataQuery);
  init(_data?: any): void;
  static fromJS(data: any): PreviewDataQuery;
  toJSON(data?: any): any;
}
export interface IPreviewDataQuery {
  importProfile?: ImportProfile | undefined;
}
export declare class ProcessPaymentRequestResult implements IProcessPaymentRequestResult {
  redirectUrl?: string | undefined;
  htmlForm?: string | undefined;
  outerId?: string | undefined;
  paymentMethod?: PaymentMethod | undefined;
  isSuccess?: boolean;
  errorMessage?: string | undefined;
  newPaymentStatus?: ProcessPaymentRequestResultNewPaymentStatus;
  publicParameters?:
    | {
        [key: string]: string;
      }
    | undefined;
  constructor(data?: IProcessPaymentRequestResult);
  init(_data?: any): void;
  static fromJS(data: any): ProcessPaymentRequestResult;
  toJSON(data?: any): any;
}
export interface IProcessPaymentRequestResult {
  redirectUrl?: string | undefined;
  htmlForm?: string | undefined;
  outerId?: string | undefined;
  paymentMethod?: PaymentMethod | undefined;
  isSuccess?: boolean;
  errorMessage?: string | undefined;
  newPaymentStatus?: ProcessPaymentRequestResultNewPaymentStatus;
  publicParameters?:
    | {
        [key: string]: string;
      }
    | undefined;
}
export declare class ProductAssociation implements IProductAssociation {
  /** Association type (Accessories, Up-Sales, Cross-Sales, Related etc) */
  type?: string | undefined;
  priority?: number;
  quantity?: number | undefined;
  /** Is a primary key of associating object */
  itemId?: string | undefined;
  /** Each link element can have an associated object like Product, Category, etc.
Is a primary key of associated object */
  associatedObjectId?: string | undefined;
  /** Associated object type : 'product', 'category' etc */
  associatedObjectType?: string | undefined;
  outerId?: string | undefined;
  /** Display name for associated object */
  readonly associatedObjectName?: string | undefined;
  /** Associated object image URL */
  readonly associatedObjectImg?: string | undefined;
  tags?: string[] | undefined;
  readonly imgSrc?: string | undefined;
  images?: Image[] | undefined;
  id?: string | undefined;
  constructor(data?: IProductAssociation);
  init(_data?: any): void;
  static fromJS(data: any): ProductAssociation;
  toJSON(data?: any): any;
}
export interface IProductAssociation {
  /** Association type (Accessories, Up-Sales, Cross-Sales, Related etc) */
  type?: string | undefined;
  priority?: number;
  quantity?: number | undefined;
  /** Is a primary key of associating object */
  itemId?: string | undefined;
  /** Each link element can have an associated object like Product, Category, etc.
Is a primary key of associated object */
  associatedObjectId?: string | undefined;
  /** Associated object type : 'product', 'category' etc */
  associatedObjectType?: string | undefined;
  outerId?: string | undefined;
  /** Display name for associated object */
  associatedObjectName?: string | undefined;
  /** Associated object image URL */
  associatedObjectImg?: string | undefined;
  tags?: string[] | undefined;
  imgSrc?: string | undefined;
  images?: Image[] | undefined;
  id?: string | undefined;
}
export declare class ProductDetails implements IProductDetails {
  name?: string | undefined;
  descriptions?: EditorialReview[] | undefined;
  readonly description?: string | undefined;
  code?: string | undefined;
  gtin?: string | undefined;
  categoryId?: string | undefined;
  outerId?: string | undefined;
  productType?: string | undefined;
  properties?: Property[] | undefined;
  images?: Image[] | undefined;
  assets?: Asset[] | undefined;
  constructor(data?: IProductDetails);
  init(_data?: any): void;
  static fromJS(data: any): ProductDetails;
  toJSON(data?: any): any;
}
export interface IProductDetails {
  name?: string | undefined;
  descriptions?: EditorialReview[] | undefined;
  description?: string | undefined;
  code?: string | undefined;
  gtin?: string | undefined;
  categoryId?: string | undefined;
  outerId?: string | undefined;
  productType?: string | undefined;
  properties?: Property[] | undefined;
  images?: Image[] | undefined;
  assets?: Asset[] | undefined;
}
export declare class ProductPublicationRequest implements IProductPublicationRequest {
  storeId?: string | undefined;
  storeName?: string | undefined;
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  operatorId?: string | undefined;
  operatorName?: string | undefined;
  sellerProductId?: string | undefined;
  sellerProduct?: SellerProduct | undefined;
  comment?: string | undefined;
  prevStatus?: ProductPublicationRequestPrevStatus;
  status?: ProductPublicationRequestStatus;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IProductPublicationRequest);
  init(_data?: any): void;
  static fromJS(data: any): ProductPublicationRequest;
  toJSON(data?: any): any;
}
export interface IProductPublicationRequest {
  storeId?: string | undefined;
  storeName?: string | undefined;
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  operatorId?: string | undefined;
  operatorName?: string | undefined;
  sellerProductId?: string | undefined;
  sellerProduct?: SellerProduct | undefined;
  comment?: string | undefined;
  prevStatus?: ProductPublicationRequestPrevStatus;
  status?: ProductPublicationRequestStatus;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class Property implements IProperty {
  /** Gets or sets a value indicating whether user can change property value. */
  isReadOnly?: boolean;
  /** Gets or sets a value indicating whether user can change property metadata or remove this property. */
  readonly isManageable?: boolean;
  /** Gets or sets a value indicating whether this instance is new. A new property should be created on server site instead of trying to update it. */
  isNew?: boolean;
  /** Gets or sets the catalog id that this product belongs to. */
  catalogId?: string | undefined;
  /** Gets or sets the category id that this product belongs to. */
  categoryId?: string | undefined;
  name?: string | undefined;
  required?: boolean;
  dictionary?: boolean;
  multivalue?: boolean;
  multilanguage?: boolean;
  /** Gets or sets a value indicating whether this VirtoCommerce.CatalogModule.Core.Model.Property is hidden. */
  hidden?: boolean;
  valueType?: PropertyValueType2;
  type?: PropertyType2;
  outerId?: string | undefined;
  ownerName?: string | undefined;
  displayOrder?: number | undefined;
  values?: PropertyValue[] | undefined;
  attributes?: PropertyAttribute[] | undefined;
  displayNames?: PropertyDisplayName[] | undefined;
  validationRules?: PropertyValidationRule[] | undefined;
  /** Represents property validation rules definition */
  readonly validationRule?: PropertyValidationRule | undefined;
  isInherited?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IProperty);
  init(_data?: any): void;
  static fromJS(data: any): Property;
  toJSON(data?: any): any;
}
export interface IProperty {
  /** Gets or sets a value indicating whether user can change property value. */
  isReadOnly?: boolean;
  /** Gets or sets a value indicating whether user can change property metadata or remove this property. */
  isManageable?: boolean;
  /** Gets or sets a value indicating whether this instance is new. A new property should be created on server site instead of trying to update it. */
  isNew?: boolean;
  /** Gets or sets the catalog id that this product belongs to. */
  catalogId?: string | undefined;
  /** Gets or sets the category id that this product belongs to. */
  categoryId?: string | undefined;
  name?: string | undefined;
  required?: boolean;
  dictionary?: boolean;
  multivalue?: boolean;
  multilanguage?: boolean;
  /** Gets or sets a value indicating whether this VirtoCommerce.CatalogModule.Core.Model.Property is hidden. */
  hidden?: boolean;
  valueType?: PropertyValueType2;
  type?: PropertyType2;
  outerId?: string | undefined;
  ownerName?: string | undefined;
  displayOrder?: number | undefined;
  values?: PropertyValue[] | undefined;
  attributes?: PropertyAttribute[] | undefined;
  displayNames?: PropertyDisplayName[] | undefined;
  validationRules?: PropertyValidationRule[] | undefined;
  /** Represents property validation rules definition */
  validationRule?: PropertyValidationRule | undefined;
  isInherited?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class PropertyAttribute implements IPropertyAttribute {
  propertyId?: string | undefined;
  value?: string | undefined;
  name?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IPropertyAttribute);
  init(_data?: any): void;
  static fromJS(data: any): PropertyAttribute;
  toJSON(data?: any): any;
}
export interface IPropertyAttribute {
  propertyId?: string | undefined;
  value?: string | undefined;
  name?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class PropertyDictionaryItem implements IPropertyDictionaryItem {
  propertyId?: string | undefined;
  alias?: string | undefined;
  sortOrder?: number;
  localizedValues?: PropertyDictionaryItemLocalizedValue[] | undefined;
  id?: string | undefined;
  constructor(data?: IPropertyDictionaryItem);
  init(_data?: any): void;
  static fromJS(data: any): PropertyDictionaryItem;
  toJSON(data?: any): any;
}
export interface IPropertyDictionaryItem {
  propertyId?: string | undefined;
  alias?: string | undefined;
  sortOrder?: number;
  localizedValues?: PropertyDictionaryItemLocalizedValue[] | undefined;
  id?: string | undefined;
}
export declare class PropertyDictionaryItemLocalizedValue implements IPropertyDictionaryItemLocalizedValue {
  languageCode?: string | undefined;
  value?: string | undefined;
  constructor(data?: IPropertyDictionaryItemLocalizedValue);
  init(_data?: any): void;
  static fromJS(data: any): PropertyDictionaryItemLocalizedValue;
  toJSON(data?: any): any;
}
export interface IPropertyDictionaryItemLocalizedValue {
  languageCode?: string | undefined;
  value?: string | undefined;
}
/** Search criteria used for search property dictionary items */
export declare class PropertyDictionaryItemSearchCriteria implements IPropertyDictionaryItemSearchCriteria {
  propertyIds?: string[] | undefined;
  catalogIds?: string[] | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: IPropertyDictionaryItemSearchCriteria);
  init(_data?: any): void;
  static fromJS(data: any): PropertyDictionaryItemSearchCriteria;
  toJSON(data?: any): any;
}
/** Search criteria used for search property dictionary items */
export interface IPropertyDictionaryItemSearchCriteria {
  propertyIds?: string[] | undefined;
  catalogIds?: string[] | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class PropertyDictionaryItemSearchResult implements IPropertyDictionaryItemSearchResult {
  totalCount?: number;
  results?: PropertyDictionaryItem[] | undefined;
  constructor(data?: IPropertyDictionaryItemSearchResult);
  init(_data?: any): void;
  static fromJS(data: any): PropertyDictionaryItemSearchResult;
  toJSON(data?: any): any;
}
export interface IPropertyDictionaryItemSearchResult {
  totalCount?: number;
  results?: PropertyDictionaryItem[] | undefined;
}
export declare class PropertyDisplayName implements IPropertyDisplayName {
  name?: string | undefined;
  languageCode?: string | undefined;
  constructor(data?: IPropertyDisplayName);
  init(_data?: any): void;
  static fromJS(data: any): PropertyDisplayName;
  toJSON(data?: any): any;
}
export interface IPropertyDisplayName {
  name?: string | undefined;
  languageCode?: string | undefined;
}
export declare enum PropertyType {
  Product = "Product",
  Variation = "Variation",
  Category = "Category",
  Catalog = "Catalog",
}
/** Represents property validation rules definition */
export declare class PropertyValidationRule implements IPropertyValidationRule {
  /** Uniquie value flag constrain */
  isUnique?: boolean;
  /** Down chars count border or null if no defined */
  charCountMin?: number | undefined;
  /** Upper chars count border or null if no defined */
  charCountMax?: number | undefined;
  /** Custom regular expression */
  regExp?: string | undefined;
  propertyId?: string | undefined;
  id?: string | undefined;
  constructor(data?: IPropertyValidationRule);
  init(_data?: any): void;
  static fromJS(data: any): PropertyValidationRule;
  toJSON(data?: any): any;
}
/** Represents property validation rules definition */
export interface IPropertyValidationRule {
  /** Uniquie value flag constrain */
  isUnique?: boolean;
  /** Down chars count border or null if no defined */
  charCountMin?: number | undefined;
  /** Upper chars count border or null if no defined */
  charCountMax?: number | undefined;
  /** Custom regular expression */
  regExp?: string | undefined;
  propertyId?: string | undefined;
  id?: string | undefined;
}
export declare class PropertyValue implements IPropertyValue {
  propertyName?: string | undefined;
  propertyId?: string | undefined;
  languageCode?: string | undefined;
  alias?: string | undefined;
  valueType?: PropertyValueValueType;
  valueId?: string | undefined;
  value?: any | undefined;
  readonly propertyMultivalue?: boolean;
  outerId?: string | undefined;
  isInherited?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IPropertyValue);
  init(_data?: any): void;
  static fromJS(data: any): PropertyValue;
  toJSON(data?: any): any;
}
export interface IPropertyValue {
  propertyName?: string | undefined;
  propertyId?: string | undefined;
  languageCode?: string | undefined;
  alias?: string | undefined;
  valueType?: PropertyValueValueType;
  valueId?: string | undefined;
  value?: any | undefined;
  propertyMultivalue?: boolean;
  outerId?: string | undefined;
  isInherited?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare enum PropertyValueType {
  ShortText = "ShortText",
  LongText = "LongText",
  Number = "Number",
  DateTime = "DateTime",
  Boolean = "Boolean",
  Integer = "Integer",
  GeoPoint = "GeoPoint",
}
export declare enum PublicationRequestStatus {
  None = "None",
  WaitForApproval = "WaitForApproval",
  RequestChanges = "RequestChanges",
  Rejected = "Rejected",
  Approved = "Approved",
}
export declare class Refund implements IRefund {
  objectType?: string | undefined;
  amount?: number;
  reasonCode?: RefundReasonCode2;
  refundStatus?: RefundStatus2;
  reasonMessage?: string | undefined;
  rejectReasonMessage?: string | undefined;
  vendorId?: string | undefined;
  transactionId?: string | undefined;
  customerOrderId?: string | undefined;
  paymentId?: string | undefined;
  items?: RefundItem[] | undefined;
  operationType?: string | undefined;
  parentOperationId?: string | undefined;
  number?: string | undefined;
  isApproved?: boolean;
  status?: string | undefined;
  comment?: string | undefined;
  currency?: string | undefined;
  sum?: number;
  outerId?: string | undefined;
  /** For system use to handle canellation flow */
  cancelledState?: RefundCancelledState;
  /** Used by payment provides to indicate that cancellation operation has completed */
  isCancelled?: boolean;
  cancelledDate?: Date | undefined;
  cancelReason?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  operationsLog?: OperationLog[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IRefund);
  init(_data?: any): void;
  static fromJS(data: any): Refund;
  toJSON(data?: any): any;
}
export interface IRefund {
  objectType?: string | undefined;
  amount?: number;
  reasonCode?: RefundReasonCode2;
  refundStatus?: RefundStatus2;
  reasonMessage?: string | undefined;
  rejectReasonMessage?: string | undefined;
  vendorId?: string | undefined;
  transactionId?: string | undefined;
  customerOrderId?: string | undefined;
  paymentId?: string | undefined;
  items?: RefundItem[] | undefined;
  operationType?: string | undefined;
  parentOperationId?: string | undefined;
  number?: string | undefined;
  isApproved?: boolean;
  status?: string | undefined;
  comment?: string | undefined;
  currency?: string | undefined;
  sum?: number;
  outerId?: string | undefined;
  /** For system use to handle canellation flow */
  cancelledState?: RefundCancelledState;
  /** Used by payment provides to indicate that cancellation operation has completed */
  isCancelled?: boolean;
  cancelledDate?: Date | undefined;
  cancelReason?: string | undefined;
  dynamicProperties?: DynamicObjectProperty[] | undefined;
  operationsLog?: OperationLog[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class RefundItem implements IRefundItem {
  quantity?: number;
  lineItemId?: string | undefined;
  lineItem?: OrderLineItem | undefined;
  refundId?: string | undefined;
  outerId?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IRefundItem);
  init(_data?: any): void;
  static fromJS(data: any): RefundItem;
  toJSON(data?: any): any;
}
export interface IRefundItem {
  quantity?: number;
  lineItemId?: string | undefined;
  lineItem?: OrderLineItem | undefined;
  refundId?: string | undefined;
  outerId?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare enum RefundReasonCode {
  Duplicate = "Duplicate",
  Fraudulent = "Fraudulent",
  RequestedByCustomer = "RequestedByCustomer",
  Other = "Other",
}
export declare enum RefundStatus {
  Pending = "Pending",
  Rejected = "Rejected",
  Processed = "Processed",
}
export declare class RunCategoriesExportCommand implements IRunCategoriesExportCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  /** Full type name of exportable entity */
  exportTypeName?: string | undefined;
  /** Query information to retrive exported data */
  dataQuery?: ExportDataQuery | undefined;
  /** Export provider configuration */
  providerConfig?: IExportProviderConfiguration | undefined;
  /** Selected export provider name */
  providerName?: string | undefined;
  constructor(data?: IRunCategoriesExportCommand);
  init(_data?: any): void;
  static fromJS(data: any): RunCategoriesExportCommand;
  toJSON(data?: any): any;
}
export interface IRunCategoriesExportCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  /** Full type name of exportable entity */
  exportTypeName?: string | undefined;
  /** Query information to retrive exported data */
  dataQuery?: ExportDataQuery | undefined;
  /** Export provider configuration */
  providerConfig?: IExportProviderConfiguration | undefined;
  /** Selected export provider name */
  providerName?: string | undefined;
}
export declare class RunImportCommand implements IRunImportCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  importProfile?: ImportProfile | undefined;
  constructor(data?: IRunImportCommand);
  init(_data?: any): void;
  static fromJS(data: any): RunImportCommand;
  toJSON(data?: any): any;
}
export interface IRunImportCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  importProfile?: ImportProfile | undefined;
}
export declare class SearchCategoriesQuery implements ISearchCategoriesQuery {
  storeId?: string | undefined;
  sellerName?: string | undefined;
  sellerId?: string | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchCategoriesQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchCategoriesQuery;
  toJSON(data?: any): any;
}
export interface ISearchCategoriesQuery {
  storeId?: string | undefined;
  sellerName?: string | undefined;
  sellerId?: string | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchCommissionFeesQuery implements ISearchCommissionFeesQuery {
  type?: TypeCommissionFee | undefined;
  isDefault?: boolean | undefined;
  isActive?: boolean | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchCommissionFeesQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchCommissionFeesQuery;
  toJSON(data?: any): any;
}
export interface ISearchCommissionFeesQuery {
  type?: TypeCommissionFee | undefined;
  isDefault?: boolean | undefined;
  isActive?: boolean | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchCommissionFeesResult implements ISearchCommissionFeesResult {
  totalCount?: number;
  results?: CommissionFee[] | undefined;
  constructor(data?: ISearchCommissionFeesResult);
  init(_data?: any): void;
  static fromJS(data: any): SearchCommissionFeesResult;
  toJSON(data?: any): any;
}
export interface ISearchCommissionFeesResult {
  totalCount?: number;
  results?: CommissionFee[] | undefined;
}
export declare class SearchCustomerReviewsQuery implements ISearchCustomerReviewsQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchCustomerReviewsQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchCustomerReviewsQuery;
  toJSON(data?: any): any;
}
export interface ISearchCustomerReviewsQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchCustomerReviewsResult implements ISearchCustomerReviewsResult {
  totalCount?: number;
  results?: CustomerReview[] | undefined;
  constructor(data?: ISearchCustomerReviewsResult);
  init(_data?: any): void;
  static fromJS(data: any): SearchCustomerReviewsResult;
  toJSON(data?: any): any;
}
export interface ISearchCustomerReviewsResult {
  totalCount?: number;
  results?: CustomerReview[] | undefined;
}
export declare class SearchFulfillmentCentersQuery implements ISearchFulfillmentCentersQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchFulfillmentCentersQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchFulfillmentCentersQuery;
  toJSON(data?: any): any;
}
export interface ISearchFulfillmentCentersQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchFulfillmentCentersResult implements ISearchFulfillmentCentersResult {
  totalCount?: number;
  results?: FulfillmentCenter[] | undefined;
  constructor(data?: ISearchFulfillmentCentersResult);
  init(_data?: any): void;
  static fromJS(data: any): SearchFulfillmentCentersResult;
  toJSON(data?: any): any;
}
export interface ISearchFulfillmentCentersResult {
  totalCount?: number;
  results?: FulfillmentCenter[] | undefined;
}
export declare class SearchImportProfilesQuery implements ISearchImportProfilesQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  name?: string | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchImportProfilesQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchImportProfilesQuery;
  toJSON(data?: any): any;
}
export interface ISearchImportProfilesQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  name?: string | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchImportProfilesResult implements ISearchImportProfilesResult {
  totalCount?: number;
  results?: ImportProfile[] | undefined;
  constructor(data?: ISearchImportProfilesResult);
  init(_data?: any): void;
  static fromJS(data: any): SearchImportProfilesResult;
  toJSON(data?: any): any;
}
export interface ISearchImportProfilesResult {
  totalCount?: number;
  results?: ImportProfile[] | undefined;
}
export declare class SearchImportRunHistoryQuery implements ISearchImportRunHistoryQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  profileId?: string | undefined;
  jobId?: string | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchImportRunHistoryQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchImportRunHistoryQuery;
  toJSON(data?: any): any;
}
export interface ISearchImportRunHistoryQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  profileId?: string | undefined;
  jobId?: string | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchImportRunHistoryResult implements ISearchImportRunHistoryResult {
  totalCount?: number;
  results?: ImportRunHistory[] | undefined;
  constructor(data?: ISearchImportRunHistoryResult);
  init(_data?: any): void;
  static fromJS(data: any): SearchImportRunHistoryResult;
  toJSON(data?: any): any;
}
export interface ISearchImportRunHistoryResult {
  totalCount?: number;
  results?: ImportRunHistory[] | undefined;
}
export declare class SearchOfferProductsResult implements ISearchOfferProductsResult {
  totalCount?: number;
  results?: OfferProduct[] | undefined;
  constructor(data?: ISearchOfferProductsResult);
  init(_data?: any): void;
  static fromJS(data: any): SearchOfferProductsResult;
  toJSON(data?: any): any;
}
export interface ISearchOfferProductsResult {
  totalCount?: number;
  results?: OfferProduct[] | undefined;
}
export declare class SearchOffersQuery implements ISearchOffersQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  sellerProductId?: string | undefined;
  sellerProductIds?: string[] | undefined;
  outerIds?: string[] | undefined;
  productId?: string | undefined;
  skus?: string[] | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchOffersQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchOffersQuery;
  toJSON(data?: any): any;
}
export interface ISearchOffersQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  sellerProductId?: string | undefined;
  sellerProductIds?: string[] | undefined;
  outerIds?: string[] | undefined;
  productId?: string | undefined;
  skus?: string[] | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchOffersResult implements ISearchOffersResult {
  totalCount?: number;
  results?: Offer[] | undefined;
  constructor(data?: ISearchOffersResult);
  init(_data?: any): void;
  static fromJS(data: any): SearchOffersResult;
  toJSON(data?: any): any;
}
export interface ISearchOffersResult {
  totalCount?: number;
  results?: Offer[] | undefined;
}
export declare class SearchOrdersQuery implements ISearchOrdersQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  /** Search orders with flag IsPrototype */
  withPrototypes?: boolean;
  /** Search only recurring orders created by subscription */
  onlyRecurring?: boolean;
  /** Search orders with given subscription */
  subscriptionId?: string | undefined;
  subscriptionIds?: string[] | undefined;
  /** It used to limit search within an operation (customer order for example) */
  operationId?: string | undefined;
  customerId?: string | undefined;
  customerIds?: string[] | undefined;
  organizationId?: string | undefined;
  organizationIds?: string[] | undefined;
  ids?: string[] | undefined;
  hasParentOperation?: boolean | undefined;
  parentOperationId?: string | undefined;
  employeeId?: string | undefined;
  storeIds?: string[] | undefined;
  /** Search by status */
  status?: string | undefined;
  statuses?: string[] | undefined;
  /** Search by numbers */
  number?: string | undefined;
  numbers?: string[] | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchOrdersQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchOrdersQuery;
  toJSON(data?: any): any;
}
export interface ISearchOrdersQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  /** Search orders with flag IsPrototype */
  withPrototypes?: boolean;
  /** Search only recurring orders created by subscription */
  onlyRecurring?: boolean;
  /** Search orders with given subscription */
  subscriptionId?: string | undefined;
  subscriptionIds?: string[] | undefined;
  /** It used to limit search within an operation (customer order for example) */
  operationId?: string | undefined;
  customerId?: string | undefined;
  customerIds?: string[] | undefined;
  organizationId?: string | undefined;
  organizationIds?: string[] | undefined;
  ids?: string[] | undefined;
  hasParentOperation?: boolean | undefined;
  parentOperationId?: string | undefined;
  employeeId?: string | undefined;
  storeIds?: string[] | undefined;
  /** Search by status */
  status?: string | undefined;
  statuses?: string[] | undefined;
  /** Search by numbers */
  number?: string | undefined;
  numbers?: string[] | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchProductsForNewOfferQuery implements ISearchProductsForNewOfferQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  searchFromSellerOnly?: boolean;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchProductsForNewOfferQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchProductsForNewOfferQuery;
  toJSON(data?: any): any;
}
export interface ISearchProductsForNewOfferQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  searchFromSellerOnly?: boolean;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchProductsQuery implements ISearchProductsQuery {
  minModifiedDate?: Date | undefined;
  maxModifiedDate?: Date | undefined;
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  publishedProductsIds?: string[] | undefined;
  stagedProductsIds?: string[] | undefined;
  searchFromAllSellers?: boolean;
  gtin?: string | undefined;
  codes?: string[] | undefined;
  status?: string[] | undefined;
  isPublished?: boolean | undefined;
  outerIds?: string[] | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchProductsQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchProductsQuery;
  toJSON(data?: any): any;
}
export interface ISearchProductsQuery {
  minModifiedDate?: Date | undefined;
  maxModifiedDate?: Date | undefined;
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  publishedProductsIds?: string[] | undefined;
  stagedProductsIds?: string[] | undefined;
  searchFromAllSellers?: boolean;
  gtin?: string | undefined;
  codes?: string[] | undefined;
  status?: string[] | undefined;
  isPublished?: boolean | undefined;
  outerIds?: string[] | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchProductsResult implements ISearchProductsResult {
  totalCount?: number;
  results?: SellerProduct[] | undefined;
  constructor(data?: ISearchProductsResult);
  init(_data?: any): void;
  static fromJS(data: any): SearchProductsResult;
  toJSON(data?: any): any;
}
export interface ISearchProductsResult {
  totalCount?: number;
  results?: SellerProduct[] | undefined;
}
export declare class SearchSellersQuery implements ISearchSellersQuery {
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchSellersQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchSellersQuery;
  toJSON(data?: any): any;
}
export interface ISearchSellersQuery {
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchSellersResult implements ISearchSellersResult {
  totalCount?: number;
  results?: Seller[] | undefined;
  constructor(data?: ISearchSellersResult);
  init(_data?: any): void;
  static fromJS(data: any): SearchSellersResult;
  toJSON(data?: any): any;
}
export interface ISearchSellersResult {
  totalCount?: number;
  results?: Seller[] | undefined;
}
export declare class SearchSellerUsersQuery implements ISearchSellerUsersQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchSellerUsersQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchSellerUsersQuery;
  toJSON(data?: any): any;
}
export interface ISearchSellerUsersQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchSellerUsersResult implements ISearchSellerUsersResult {
  totalCount?: number;
  results?: SellerUser[] | undefined;
  constructor(data?: ISearchSellerUsersResult);
  init(_data?: any): void;
  static fromJS(data: any): SearchSellerUsersResult;
  toJSON(data?: any): any;
}
export interface ISearchSellerUsersResult {
  totalCount?: number;
  results?: SellerUser[] | undefined;
}
export declare class SearchStateMachineDefinitionsQuery implements ISearchStateMachineDefinitionsQuery {
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchStateMachineDefinitionsQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchStateMachineDefinitionsQuery;
  toJSON(data?: any): any;
}
export interface ISearchStateMachineDefinitionsQuery {
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchStateMachineDefinitionsResult implements ISearchStateMachineDefinitionsResult {
  totalCount?: number;
  results?: StateMachineDefinition[] | undefined;
  constructor(data?: ISearchStateMachineDefinitionsResult);
  init(_data?: any): void;
  static fromJS(data: any): SearchStateMachineDefinitionsResult;
  toJSON(data?: any): any;
}
export interface ISearchStateMachineDefinitionsResult {
  totalCount?: number;
  results?: StateMachineDefinition[] | undefined;
}
export declare class SearchStateMachineInstancesQuery implements ISearchStateMachineInstancesQuery {
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  readonly sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
  constructor(data?: ISearchStateMachineInstancesQuery);
  init(_data?: any): void;
  static fromJS(data: any): SearchStateMachineInstancesQuery;
  toJSON(data?: any): any;
}
export interface ISearchStateMachineInstancesQuery {
  responseGroup?: string | undefined;
  /** Search object type */
  objectType?: string | undefined;
  objectTypes?: string[] | undefined;
  objectIds?: string[] | undefined;
  /** Search phrase */
  keyword?: string | undefined;
  /** Property is left for backward compatibility */
  searchPhrase?: string | undefined;
  /** Search phrase language */
  languageCode?: string | undefined;
  sort?: string | undefined;
  sortInfos?: SortInfo[] | undefined;
  skip?: number;
  take?: number;
}
export declare class SearchStateMachineInstancesResult implements ISearchStateMachineInstancesResult {
  totalCount?: number;
  results?: StateMachineInstance[] | undefined;
  constructor(data?: ISearchStateMachineInstancesResult);
  init(_data?: any): void;
  static fromJS(data: any): SearchStateMachineInstancesResult;
  toJSON(data?: any): any;
}
export interface ISearchStateMachineInstancesResult {
  totalCount?: number;
  results?: StateMachineInstance[] | undefined;
}
export declare class Seller implements ISeller {
  registrationId?: string | undefined;
  readonly logo?: string | undefined;
  deliveryTime?: string | undefined;
  location?: string | undefined;
  isActive?: boolean;
  approvalPolicy?: string | undefined;
  commissionFee?: CommissionFee | undefined;
  name?: string | undefined;
  readonly outerId?: string | undefined;
  readonly groups?: string[] | undefined;
  readonly addresses?: CustomerAddress[] | undefined;
  readonly phones?: string[] | undefined;
  readonly emails?: string[] | undefined;
  readonly description?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: ISeller);
  init(_data?: any): void;
  static fromJS(data: any): Seller;
  toJSON(data?: any): any;
}
export interface ISeller {
  registrationId?: string | undefined;
  logo?: string | undefined;
  deliveryTime?: string | undefined;
  location?: string | undefined;
  isActive?: boolean;
  approvalPolicy?: string | undefined;
  commissionFee?: CommissionFee | undefined;
  name?: string | undefined;
  outerId?: string | undefined;
  groups?: string[] | undefined;
  addresses?: CustomerAddress[] | undefined;
  phones?: string[] | undefined;
  emails?: string[] | undefined;
  description?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class SellerDetails implements ISellerDetails {
  registrationId?: string | undefined;
  logo?: string | undefined;
  deliveryTime?: string | undefined;
  location?: string | undefined;
  isActive?: boolean | undefined;
  approvalPolicy?: string | undefined;
  name: string;
  outerId?: string | undefined;
  addresses?: CustomerAddress[] | undefined;
  phones?: string[] | undefined;
  emails?: string[] | undefined;
  description?: string | undefined;
  constructor(data?: ISellerDetails);
  init(_data?: any): void;
  static fromJS(data: any): SellerDetails;
  toJSON(data?: any): any;
}
export interface ISellerDetails {
  registrationId?: string | undefined;
  logo?: string | undefined;
  deliveryTime?: string | undefined;
  location?: string | undefined;
  isActive?: boolean | undefined;
  approvalPolicy?: string | undefined;
  name: string;
  outerId?: string | undefined;
  addresses?: CustomerAddress[] | undefined;
  phones?: string[] | undefined;
  emails?: string[] | undefined;
  description?: string | undefined;
}
export declare class SellerOwnerDetails implements ISellerOwnerDetails {
  firstName?: string | undefined;
  lastName?: string | undefined;
  email: string;
  constructor(data?: ISellerOwnerDetails);
  init(_data?: any): void;
  static fromJS(data: any): SellerOwnerDetails;
  toJSON(data?: any): any;
}
export interface ISellerOwnerDetails {
  firstName?: string | undefined;
  lastName?: string | undefined;
  email: string;
}
export declare class SellerProduct implements ISellerProduct {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  name?: string | undefined;
  code?: string | undefined;
  imgSrc?: string | undefined;
  gtin?: string | undefined;
  categoryId?: string | undefined;
  path?: string | undefined;
  readonly outline?: string | undefined;
  readonly description?: string | undefined;
  hasStagedChanges?: boolean;
  isPublished?: boolean;
  status?: SellerProductStatus2;
  canBeModified?: boolean;
  publicationRequests?: ProductPublicationRequest[] | undefined;
  outerId?: string | undefined;
  readonly productData?: CatalogProduct | undefined;
  publishedProductDataId?: string | undefined;
  stagedProductDataId?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: ISellerProduct);
  init(_data?: any): void;
  static fromJS(data: any): SellerProduct;
  toJSON(data?: any): any;
}
export interface ISellerProduct {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  name?: string | undefined;
  code?: string | undefined;
  imgSrc?: string | undefined;
  gtin?: string | undefined;
  categoryId?: string | undefined;
  path?: string | undefined;
  outline?: string | undefined;
  description?: string | undefined;
  hasStagedChanges?: boolean;
  isPublished?: boolean;
  status?: SellerProductStatus2;
  canBeModified?: boolean;
  publicationRequests?: ProductPublicationRequest[] | undefined;
  outerId?: string | undefined;
  productData?: CatalogProduct | undefined;
  publishedProductDataId?: string | undefined;
  stagedProductDataId?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare enum SellerProductStatus {
  None = "None",
  Published = "Published",
  HasStagedChanges = "HasStagedChanges",
  WaitForApproval = "WaitForApproval",
  RequiresChanges = "RequiresChanges",
  Rejected = "Rejected",
  Approved = "Approved",
}
export declare class SellerPushNotification implements ISellerPushNotification {
  serverId?: string | undefined;
  creator?: string | undefined;
  created?: Date;
  isNew?: boolean;
  notifyType?: string | undefined;
  description?: string | undefined;
  title?: string | undefined;
  repeatCount?: number;
  id?: string | undefined;
  constructor(data?: ISellerPushNotification);
  init(_data?: any): void;
  static fromJS(data: any): SellerPushNotification;
  toJSON(data?: any): any;
}
export interface ISellerPushNotification {
  serverId?: string | undefined;
  creator?: string | undefined;
  created?: Date;
  isNew?: boolean;
  notifyType?: string | undefined;
  description?: string | undefined;
  title?: string | undefined;
  repeatCount?: number;
  id?: string | undefined;
}
export declare class SellerRating implements ISellerRating {
  rating?: number;
  reviewCount?: number;
  constructor(data?: ISellerRating);
  init(_data?: any): void;
  static fromJS(data: any): SellerRating;
  toJSON(data?: any): any;
}
export interface ISellerRating {
  rating?: number;
  reviewCount?: number;
}
export declare class SellerUser implements ISellerUser {
  readonly sellerId?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  readonly fullName?: string | undefined;
  readonly userName?: string | undefined;
  email?: string | undefined;
  role?: string | undefined;
  readonly isLockedOut?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: ISellerUser);
  init(_data?: any): void;
  static fromJS(data: any): SellerUser;
  toJSON(data?: any): any;
}
export interface ISellerUser {
  sellerId?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  fullName?: string | undefined;
  userName?: string | undefined;
  email?: string | undefined;
  role?: string | undefined;
  isLockedOut?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class SellerUserDetails implements ISellerUserDetails {
  firstName?: string | undefined;
  lastName?: string | undefined;
  email: string;
  role: string;
  isLockedOut?: boolean;
  constructor(data?: ISellerUserDetails);
  init(_data?: any): void;
  static fromJS(data: any): SellerUserDetails;
  toJSON(data?: any): any;
}
export interface ISellerUserDetails {
  firstName?: string | undefined;
  lastName?: string | undefined;
  email: string;
  role: string;
  isLockedOut?: boolean;
}
export declare class SendSellerUserInvitationCommand implements ISendSellerUserInvitationCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  readonly seller?: Seller | undefined;
  sellerUserId: string;
  message?: string | undefined;
  constructor(data?: ISendSellerUserInvitationCommand);
  init(_data?: any): void;
  static fromJS(data: any): SendSellerUserInvitationCommand;
  toJSON(data?: any): any;
}
export interface ISendSellerUserInvitationCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  seller?: Seller | undefined;
  sellerUserId: string;
  message?: string | undefined;
}
export declare class SeoInfo implements ISeoInfo {
  name?: string | undefined;
  /** Slug */
  semanticUrl?: string | undefined;
  /** head title tag content */
  pageTitle?: string | undefined;
  /** <meta name="description" /> */
  metaDescription?: string | undefined;
  imageAltDescription?: string | undefined;
  /** <meta name="keywords" /> */
  metaKeywords?: string | undefined;
  /** Tenant StoreId which SEO defined */
  storeId?: string | undefined;
  /** SEO related object id */
  objectId?: string | undefined;
  /** SEO related object type name */
  objectType?: string | undefined;
  /** Active/Inactive */
  isActive?: boolean;
  languageCode?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: ISeoInfo);
  init(_data?: any): void;
  static fromJS(data: any): SeoInfo;
  toJSON(data?: any): any;
}
export interface ISeoInfo {
  name?: string | undefined;
  /** Slug */
  semanticUrl?: string | undefined;
  /** head title tag content */
  pageTitle?: string | undefined;
  /** <meta name="description" /> */
  metaDescription?: string | undefined;
  imageAltDescription?: string | undefined;
  /** <meta name="keywords" /> */
  metaKeywords?: string | undefined;
  /** Tenant StoreId which SEO defined */
  storeId?: string | undefined;
  /** SEO related object id */
  objectId?: string | undefined;
  /** SEO related object type name */
  objectType?: string | undefined;
  /** Active/Inactive */
  isActive?: boolean;
  languageCode?: string | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
/** Represent setting meta description */
export declare class SettingDescriptor implements ISettingDescriptor {
  id?: string | undefined;
  /** The flag indicates that you need to restart the application to apply this setting changes. */
  restartRequired?: boolean;
  /** The module id which setting belong to */
  moduleId?: string | undefined;
  /** Setting group name */
  groupName?: string | undefined;
  /** Setting name */
  name?: string | undefined;
  /** Display setting name */
  displayName?: string | undefined;
  isRequired?: boolean;
  /** Flag indicates that this setting doesn't need to be displayed on the UI */
  isHidden?: boolean;
  valueType?: SettingDescriptorValueType;
  allowedValues?: any[] | undefined;
  defaultValue?: any | undefined;
  /** The flag indicates what current setting is just editable dictionary and hasn't any concrete value */
  isDictionary?: boolean;
  constructor(data?: ISettingDescriptor);
  init(_data?: any): void;
  static fromJS(data: any): SettingDescriptor;
  toJSON(data?: any): any;
}
/** Represent setting meta description */
export interface ISettingDescriptor {
  id?: string | undefined;
  /** The flag indicates that you need to restart the application to apply this setting changes. */
  restartRequired?: boolean;
  /** The module id which setting belong to */
  moduleId?: string | undefined;
  /** Setting group name */
  groupName?: string | undefined;
  /** Setting name */
  name?: string | undefined;
  /** Display setting name */
  displayName?: string | undefined;
  isRequired?: boolean;
  /** Flag indicates that this setting doesn't need to be displayed on the UI */
  isHidden?: boolean;
  valueType?: SettingDescriptorValueType;
  allowedValues?: any[] | undefined;
  defaultValue?: any | undefined;
  /** The flag indicates what current setting is just editable dictionary and hasn't any concrete value */
  isDictionary?: boolean;
}
export declare enum SettingValueType {
  ShortText = "ShortText",
  LongText = "LongText",
  Integer = "Integer",
  Decimal = "Decimal",
  DateTime = "DateTime",
  Boolean = "Boolean",
  SecureString = "SecureString",
  Json = "Json",
  PositiveInteger = "PositiveInteger",
}
export declare enum Severity {
  Error = "Error",
  Warning = "Warning",
  Info = "Info",
}
export declare class ShipmentPackage implements IShipmentPackage {
  barCode?: string | undefined;
  packageType?: string | undefined;
  items?: OrderShipmentItem[] | undefined;
  weightUnit?: string | undefined;
  weight?: number | undefined;
  measureUnit?: string | undefined;
  height?: number | undefined;
  length?: number | undefined;
  width?: number | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IShipmentPackage);
  init(_data?: any): void;
  static fromJS(data: any): ShipmentPackage;
  toJSON(data?: any): any;
}
export interface IShipmentPackage {
  barCode?: string | undefined;
  packageType?: string | undefined;
  items?: OrderShipmentItem[] | undefined;
  weightUnit?: string | undefined;
  weight?: number | undefined;
  measureUnit?: string | undefined;
  height?: number | undefined;
  length?: number | undefined;
  width?: number | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class ShippingMethod implements IShippingMethod {
  code?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  logoUrl?: string | undefined;
  isActive?: boolean;
  priority?: number;
  taxType?: string | undefined;
  storeId?: string | undefined;
  settings?: ObjectSettingEntry[] | undefined;
  readonly typeName?: string | undefined;
  id?: string | undefined;
  constructor(data?: IShippingMethod);
  init(_data?: any): void;
  static fromJS(data: any): ShippingMethod;
  toJSON(data?: any): any;
}
export interface IShippingMethod {
  code?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  logoUrl?: string | undefined;
  isActive?: boolean;
  priority?: number;
  taxType?: string | undefined;
  storeId?: string | undefined;
  settings?: ObjectSettingEntry[] | undefined;
  typeName?: string | undefined;
  id?: string | undefined;
}
export declare enum SortDirection {
  Ascending = "Ascending",
  Descending = "Descending",
}
export declare class SortInfo implements ISortInfo {
  sortColumn?: string | undefined;
  sortDirection?: SortInfoSortDirection;
  constructor(data?: ISortInfo);
  init(_data?: any): void;
  static fromJS(data: any): SortInfo;
  toJSON(data?: any): any;
}
export interface ISortInfo {
  sortColumn?: string | undefined;
  sortDirection?: SortInfoSortDirection;
}
export declare class StateMachineDefinition implements IStateMachineDefinition {
  version?: string | undefined;
  entityType?: string | undefined;
  name?: string | undefined;
  isActive?: boolean;
  states?: StateMachineState[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IStateMachineDefinition);
  init(_data?: any): void;
  static fromJS(data: any): StateMachineDefinition;
  toJSON(data?: any): any;
}
export interface IStateMachineDefinition {
  version?: string | undefined;
  entityType?: string | undefined;
  name?: string | undefined;
  isActive?: boolean;
  states?: StateMachineState[] | undefined;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class StateMachineInstance implements IStateMachineInstance {
  entityId?: string | undefined;
  entityType?: string | undefined;
  readonly stateMachineDefinitionId?: string | undefined;
  readonly stateMachineName?: string | undefined;
  readonly currentStateName?: string | undefined;
  readonly currentState?: StateMachineState | undefined;
  permittedTriggers?: string[] | undefined;
  readonly isActive?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IStateMachineInstance);
  init(_data?: any): void;
  static fromJS(data: any): StateMachineInstance;
  toJSON(data?: any): any;
}
export interface IStateMachineInstance {
  entityId?: string | undefined;
  entityType?: string | undefined;
  stateMachineDefinitionId?: string | undefined;
  stateMachineName?: string | undefined;
  currentStateName?: string | undefined;
  currentState?: StateMachineState | undefined;
  permittedTriggers?: string[] | undefined;
  isActive?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare class StateMachineState implements IStateMachineState {
  name?: string | undefined;
  type?: string | undefined;
  description?: string | undefined;
  isInitial?: boolean;
  isFinal?: boolean;
  stateData?: any | undefined;
  transitions?: StateMachineTransition[] | undefined;
  constructor(data?: IStateMachineState);
  init(_data?: any): void;
  static fromJS(data: any): StateMachineState;
  toJSON(data?: any): any;
}
export interface IStateMachineState {
  name?: string | undefined;
  type?: string | undefined;
  description?: string | undefined;
  isInitial?: boolean;
  isFinal?: boolean;
  stateData?: any | undefined;
  transitions?: StateMachineTransition[] | undefined;
}
export declare class StateMachineTransition implements IStateMachineTransition {
  trigger?: string | undefined;
  description?: string | undefined;
  toState?: string | undefined;
  icon?: string | undefined;
  constructor(data?: IStateMachineTransition);
  init(_data?: any): void;
  static fromJS(data: any): StateMachineTransition;
  toJSON(data?: any): any;
}
export interface IStateMachineTransition {
  trigger?: string | undefined;
  description?: string | undefined;
  toState?: string | undefined;
  icon?: string | undefined;
}
export declare class SyncContext implements ISyncContext {
  clientTypes?: string[] | undefined;
  constructor(data?: ISyncContext);
  init(_data?: any): void;
  static fromJS(data: any): SyncContext;
  toJSON(data?: any): any;
}
export interface ISyncContext {
  clientTypes?: string[] | undefined;
}
export declare class SyncJobCancellationRequest implements ISyncJobCancellationRequest {
  jobId?: string | undefined;
  constructor(data?: ISyncJobCancellationRequest);
  init(_data?: any): void;
  static fromJS(data: any): SyncJobCancellationRequest;
  toJSON(data?: any): any;
}
export interface ISyncJobCancellationRequest {
  jobId?: string | undefined;
}
export declare class SyncProgressInfo implements ISyncProgressInfo {
  started?: Date | undefined;
  finished?: Date | undefined;
  progressMsg?: string | undefined;
  syncClientType?: string | undefined;
  syncClientName?: string | undefined;
  syncItemName?: string | undefined;
  kind?: string | undefined;
  processedCount?: number;
  totalCount?: number;
  syncItemStats?: SyncProgressInfo[] | undefined;
  errors?: string[] | undefined;
  readonly errorsCount?: number;
  constructor(data?: ISyncProgressInfo);
  init(_data?: any): void;
  static fromJS(data: any): SyncProgressInfo;
  toJSON(data?: any): any;
}
export interface ISyncProgressInfo {
  started?: Date | undefined;
  finished?: Date | undefined;
  progressMsg?: string | undefined;
  syncClientType?: string | undefined;
  syncClientName?: string | undefined;
  syncItemName?: string | undefined;
  kind?: string | undefined;
  processedCount?: number;
  totalCount?: number;
  syncItemStats?: SyncProgressInfo[] | undefined;
  errors?: string[] | undefined;
  errorsCount?: number;
}
export declare class SyncPushNotification implements ISyncPushNotification {
  jobId?: string | undefined;
  syncClientType?: string | undefined;
  syncClientName?: string | undefined;
  syncItemName?: string | undefined;
  kind?: string | undefined;
  finished?: Date | undefined;
  totalCount?: number;
  processedCount?: number;
  readonly errorCount?: number;
  errors?: string[] | undefined;
  importStats?: SyncProgressInfo[] | undefined;
  exportStats?: SyncProgressInfo[] | undefined;
  serverId?: string | undefined;
  creator?: string | undefined;
  created?: Date;
  isNew?: boolean;
  notifyType?: string | undefined;
  description?: string | undefined;
  title?: string | undefined;
  repeatCount?: number;
  id?: string | undefined;
  constructor(data?: ISyncPushNotification);
  init(_data?: any): void;
  static fromJS(data: any): SyncPushNotification;
  toJSON(data?: any): any;
}
export interface ISyncPushNotification {
  jobId?: string | undefined;
  syncClientType?: string | undefined;
  syncClientName?: string | undefined;
  syncItemName?: string | undefined;
  kind?: string | undefined;
  finished?: Date | undefined;
  totalCount?: number;
  processedCount?: number;
  errorCount?: number;
  errors?: string[] | undefined;
  importStats?: SyncProgressInfo[] | undefined;
  exportStats?: SyncProgressInfo[] | undefined;
  serverId?: string | undefined;
  creator?: string | undefined;
  created?: Date;
  isNew?: boolean;
  notifyType?: string | undefined;
  description?: string | undefined;
  title?: string | undefined;
  repeatCount?: number;
  id?: string | undefined;
}
export declare class TaxDetail implements ITaxDetail {
  rate?: number;
  amount?: number;
  name?: string | undefined;
  constructor(data?: ITaxDetail);
  init(_data?: any): void;
  static fromJS(data: any): TaxDetail;
  toJSON(data?: any): any;
}
export interface ITaxDetail {
  rate?: number;
  amount?: number;
  name?: string | undefined;
}
export declare enum TypeCommissionFee {
  Static = "Static",
  Dynamic = "Dynamic",
}
export declare class UpdateFeeCommand implements IUpdateFeeCommand {
  feeDetails?: CommissionFeeDetails | undefined;
  constructor(data?: IUpdateFeeCommand);
  init(_data?: any): void;
  static fromJS(data: any): UpdateFeeCommand;
  toJSON(data?: any): any;
}
export interface IUpdateFeeCommand {
  feeDetails?: CommissionFeeDetails | undefined;
}
export declare class UpdateFulfillmentCenterCommand implements IUpdateFulfillmentCenterCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  fulfillmentCenter: FulfillmentCenter;
  constructor(data?: IUpdateFulfillmentCenterCommand);
  init(_data?: any): void;
  static fromJS(data: any): UpdateFulfillmentCenterCommand;
  toJSON(data?: any): any;
}
export interface IUpdateFulfillmentCenterCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  fulfillmentCenter: FulfillmentCenter;
}
export declare class UpdateOfferCommand implements IUpdateOfferCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  offerId?: string | undefined;
  offerDetails: OfferDetails;
  constructor(data?: IUpdateOfferCommand);
  init(_data?: any): void;
  static fromJS(data: any): UpdateOfferCommand;
  toJSON(data?: any): any;
}
export interface IUpdateOfferCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  offerId?: string | undefined;
  offerDetails: OfferDetails;
}
export declare class UpdateProductDetailsCommand implements IUpdateProductDetailsCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  sellerProductId?: string | undefined;
  productDetails?: ProductDetails | undefined;
  constructor(data?: IUpdateProductDetailsCommand);
  init(_data?: any): void;
  static fromJS(data: any): UpdateProductDetailsCommand;
  toJSON(data?: any): any;
}
export interface IUpdateProductDetailsCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  sellerProductId?: string | undefined;
  productDetails?: ProductDetails | undefined;
}
export declare class UpdateProfileCommand implements IUpdateProfileCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  importProfileId: string;
  importProfile?: ImportProfile | undefined;
  constructor(data?: IUpdateProfileCommand);
  init(_data?: any): void;
  static fromJS(data: any): UpdateProfileCommand;
  toJSON(data?: any): any;
}
export interface IUpdateProfileCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  importProfileId: string;
  importProfile?: ImportProfile | undefined;
}
export declare class UpdateSellerCommand implements IUpdateSellerCommand {
  sellerId: string;
  sellerName?: string | undefined;
  sellerDetails?: SellerDetails | undefined;
  commissionFeeId: string;
  groups?: string[] | undefined;
  constructor(data?: IUpdateSellerCommand);
  init(_data?: any): void;
  static fromJS(data: any): UpdateSellerCommand;
  toJSON(data?: any): any;
}
export interface IUpdateSellerCommand {
  sellerId: string;
  sellerName?: string | undefined;
  sellerDetails?: SellerDetails | undefined;
  commissionFeeId: string;
  groups?: string[] | undefined;
}
export declare class UpdateSellerUserCommand implements IUpdateSellerUserCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  readonly seller?: Seller | undefined;
  sellerUserId: string;
  userDetails?: SellerUserDetails | undefined;
  constructor(data?: IUpdateSellerUserCommand);
  init(_data?: any): void;
  static fromJS(data: any): UpdateSellerUserCommand;
  toJSON(data?: any): any;
}
export interface IUpdateSellerUserCommand {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  seller?: Seller | undefined;
  sellerUserId: string;
  userDetails?: SellerUserDetails | undefined;
}
export declare class ValidateProductQuery implements IValidateProductQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  sellerProduct?: SellerProduct | undefined;
  constructor(data?: IValidateProductQuery);
  init(_data?: any): void;
  static fromJS(data: any): ValidateProductQuery;
  toJSON(data?: any): any;
}
export interface IValidateProductQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  sellerProduct?: SellerProduct | undefined;
}
export declare class ValidateSellerUserQuery implements IValidateSellerUserQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  sellerUser?: SellerUser | undefined;
  constructor(data?: IValidateSellerUserQuery);
  init(_data?: any): void;
  static fromJS(data: any): ValidateSellerUserQuery;
  toJSON(data?: any): any;
}
export interface IValidateSellerUserQuery {
  sellerId?: string | undefined;
  sellerName?: string | undefined;
  sellerUser?: SellerUser | undefined;
}
export declare class ValidationFailure implements IValidationFailure {
  propertyName?: string | undefined;
  errorMessage?: string | undefined;
  attemptedValue?: any | undefined;
  customState?: any | undefined;
  severity?: ValidationFailureSeverity;
  errorCode?: string | undefined;
  formattedMessagePlaceholderValues?:
    | {
        [key: string]: any;
      }
    | undefined;
  constructor(data?: IValidationFailure);
  init(_data?: any): void;
  static fromJS(data: any): ValidationFailure;
  toJSON(data?: any): any;
}
export interface IValidationFailure {
  propertyName?: string | undefined;
  errorMessage?: string | undefined;
  attemptedValue?: any | undefined;
  customState?: any | undefined;
  severity?: ValidationFailureSeverity;
  errorCode?: string | undefined;
  formattedMessagePlaceholderValues?:
    | {
        [key: string]: any;
      }
    | undefined;
}
export declare class Variation implements IVariation {
  /** The type of product. Can be "Physical", "Digital", etc. */
  productType?: string | undefined;
  /** The Stock Keeping Unit (SKU) code for the product. */
  code?: string | undefined;
  /** The manufacturer's part number for the product. */
  manufacturerPartNumber?: string | undefined;
  /** The Global Trade Item Number (GTIN) for the product. This can include UPC (in North America), EAN (in Europe), JAN (in Japan), and ISBN (for books). */
  gtin?: string | undefined;
  /** The name of the product. */
  name?: string | undefined;
  /** The ID of the catalog to which this product belongs. */
  catalogId?: string | undefined;
  /** The ID of the category to which this product belongs. */
  categoryId?: string | undefined;
  /** Product outline in physical catalog (all parent categories ids concatenated. E.g. (1/21/344)) */
  readonly outline?: string | undefined;
  /** Product path in physical catalog (all parent categories names concatenated. E.g. (parent1/parent2)) */
  readonly path?: string | undefined;
  readonly titularItemId?: string | undefined;
  /** The ID of the main product associated with this product variation. */
  mainProductId?: string | undefined;
  /** Specifies whether the product is currently visible on the store for customers to view and purchase.
If set to false, the product is currently sold out. */
  isActive?: boolean | undefined;
  /** Specifies whether the product is currently visible on the store for customers to view and purchase.
If set to false, the product is currently ouf of stock. */
  isBuyable?: boolean | undefined;
  /** Indicates whether the inventory service is tracking the availability of this product.
If set to false, the product is considered in stock without any inventory limitations. */
  trackInventory?: boolean | undefined;
  /** The date and time when the product was last indexed for search. */
  indexingDate?: Date | undefined;
  /** The maximum quantity of the product that can be purchased in a single order. A value of 0 indicates that there are no limitations on the maximum quantity. */
  maxQuantity?: number | undefined;
  /** The minimum quantity of the product that must be purchased in a single order. A value of 0 indicates that there are no limitations on the minimum quantity. */
  minQuantity?: number | undefined;
  /** First listed date and time. If you do not specify an end date, the product will be active until you deactivate it.If you do not specify an end date, the product will be active until you deactivate it.If you do not specify a start date, the product will become active immediately once you save it. */
  startDate?: Date;
  /** Listing expires on the specific date and time. If you do not specify an end date, the product will be active until you deactivate it. */
  endDate?: Date | undefined;
  /** The type of package for this product, which determines the product's specific dimensions. */
  packageType?: string | undefined;
  /** The unit of measurement for the product's weight. */
  weightUnit?: string | undefined;
  /** The weight of the product, in the unit specified by the WeightUnit property. */
  weight?: number | undefined;
  /** The unit of measurement for the product's height, length, and width. */
  measureUnit?: string | undefined;
  /** The height of the product, in the unit specified by the MeasureUnit property. */
  height?: number | undefined;
  /** The length of the product, in the unit specified by the MeasureUnit property. */
  length?: number | undefined;
  /** The width of the product, in the unit specified by the MeasureUnit property. */
  width?: number | undefined;
  enableReview?: boolean | undefined;
  /** The maximum number of times the product can be downloaded. A value of 0 indicates no limit. */
  maxNumberOfDownload?: number | undefined;
  /** The date and time when the download link or access to the product will expire. */
  downloadExpiration?: Date | undefined;
  /** The type of product download. Valid values include: "Standard Product", "Software", and "Music". */
  downloadType?: string | undefined;
  /** Indicates whether the product requires the user to agree to any terms or conditions before downloading. */
  hasUserAgreement?: boolean | undefined;
  /** Specifies the type of shipping option available for the product. */
  shippingType?: string | undefined;
  /** Specifies the type of tax applied to the product. */
  taxType?: string | undefined;
  /** ID of the vendor associated with the product. */
  vendor?: string | undefined;
  /** Indicates the position of the product in the catalog for ordering purposes. */
  priority?: number;
  /** An external identifier for the product that can be used for integration with external systems. */
  outerId?: string | undefined;
  properties?: Property[] | undefined;
  excludedProperties?: ExcludedProperty[] | undefined;
  propertyValues?: PropertyValue[] | undefined;
  /** Gets the default image for the product. */
  readonly imgSrc?: string | undefined;
  images?: Image[] | undefined;
  assets?: Asset[] | undefined;
  links?: CategoryLink[] | undefined;
  variations?: Variation[] | undefined;
  /** Each descendant type should override this property to use other object type for seo records */
  readonly seoObjectType?: string | undefined;
  seoInfos?: SeoInfo[] | undefined;
  reviews?: EditorialReview[] | undefined;
  associations?: ProductAssociation[] | undefined;
  referencedAssociations?: ProductAssociation[] | undefined;
  outlines?: Outline[] | undefined;
  /** System flag used to mark that object was inherited from other */
  readonly isInherited?: boolean;
  readonly parentCategoryIsActive?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
  constructor(data?: IVariation);
  init(_data?: any): void;
  static fromJS(data: any): Variation;
  toJSON(data?: any): any;
}
export interface IVariation {
  /** The type of product. Can be "Physical", "Digital", etc. */
  productType?: string | undefined;
  /** The Stock Keeping Unit (SKU) code for the product. */
  code?: string | undefined;
  /** The manufacturer's part number for the product. */
  manufacturerPartNumber?: string | undefined;
  /** The Global Trade Item Number (GTIN) for the product. This can include UPC (in North America), EAN (in Europe), JAN (in Japan), and ISBN (for books). */
  gtin?: string | undefined;
  /** The name of the product. */
  name?: string | undefined;
  /** The ID of the catalog to which this product belongs. */
  catalogId?: string | undefined;
  /** The ID of the category to which this product belongs. */
  categoryId?: string | undefined;
  /** Product outline in physical catalog (all parent categories ids concatenated. E.g. (1/21/344)) */
  outline?: string | undefined;
  /** Product path in physical catalog (all parent categories names concatenated. E.g. (parent1/parent2)) */
  path?: string | undefined;
  titularItemId?: string | undefined;
  /** The ID of the main product associated with this product variation. */
  mainProductId?: string | undefined;
  /** Specifies whether the product is currently visible on the store for customers to view and purchase.
If set to false, the product is currently sold out. */
  isActive?: boolean | undefined;
  /** Specifies whether the product is currently visible on the store for customers to view and purchase.
If set to false, the product is currently ouf of stock. */
  isBuyable?: boolean | undefined;
  /** Indicates whether the inventory service is tracking the availability of this product.
If set to false, the product is considered in stock without any inventory limitations. */
  trackInventory?: boolean | undefined;
  /** The date and time when the product was last indexed for search. */
  indexingDate?: Date | undefined;
  /** The maximum quantity of the product that can be purchased in a single order. A value of 0 indicates that there are no limitations on the maximum quantity. */
  maxQuantity?: number | undefined;
  /** The minimum quantity of the product that must be purchased in a single order. A value of 0 indicates that there are no limitations on the minimum quantity. */
  minQuantity?: number | undefined;
  /** First listed date and time. If you do not specify an end date, the product will be active until you deactivate it.If you do not specify an end date, the product will be active until you deactivate it.If you do not specify a start date, the product will become active immediately once you save it. */
  startDate?: Date;
  /** Listing expires on the specific date and time. If you do not specify an end date, the product will be active until you deactivate it. */
  endDate?: Date | undefined;
  /** The type of package for this product, which determines the product's specific dimensions. */
  packageType?: string | undefined;
  /** The unit of measurement for the product's weight. */
  weightUnit?: string | undefined;
  /** The weight of the product, in the unit specified by the WeightUnit property. */
  weight?: number | undefined;
  /** The unit of measurement for the product's height, length, and width. */
  measureUnit?: string | undefined;
  /** The height of the product, in the unit specified by the MeasureUnit property. */
  height?: number | undefined;
  /** The length of the product, in the unit specified by the MeasureUnit property. */
  length?: number | undefined;
  /** The width of the product, in the unit specified by the MeasureUnit property. */
  width?: number | undefined;
  enableReview?: boolean | undefined;
  /** The maximum number of times the product can be downloaded. A value of 0 indicates no limit. */
  maxNumberOfDownload?: number | undefined;
  /** The date and time when the download link or access to the product will expire. */
  downloadExpiration?: Date | undefined;
  /** The type of product download. Valid values include: "Standard Product", "Software", and "Music". */
  downloadType?: string | undefined;
  /** Indicates whether the product requires the user to agree to any terms or conditions before downloading. */
  hasUserAgreement?: boolean | undefined;
  /** Specifies the type of shipping option available for the product. */
  shippingType?: string | undefined;
  /** Specifies the type of tax applied to the product. */
  taxType?: string | undefined;
  /** ID of the vendor associated with the product. */
  vendor?: string | undefined;
  /** Indicates the position of the product in the catalog for ordering purposes. */
  priority?: number;
  /** An external identifier for the product that can be used for integration with external systems. */
  outerId?: string | undefined;
  properties?: Property[] | undefined;
  excludedProperties?: ExcludedProperty[] | undefined;
  propertyValues?: PropertyValue[] | undefined;
  /** Gets the default image for the product. */
  imgSrc?: string | undefined;
  images?: Image[] | undefined;
  assets?: Asset[] | undefined;
  links?: CategoryLink[] | undefined;
  variations?: Variation[] | undefined;
  /** Each descendant type should override this property to use other object type for seo records */
  seoObjectType?: string | undefined;
  seoInfos?: SeoInfo[] | undefined;
  reviews?: EditorialReview[] | undefined;
  associations?: ProductAssociation[] | undefined;
  referencedAssociations?: ProductAssociation[] | undefined;
  outlines?: Outline[] | undefined;
  /** System flag used to mark that object was inherited from other */
  isInherited?: boolean;
  parentCategoryIsActive?: boolean;
  createdDate?: Date;
  modifiedDate?: Date | undefined;
  createdBy?: string | undefined;
  modifiedBy?: string | undefined;
  id?: string | undefined;
}
export declare enum CaptureCancelledState {
  Undefined = "Undefined",
  Requested = "Requested",
  Completed = "Completed",
}
export declare enum ChangeRequestStatusCommandNewStatus {
  None = "None",
  WaitForApproval = "WaitForApproval",
  RequestChanges = "RequestChanges",
  Rejected = "Rejected",
  Approved = "Approved",
}
export declare enum CommissionFeeType {
  Static = "Static",
  Dynamic = "Dynamic",
}
export declare enum CommissionFeeCalculationType {
  Fixed = "Fixed",
  Percent = "Percent",
}
export declare enum CommissionFeeDetailsType {
  Static = "Static",
  Dynamic = "Dynamic",
}
export declare enum CommissionFeeDetailsCalculationType {
  Fixed = "Fixed",
  Percent = "Percent",
}
export declare enum CustomerAddressAddressType {
  Undefined = "Undefined",
  Billing = "Billing",
  Shipping = "Shipping",
  BillingAndShipping = "BillingAndShipping",
  Pickup = "Pickup",
}
export declare enum CustomerOrderCancelledState {
  Undefined = "Undefined",
  Requested = "Requested",
  Completed = "Completed",
}
export declare enum CustomerReviewReviewStatus {
  New = "New",
  Approved = "Approved",
  Rejected = "Rejected",
}
export declare enum DynamicCommissionFeeType {
  Static = "Static",
  Dynamic = "Dynamic",
}
export declare enum DynamicCommissionFeeCalculationType {
  Fixed = "Fixed",
  Percent = "Percent",
}
export declare enum DynamicObjectPropertyValueType {
  Undefined = "Undefined",
  ShortText = "ShortText",
  LongText = "LongText",
  Integer = "Integer",
  Decimal = "Decimal",
  DateTime = "DateTime",
  Boolean = "Boolean",
  Html = "Html",
  Image = "Image",
}
export declare enum DynamicPropertyObjectValueValueType {
  Undefined = "Undefined",
  ShortText = "ShortText",
  LongText = "LongText",
  Integer = "Integer",
  Decimal = "Decimal",
  DateTime = "DateTime",
  Boolean = "Boolean",
  Html = "Html",
  Image = "Image",
}
export declare enum InventoryAddressAddressType {
  Undefined = "Undefined",
  Billing = "Billing",
  Shipping = "Shipping",
  BillingAndShipping = "BillingAndShipping",
  Pickup = "Pickup",
}
export declare enum InventoryInfoStatus {
  Disabled = "Disabled",
  Enabled = "Enabled",
  Ignored = "Ignored",
}
export declare enum ObjectSettingEntryValueType {
  ShortText = "ShortText",
  LongText = "LongText",
  Integer = "Integer",
  Decimal = "Decimal",
  DateTime = "DateTime",
  Boolean = "Boolean",
  SecureString = "SecureString",
  Json = "Json",
  PositiveInteger = "PositiveInteger",
}
export declare enum OperationLogOperationType {
  Detached = "Detached",
  Unchanged = "Unchanged",
  Added = "Added",
  Deleted = "Deleted",
  Modified = "Modified",
}
export declare enum OrderAddressAddressType {
  Undefined = "Undefined",
  Billing = "Billing",
  Shipping = "Shipping",
  BillingAndShipping = "BillingAndShipping",
  Pickup = "Pickup",
}
export declare enum OrderShipmentCancelledState {
  Undefined = "Undefined",
  Requested = "Requested",
  Completed = "Completed",
}
export declare enum PaymentInPaymentStatus {
  New = "New",
  Pending = "Pending",
  Authorized = "Authorized",
  Paid = "Paid",
  PartiallyRefunded = "PartiallyRefunded",
  Refunded = "Refunded",
  Voided = "Voided",
  Custom = "Custom",
  Cancelled = "Cancelled",
  Declined = "Declined",
  Error = "Error",
}
export declare enum PaymentInCancelledState {
  Undefined = "Undefined",
  Requested = "Requested",
  Completed = "Completed",
}
export declare enum PaymentMethodType2 {
  Unknown = "Unknown",
  Standard = "Standard",
  Redirection = "Redirection",
  PreparedForm = "PreparedForm",
}
export declare enum PaymentMethodGroupType2 {
  Paypal = "Paypal",
  BankCard = "BankCard",
  Alternative = "Alternative",
  Manual = "Manual",
}
export declare enum ProcessPaymentRequestResultNewPaymentStatus {
  New = "New",
  Pending = "Pending",
  Authorized = "Authorized",
  Paid = "Paid",
  PartiallyRefunded = "PartiallyRefunded",
  Refunded = "Refunded",
  Voided = "Voided",
  Custom = "Custom",
  Cancelled = "Cancelled",
  Declined = "Declined",
  Error = "Error",
}
export declare enum ProductPublicationRequestPrevStatus {
  None = "None",
  WaitForApproval = "WaitForApproval",
  RequestChanges = "RequestChanges",
  Rejected = "Rejected",
  Approved = "Approved",
}
export declare enum ProductPublicationRequestStatus {
  None = "None",
  WaitForApproval = "WaitForApproval",
  RequestChanges = "RequestChanges",
  Rejected = "Rejected",
  Approved = "Approved",
}
export declare enum PropertyValueType2 {
  ShortText = "ShortText",
  LongText = "LongText",
  Number = "Number",
  DateTime = "DateTime",
  Boolean = "Boolean",
  Integer = "Integer",
  GeoPoint = "GeoPoint",
}
export declare enum PropertyType2 {
  Product = "Product",
  Variation = "Variation",
  Category = "Category",
  Catalog = "Catalog",
}
export declare enum PropertyValueValueType {
  ShortText = "ShortText",
  LongText = "LongText",
  Number = "Number",
  DateTime = "DateTime",
  Boolean = "Boolean",
  Integer = "Integer",
  GeoPoint = "GeoPoint",
}
export declare enum RefundReasonCode2 {
  Duplicate = "Duplicate",
  Fraudulent = "Fraudulent",
  RequestedByCustomer = "RequestedByCustomer",
  Other = "Other",
}
export declare enum RefundStatus2 {
  Pending = "Pending",
  Rejected = "Rejected",
  Processed = "Processed",
}
export declare enum RefundCancelledState {
  Undefined = "Undefined",
  Requested = "Requested",
  Completed = "Completed",
}
export declare enum SellerProductStatus2 {
  None = "None",
  Published = "Published",
  HasStagedChanges = "HasStagedChanges",
  WaitForApproval = "WaitForApproval",
  RequiresChanges = "RequiresChanges",
  Rejected = "Rejected",
  Approved = "Approved",
}
export declare enum SettingDescriptorValueType {
  ShortText = "ShortText",
  LongText = "LongText",
  Integer = "Integer",
  Decimal = "Decimal",
  DateTime = "DateTime",
  Boolean = "Boolean",
  SecureString = "SecureString",
  Json = "Json",
  PositiveInteger = "PositiveInteger",
}
export declare enum SortInfoSortDirection {
  Ascending = "Ascending",
  Descending = "Descending",
}
export declare enum ValidationFailureSeverity {
  Error = "Error",
  Warning = "Warning",
  Info = "Info",
}
export declare class ApiException extends Error {
  message: string;
  status: number;
  response: string;
  headers: {
    [key: string]: any;
  };
  result: any;
  constructor(
    message: string,
    status: number,
    response: string,
    headers: {
      [key: string]: any;
    },
    result: any,
  );
  protected isApiException: boolean;
  static isApiException(obj: any): obj is ApiException;
}
//# sourceMappingURL=marketplacevendor.d.ts.map
