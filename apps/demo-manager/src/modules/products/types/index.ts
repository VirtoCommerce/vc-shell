export interface IProduct {
  id: string;
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
