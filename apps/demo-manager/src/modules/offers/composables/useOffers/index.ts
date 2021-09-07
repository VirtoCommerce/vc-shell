import { Ref, ref, computed } from "vue";
import { mockedOffers } from "./mock";
import { IOffer } from "../../types";
import { useLogger } from "@virtoshell/core";

interface IUseOffers {
  offers: Ref<IOffer[]>;
  totalCount: Ref<number>;
  pages: Ref<number>;
  currentPage: Ref<number>;
  loadOffers: (args?: { page?: number; sort?: string }) => void;
}

interface IUseOffersOptions {
  pageSize?: number;
  sort?: string;
}

export default (options?: IUseOffersOptions): IUseOffers => {
  const logger = useLogger();
  const offers = ref<IOffer[]>([]);
  const totalCount = ref<number>(0);
  const pageSize = options?.pageSize || 20;
  const currentPage = ref<number>(1);

  async function loadOffers(args?: { page?: number; sort?: string }) {
    logger.info(
      `Load offers page ${args?.page || 1} sort by ${args?.sort || "default"}`
    );
    const data = await mockedOffers({
      page: args?.page || 1,
      sort: args?.sort,
    });
    offers.value = data?.results;
    totalCount.value = data?.totalCount;
    currentPage.value = args?.page || 1;
  }

  return {
    offers: computed(() => offers.value),
    totalCount: computed(() => totalCount.value),
    pages: computed(() => Math.ceil(totalCount.value / pageSize)),
    currentPage: computed(() => currentPage.value),
    loadOffers,
  };
};
