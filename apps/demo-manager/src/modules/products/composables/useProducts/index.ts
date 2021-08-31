import { Ref, ref, computed } from "vue";
import { mockedProducts } from "./mock";
import { IProduct } from "../../types";

interface IUseProducts {
  products: Ref<IProduct[]>;
  totalCount: Ref<number>;
  pages: Ref<number>;
  currentPage: Ref<number>;
  loadProducts: (args?: { page: number }) => void;
}

interface IUseProductOptions {
  pageSize?: number;
}

export default (options?: IUseProductOptions): IUseProducts => {
  const products = ref<IProduct[]>([]);
  const totalCount = ref<number>(0);
  const pageSize = options?.pageSize || 20;
  const currentPage = ref<number>(1);

  async function loadProducts(args?: { page: number }) {
    const data = await mockedProducts();
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
