import { Ref, ref, watch } from "vue";
import { offersClient } from "../../../api_client/offers.client";
import type { IOfferDetails, IProduct, ILanguage, IMarketplaceSettings } from "../types";

export function useOfferDetails() {
  // State
  const item: Ref<IOfferDetails> = ref({
    id: "",
    sku: "",
    name: "",
    productId: "",
    productType: "Physical",
    isActive: true,
    isDefault: false,
    trackInventory: false,
    createdDate: new Date().toISOString(),
    images: [],
    inventoryInfo: [],
    priceList: [],
  });
  const loading = ref(false);
  const isModified = ref(false);
  const originalItem: Ref<IOfferDetails | null> = ref(null);
  const settings = ref<IMarketplaceSettings | null>(null);

  // Methods
  async function load(id: string) {
    loading.value = true;

    try {
      const result = await offersClient.getOfferByIdGET(id);
      item.value = result;
      originalItem.value = JSON.parse(JSON.stringify(result));
      isModified.value = false;
    } catch (error) {
      console.error("[useOfferDetails] Error loading offer:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function save() {
    loading.value = true;

    try {
      if (item.value.id) {
        // Update existing
        await offersClient.updateOffer({
          id: item.value.id,
          sku: item.value.sku,
          name: item.value.name,
          productId: item.value.productId,
          productType: item.value.productType,
          trackInventory: item.value.trackInventory,
          inventoryInfo: item.value.inventoryInfo,
          images: item.value.images,
        });
      } else {
        // Create new
        const created = await offersClient.createNewOffer({
          sku: item.value.sku!,
          name: item.value.name,
          productId: item.value.productId!,
          productType: item.value.productType!,
          trackInventory: item.value.trackInventory,
          inventoryInfo: item.value.inventoryInfo,
        });
        item.value = created;
      }

      isModified.value = false;
      originalItem.value = JSON.parse(JSON.stringify(item.value));
    } catch (error) {
      console.error("[useOfferDetails] Error saving offer:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function remove() {
    if (!item.value.id) {
      throw new Error("Cannot delete offer without ID");
    }

    loading.value = true;

    try {
      await offersClient.deleteOffers([item.value.id]);
    } catch (error) {
      console.error("[useOfferDetails] Error deleting offer:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function enable() {
    if (!item.value.id) {
      throw new Error("Cannot enable offer without ID");
    }

    loading.value = true;

    try {
      await offersClient.enableOffer(item.value.id);
      item.value.isActive = true;
    } catch (error) {
      console.error("[useOfferDetails] Error enabling offer:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function disable() {
    if (!item.value.id) {
      throw new Error("Cannot disable offer without ID");
    }

    loading.value = true;

    try {
      await offersClient.disableOffer(item.value.id);
      item.value.isActive = false;
    } catch (error) {
      console.error("[useOfferDetails] Error disabling offer:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function setDefault() {
    if (!item.value.id) {
      throw new Error("Cannot set default offer without ID");
    }

    loading.value = true;

    try {
      await offersClient.changeOfferDefault({ id: item.value.id });
      item.value.isDefault = true;
    } catch (error) {
      console.error("[useOfferDetails] Error setting default offer:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function validateSku(sku: string, offerId?: string): Promise<boolean> {
    try {
      const result = await offersClient.validateOffer({ sku, id: offerId });
      return result.isValid;
    } catch (error) {
      console.error("[useOfferDetails] Error validating SKU:", error);
      return false;
    }
  }

  async function searchProducts(keyword: string): Promise<IProduct[]> {
    try {
      const results = await offersClient.searchOfferProducts({ keyword });
      return results;
    } catch (error) {
      console.error("[useOfferDetails] Error searching products:", error);
      return [];
    }
  }

  async function uploadImages(offerId: string, files: File[]) {
    try {
      const uploadedImages = await offersClient.uploadImages(offerId, files);
      return uploadedImages;
    } catch (error) {
      console.error("[useOfferDetails] Error uploading images:", error);
      throw error;
    }
  }

  async function deleteImage(imageId: string) {
    try {
      await offersClient.deleteImage(imageId);
    } catch (error) {
      console.error("[useOfferDetails] Error deleting image:", error);
      throw error;
    }
  }

  async function loadLanguages(): Promise<ILanguage[]> {
    try {
      const languages = await offersClient.getLanguages();
      return languages;
    } catch (error) {
      console.error("[useOfferDetails] Error loading languages:", error);
      return [];
    }
  }

  async function loadSettings() {
    try {
      settings.value = await offersClient.getSettings();
    } catch (error) {
      console.error("[useOfferDetails] Error loading settings:", error);
      settings.value = { allowMultipleOffers: false };
    }
  }

  function resetModificationState() {
    isModified.value = false;
    originalItem.value = JSON.parse(JSON.stringify(item.value));
  }

  // Track modifications by comparing current item with original
  watch(
    item,
    (newValue) => {
      if (originalItem.value) {
        isModified.value = JSON.stringify(newValue) !== JSON.stringify(originalItem.value);
      }
    },
    { deep: true },
  );

  return {
    // State
    item,
    loading,
    isModified,
    settings,

    // Methods
    load,
    save,
    remove,
    enable,
    disable,
    setDefault,
    validateSku,
    searchProducts,
    uploadImages,
    deleteImage,
    loadLanguages,
    loadSettings,
    resetModificationState,
  };
}
