/* eslint-disable @typescript-eslint/no-explicit-any */
import { useProduct, useProducts } from "./../../../products";
import { useOffer, useOffers } from "./../../../offers";
import { useOrder, useOrders } from "./../../../orders";
import { Ref, WritableComputedRef, computed, ref, unref, watch } from "vue";
import { IProductDetails } from "../../../../api_client/marketplacevendor";
import { TextOfferDetails } from "./../../../offers/composables/useOffer";
import { toRef } from "@vueuse/core";
import { Composable } from "../../types";

interface Composables {
  useOffer?: typeof useOffer;
  useProduct?: typeof useProduct;
}

abstract class AdaptorBase<T extends Composable<Composables>> {
  composable: ReturnType<T>;
  loading: Ref<boolean>;
  modified: Ref<boolean>;
  item: Record<string, any>;
  itemDetails: Record<string, any>;
  filterTypes: string[];

  constructor(protected comp: T) {
    this.composable = comp() as ReturnType<T>;
    this.loading = this.composable.loading;
    this.modified = this.composable.modified;
  }

  public abstract getItems(...args: any): Promise<void>;
  public abstract updateItem(...args: any): Promise<void>;
  public abstract getAdditional(...args: any): Promise<any>;
  public abstract createItem(...args: any): Promise<void>;
  public abstract deleteItem(...args: any): Promise<void>;
}

class AdaptorUseOffer extends AdaptorBase<typeof useOffer> {
  images: WritableComputedRef<(typeof this.composable)["offerDetails"]["value"]["images"]>;
  constructor() {
    super(useOffer);
    this.item = this.composable.offer;
    this.itemDetails = this.composable.offerDetails;
    this.images = computed({
      get: () => {
        return this.composable.offerDetails.value.images;
      },
      set: (newVal) => {
        this.composable.offerDetails.value.images = newVal;
      },
    });
  }

  override async getItems(...args: Parameters<(typeof this.composable)["loadOffer"]>) {
    return this.composable.loadOffer(...args);
  }

  override async updateItem(...args: Parameters<(typeof this.composable)["updateOffer"]>) {
    return this.composable.updateOffer(...args);
  }

  override async getAdditional(...args: Parameters<(typeof this.composable)["fetchProducts"]>) {
    return this.composable.fetchProducts(...args);
  }

  override async createItem(...args: Parameters<(typeof this.composable)["createOffer"]>) {
    return this.composable.createOffer(...args);
  }

  override async deleteItem(...args: Parameters<(typeof this.composable)["deleteOffer"]>) {
    return this.composable.deleteOffer(...args);
  }

  async getPropDictionaries(...args: Parameters<(typeof this.composable)["searchDictionaryItems"]>) {
    return this.composable.searchDictionaryItems(...args);
  }

  async onMountedHook() {
    this.composable.onMountedHook();
  }

  scopedModuleFunctions() {
    return {
      addPrice: this.composable.addPrice,
      removePrice: this.composable.removePrice,
      trackInventory: this.composable.trackInventory,
    };
  }
}

class AdaptorUseProduct extends AdaptorBase<typeof useProduct> {
  assets: WritableComputedRef<(typeof this.composable)["productDetails"]["value"]["assets"]>;
  images: WritableComputedRef<(typeof this.composable)["productDetails"]["value"]["images"]>;
  constructor() {
    super(useProduct);
    this.item = this.composable.product;
    this.itemDetails = this.composable.productDetails;
    this.images = computed({
      get: () => {
        return this.composable.productDetails.value.images;
      },
      set: (newVal) => {
        this.composable.productDetails.value.images = newVal;
      },
    });
    this.assets = computed({
      get: () => {
        return this.composable.productDetails.value.assets;
      },
      set: (newVal) => {
        this.composable.productDetails.value.assets = newVal;
      },
    });
  }

  override async getItems(...args: Parameters<(typeof this.composable)["loadProduct"]>) {
    return this.composable.loadProduct(...args);
  }

  override async updateItem(...args: Parameters<(typeof this.composable)["updateProductDetails"]>) {
    return this.composable.updateProductDetails(...args);
  }

  override async getAdditional(...args: Parameters<(typeof this.composable)["fetchCategories"]>) {
    return this.composable.fetchCategories(...args);
  }

  override async createItem(...args: Parameters<(typeof this.composable)["createProduct"]>) {
    return this.composable.createProduct(...args);
  }

  override async deleteItem(...args: Parameters<(typeof this.composable)["deleteProduct"]>) {
    return this.composable.deleteProduct(...args);
  }

  async getPropDictionaries(...args: Parameters<(typeof this.composable)["searchDictionaryItems"]>) {
    return this.composable.searchDictionaryItems(...args);
  }
}

export default (composable: keyof Composables) => {
  let composableFn: AdaptorUseOffer | AdaptorUseProduct;

  if (composable === "useOffer") {
    composableFn = new AdaptorUseOffer();
  } else if (composable === "useProduct") {
    composableFn = new AdaptorUseProduct();
  } else {
    throw new Error("There is no composable name provided.");
  }

  const bladeData = ref();
  const bladeDataDetails = ref();

  const modified = computed(() => {
    return unref(composableFn.modified.value);
  });

  const loading = computed(() => {
    return unref(composableFn.loading.value);
  });

  const assets = () => {
    if ("assets" in composableFn) {
      return composableFn.assets;
    }
  };

  const images = () => {
    if ("images" in composableFn) {
      return composableFn.images;
    }
  };

  async function loadBladeData(id: string) {
    try {
      await composableFn.getItems({ id });

      const data = composableFn.item;
      const details = composableFn.itemDetails;

      bladeData.value = unref(data);

      bladeDataDetails.value = unref(details);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadAdditionalData(keyword?: string, skip = 0, ids?: string[]) {
    return await composableFn.getAdditional(keyword, skip, ids);
  }

  async function updateDetails(details: TextOfferDetails | IProductDetails, itemId?: string, additionalParam = false) {
    try {
      if (typeof details === "object" && "sku" in details && composableFn instanceof AdaptorUseOffer) {
        await composableFn.updateItem(details);
      } else if (composableFn instanceof AdaptorUseProduct) {
        await composableFn.updateItem(itemId, details, additionalParam);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function createItem(details: TextOfferDetails | IProductDetails) {
    try {
      if ("sku" in details && composableFn instanceof AdaptorUseOffer) {
        await composableFn.createItem(details);
      } else if (composableFn instanceof AdaptorUseProduct) {
        await composableFn.createItem(details);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteItem(id: string) {
    try {
      if (composableFn instanceof AdaptorUseOffer) {
        await composableFn.deleteItem({ id });
      } else if (composableFn instanceof AdaptorUseProduct) {
        await composableFn.deleteItem(id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function getPropDictionaries(property: Record<string, any>, keyword?: string, skip?: number) {
    try {
      if (composableFn instanceof AdaptorUseProduct) {
        return await composableFn.getPropDictionaries([property.id], keyword, skip);
      }
      if (composableFn instanceof AdaptorUseOffer) {
        return await composableFn.getPropDictionaries([property.id], keyword, skip);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function scopedModuleFunction() {
    if (composableFn instanceof AdaptorUseOffer) {
      return composableFn.scopedModuleFunctions();
    }
  }

  function runMountedHook() {
    if (composableFn instanceof AdaptorUseOffer) {
      return composableFn.onMountedHook();
    }
  }

  return {
    bladeData: computed(() => bladeData.value),
    disabled: computed(() => {
      return bladeData.value && "canBeModified" in bladeData.value && !bladeData.value.canBeModified;
    }),
    bladeDataDetails,
    loading,
    modified,
    assets: assets(),
    images: images(),
    loadBladeData,
    loadAdditionalData,
    updateDetails,
    createItem,
    deleteItem,
    getPropDictionaries,
    scopedModuleFunction,
    runMountedHook,
  };
};
