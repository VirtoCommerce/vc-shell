export interface IProduct {
  id: number;
  image?: string;
  gtin?: string;
  sellerName?: string;
  category?: string;
  createdDate?: string;
  status?: string;
}

export interface IProductResponse {
  results: IProduct[];
  totalCount: number;
}
