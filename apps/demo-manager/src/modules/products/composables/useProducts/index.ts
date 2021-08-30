import { Ref, ref, computed } from "vue";
import { mockedProducts } from "./mock";
import { IProduct } from "../../types";

interface IUseProducts {
  products: Ref<IProduct[]>;
  totalCount: Ref<number>;
  pages: Ref<number>;
  currentPage: Ref<number>;
  loadProducts: () => void;
}

interface IUseProductOptions {
  pageSize?: number;
}

export default (options?: IUseProductOptions): IUseProducts => {
  const products = ref<IProduct[]>([]);
  const totalCount = ref<number>(0);
  const pageSize = options?.pageSize || 20;
  const currentPage = ref<number>(1);

  async function loadProducts() {
    products.value = await (await mockedProducts())?.results;
  }

  return {
    products: computed(() => products.value),
    totalCount: computed(() => totalCount.value),
    pages: computed(() => Math.floor(totalCount.value / pageSize)),
    currentPage: computed(() => currentPage.value),
    loadProducts,
  };
};
