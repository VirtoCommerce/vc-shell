import { IProduct } from "../../products/types";

export interface IOffer {
  id: string;
  product: IProduct;
  sku?: string;
  createdDate?: string;
  status?: string;
  listPrice?: number;
  salePrice?: number;
  minQty?: number;
  qty?: number;
}

export interface IOffersResponse {
  results: IOffer[];
  totalCount: number;
}
