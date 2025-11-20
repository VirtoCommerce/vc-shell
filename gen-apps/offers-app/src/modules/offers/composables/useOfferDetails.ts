import { ref, computed, Ref } from "vue";
import { useApiClient, useAsync, useModificationTracker, useNotifications } from "@vc-shell/framework";
import { OffersClient } from "../../../api_client";
import type { IOfferDetails, IFulfillmentCenter, ILanguage } from "../types";

export default function useOfferDetails() {
  const { getApiClient } = useApiClient(OffersClient);

  // State
  const offer: Ref<IOfferDetails> = ref({
    name: "",
    productId: "",
    productType: "",
    sku: "",
    trackInventory: false,
    fulfillmentCenterQuantities: {},
    images: [],
  } as IOfferDetails);

  const settings = ref({
    allowDefault: true,
  });

  const languages = ref<ILanguage[]>([
    { code: "en-US", name: "English (US)" },
  ]);

  const fulfillmentCenters = ref<IFulfillmentCenter[]>([]);

  // Modification tracking
  const { currentValue, isModified, resetModificationState } = useModificationTracker(offer);

  // Computed
  const modified = computed(() => isModified.value);

  // Load offer
  const { action: loadOffer, loading } = useAsync(async (id: string) => {
    const client = await getApiClient();
    const result = await client.getOfferByIdGET(id);
    offer.value = result;
    resetModificationState();

    // Load related data
    await Promise.all([loadLanguages(), loadFulfillmentCenters(), loadSettings()]);

    return result;
  });

  // Create offer
  async function createOffer() {
    const client = await getApiClient();
    const result = await client.createNewOffer({
      name: offer.value.name,
      productId: offer.value.productId,
      productType: offer.value.productType,
      sku: offer.value.sku,
      trackInventory: offer.value.trackInventory,
      fulfillmentCenterQuantities: offer.value.fulfillmentCenterQuantities,
    });

    offer.value = result;
    resetModificationState();
    return result;
  }

  // Update offer
  async function updateOffer() {
    const client = await getApiClient();
    const result = await client.updateOffer({
      id: offer.value.id!,
      name: offer.value.name,
      productId: offer.value.productId,
      productType: offer.value.productType,
      sku: offer.value.sku,
      trackInventory: offer.value.trackInventory,
      fulfillmentCenterQuantities: offer.value.fulfillmentCenterQuantities,
    });

    offer.value = result;
    resetModificationState();
    return result;
  }

  // Delete offer
  async function deleteOffer(id: string) {
    const client = await getApiClient();
    await client.deleteOffers([id]);
  }

  // Validate SKU
  async function validateSku(sku: string, currentId?: string) {
    const client = await getApiClient();
    const result = await client.validateOffer({
      sku,
      id: currentId,
    });

    return {
      isValid: !result.errors || result.errors.length === 0,
      errors: result.errors,
    };
  }

  // Search products for dropdown
  async function searchOfferProducts(keyword: string) {
    const client = await getApiClient();
    const result = await client.searchOfferProducts({
      keyword,
      take: 20,
    });

    return result.results || [];
  }

  // Enable/Disable/Set Default
  async function enableOffer(id: string) {
    const client = await getApiClient();
    await client.updateOffer({
      id,
      isActive: true,
    });
  }

  async function disableOffer(id: string) {
    const client = await getApiClient();
    await client.updateOffer({
      id,
      isActive: false,
    });
  }

  async function setAsDefault(id: string) {
    const client = await getApiClient();
    await client.changeOfferDefault({ offerId: id });
  }

  // Load supporting data
  async function loadLanguages() {
    try {
      // Mock implementation - replace with actual API call
      languages.value = [
        { code: "en-US", name: "English (US)" },
        { code: "de-DE", name: "German (Germany)" },
        { code: "fr-FR", name: "French (France)" },
      ];
    } catch (error) {
      console.error("Error loading languages:", error);
    }
  }

  async function loadFulfillmentCenters() {
    try {
      // Mock implementation - replace with actual API call
      fulfillmentCenters.value = [
        { id: "center-1", name: "Warehouse North" },
        { id: "center-2", name: "Warehouse South" },
        { id: "center-3", name: "Warehouse East" },
      ];
    } catch (error) {
      console.error("Error loading fulfillment centers:", error);
    }
  }

  async function loadSettings() {
    try {
      // Mock implementation - replace with actual API call
      settings.value = {
        allowDefault: true,
      };
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  // Domain events handling
  const { setNotificationHandler } = useNotifications("OfferCreatedDomainEvent");
  setNotificationHandler((notification) => {
    // Handle offer created event
    console.log("Offer created:", notification);
  });

  const { setNotificationHandler: setDeleteHandler } = useNotifications("OfferDeletedDomainEvent");
  setDeleteHandler((notification) => {
    // Handle offer deleted event
    console.log("Offer deleted:", notification);
  });

  return {
    offer: currentValue,
    loading,
    modified,
    settings,
    languages,
    fulfillmentCenters,
    loadOffer,
    createOffer,
    updateOffer,
    deleteOffer,
    validateSku,
    searchOfferProducts,
    enableOffer,
    disableOffer,
    setAsDefault,
  };
}
