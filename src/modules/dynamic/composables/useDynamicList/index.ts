/* eslint-disable @typescript-eslint/no-explicit-any */
import { useProducts } from "./../../../products";
import { useOffers } from "./../../../offers";
import { useOrders } from "./../../../orders";
import { Ref, UnwrapRef, computed, ref, unref } from "vue";
import { Composable } from "../../types";

type Composables = {
  useOffers: typeof useOffers;
  useProducts: typeof useProducts;
};

abstract class AdaptorBase<T extends Composable<Composables>> {
  composable: ReturnType<T>;
  loading: Ref<boolean>;
  items: Ref<Record<string, any>[]>;
  pages: Ref<number>;
  searchQuery: ReturnType<T>["searchQuery"];
  currentPage: Ref<number>;
  totalCount: Ref<number>;

  constructor(protected comp: T) {
    this.composable = comp() as ReturnType<T>;
    this.loading = this.composable.loading;

    this.currentPage = this.composable.currentPage;
    this.pages = this.composable.pages;
    this.totalCount = this.composable.totalCount;
  }

  public abstract getItems(...args: any): Promise<void>;
  public abstract deleteItems(...args: any): Promise<void>;
}

class AdaptorUseOffers extends AdaptorBase<typeof useOffers> {
  constructor() {
    super(useOffers);
    this.items = this.composable.offers;
    this.searchQuery = this.composable.searchQuery;
  }

  override getItems(...args: Parameters<(typeof this.composable)["loadOffers"]>) {
    return this.composable.loadOffers(...args);
  }

  override deleteItems(...args: Parameters<(typeof this.composable)["deleteOffers"]>) {
    return this.composable.deleteOffers(...args);
  }
}

class AdaptorUseProducts extends AdaptorBase<typeof useProducts> {
  constructor() {
    super(useProducts);
    this.items = this.composable.products;
    this.searchQuery = this.composable.searchQuery;
  }

  override getItems(...args: Parameters<(typeof this.composable)["loadProducts"]>) {
    return this.composable.loadProducts(...args);
  }

  override deleteItems(...args: Parameters<(typeof this.composable)["deleteProducts"]>) {
    return this.composable.deleteProducts(...args);
  }
}

interface IDynamicBladeOptions {
  pageSize?: number;
  sort?: string;
  keyword?: string;
}

export default (composable: keyof Composables, options?: IDynamicBladeOptions) => {
  let composableFn: AdaptorUseOffers | AdaptorUseProducts;

  if (composable === "useOffers") {
    composableFn = new AdaptorUseOffers();
  } else if (composable === "useProducts") {
    composableFn = new AdaptorUseProducts();
  } else {
    throw new Error("There is no composable name provided.");
  }

  const pageSize = 20;

  const searchQuery = ref({
    take: pageSize,
    sort: options?.sort,
    keyword: options?.keyword,
    ...unref(composableFn.searchQuery),
  });

  const bladeData = ref();

  const totalCount = computed(() => {
    return unref(composableFn.totalCount);
  });

  const pages = computed(() => {
    return unref(composableFn.pages);
  });

  const currentPage = computed(() => {
    return unref(composableFn.currentPage);
  });

  const loading = computed(() => {
    return unref(composableFn.loading);
  });

  async function loadBladeData(query: (typeof composableFn.searchQuery)["value"]) {
    try {
      if (composableFn instanceof AdaptorUseOffers) {
        await composableFn.getItems(unref(query));
      } else if (composableFn instanceof AdaptorUseProducts) {
        await composableFn.getItems(unref(query));
      }

      const data = composableFn.items;

      bladeData.value = unref(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteItems(allSelected: boolean, ids: string[]) {
    try {
      await composableFn.deleteItems(allSelected, ids);
    } catch (e) {
      console.error(e);
    }
  }

  return {
    totalCount: computed(() => totalCount.value),
    pages: computed(() => pages.value),
    bladeDetails: computed(() => bladeData.value),
    currentPage: computed(() => currentPage.value),
    loading: computed(() => loading.value),
    searchQuery,
    loadBladeData,
    deleteItems,
  };
};
