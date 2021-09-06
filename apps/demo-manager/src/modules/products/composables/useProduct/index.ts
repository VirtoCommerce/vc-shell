import { Ref, ref, computed } from "vue";
import { mockedProduct } from "../useProducts/mock";
import { IProduct } from "../../types";
import { useLogger } from "@virtoshell/core";

interface IUseProduct {
  product: Ref<IProduct>;
  loading: Ref<boolean>;
  loadProduct: (args: { id: string }) => void;
}

interface IUseProductOptions {
  pageSize?: number;
  sort?: string;
}

export default (options?: IUseProductOptions): IUseProduct => {
  const logger = useLogger();
  const product = ref<IProduct>();
  const loading = ref(true);

  async function loadProduct(args: { id: string }) {
    logger.info(`Load product with id ${args.id}`);
    const data = await mockedProduct({ id: args.id });
    product.value = data;
    loading.value = false;
  }

  return {
    product: computed(() => product.value),
    loading: computed(() => loading.value),
    loadProduct,
  };
};
