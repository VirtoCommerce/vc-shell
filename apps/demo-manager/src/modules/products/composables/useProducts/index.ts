import { Ref, ref, computed } from "vue";
import { mockedProducts } from "./mock";
import { IProduct } from "../../types";
import { useLogger } from "@virtoshell/core";

interface IUseProducts {
  products: Ref<IProduct[]>;
  totalCount: Ref<number>;
  pages: Ref<number>;
  currentPage: Ref<number>;
  loadProducts: (args?: { page?: number; sort?: string }) => void;
}

interface IUseProductOptions {
  pageSize?: number;
  sort?: string;
}

export default (options?: IUseProductOptions): IUseProducts => {
  const logger = useLogger();
  const products = ref<IProduct[]>([]);
  const totalCount = ref<number>(0);
  const pageSize = options?.pageSize || 20;
  const currentPage = ref<number>(1);

  async function loadProducts(args?: { page?: number; sort?: string }) {
    logger.info(
      `Load products page ${args?.page || 1} sort by ${args?.sort || "default"}`
    );
    const data = await mockedProducts({
      page: args?.page || 1,
      sort: args?.sort,
    });
    products.value = data?.results;
    totalCount.value = data?.totalCount;
    currentPage.value = args?.page || 1;
  }

  return {
    products: computed(() => products.value),
    totalCount: computed(() => totalCount.value),
    pages: computed(() => Math.ceil(totalCount.value / pageSize)),
    currentPage: computed(() => currentPage.value),
    loadProducts,
  };
};
