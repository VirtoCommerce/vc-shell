import { ref, computed, watch } from "vue";

export interface Offer {
  id?: string;
  productId: string;
  name: string;
  productType: string;
  sku: string;
  trackInventory?: boolean;
  isActive?: boolean;
  isDefault?: boolean;
  images?: any[];
  inventoryInfo?: any[];
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  image?: string;
}

function createEmptyOffer(): Offer {
  return {
    id: "",
    productId: "",
    name: "",
    productType: "Physical",
    sku: "",
    trackInventory: true,
    isActive: true,
    isDefault: false,
    images: [],
    inventoryInfo: []
  };
}

// Mock products for search
const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Product A", sku: "PROD-A-001", image: "https://via.placeholder.com/40" },
  { id: "2", name: "Product B", sku: "PROD-B-002", image: "https://via.placeholder.com/40" },
  { id: "3", name: "Product C", sku: "PROD-C-003", image: "https://via.placeholder.com/40" },
  { id: "4", name: "Product D", sku: "PROD-D-004", image: "https://via.placeholder.com/40" },
  { id: "5", name: "Product E", sku: "PROD-E-005", image: "https://via.placeholder.com/40" },
];

export default function useOfferDetails() {
  const item = ref<Offer>(createEmptyOffer());
  const loading = ref(false);
  const modified = ref(false);
  const originalItem = ref<Offer>(createEmptyOffer());

  // Track modifications
  watch(
    () => item.value,
    () => {
      modified.value = JSON.stringify(item.value) !== JSON.stringify(originalItem.value);
    },
    { deep: true }
  );

  async function loadOffer(args: { id: string }) {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock data for existing item
    item.value = {
      id: args.id,
      name: `Offer ${args.id}`,
      productId: "1",
      productType: "Physical",
      sku: `OFF-${args.id}`,
      trackInventory: true,
      isActive: true,
      isDefault: args.id === "1",
      images: [
        { url: "https://via.placeholder.com/200", name: "image1.jpg" },
        { url: "https://via.placeholder.com/200", name: "image2.jpg" }
      ],
      inventoryInfo: [
        { fulfillmentCenterId: "1", quantity: 100 },
        { fulfillmentCenterId: "2", quantity: 50 },
        { fulfillmentCenterId: "3", quantity: 75 }
      ]
    };

    originalItem.value = JSON.parse(JSON.stringify(item.value));
    loading.value = false;
  }

  async function createOffer(entity: Omit<Offer, "id">): Promise<Offer> {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    // Mock create
    const newEntity: Offer = {
      ...entity,
      id: `mock-${Date.now()}`,
      isActive: true,
      isDefault: false
    } as Offer;

    item.value = newEntity;
    originalItem.value = JSON.parse(JSON.stringify(newEntity));
    modified.value = false;

    loading.value = false;
    return newEntity;
  }

  async function updateOffer(entity: Offer & { id: string }): Promise<Offer> {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    // Mock update
    item.value = { ...entity };
    originalItem.value = JSON.parse(JSON.stringify(entity));
    modified.value = false;

    loading.value = false;
    return entity;
  }

  async function deleteOffer(args: { id: string }) {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock delete
    loading.value = false;
  }

  async function validateSku(sku: string, currentId?: string): Promise<{ isValid: boolean }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock validation - check if SKU already exists (except for current offer)
    const existingSkus = ["TSH-001", "JAC-002", "SNE-003", "BOO-004", "JEA-005"];
    const isValid = !existingSkus.includes(sku) || sku === `OFF-${currentId}`;

    return { isValid };
  }

  async function enableOffer(id: string) {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    item.value.isActive = true;

    loading.value = false;
  }

  async function disableOffer(id: string) {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    item.value.isActive = false;

    loading.value = false;
  }

  async function setAsDefault(id: string) {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    item.value.isDefault = true;

    loading.value = false;
  }

  function resetModificationState() {
    originalItem.value = JSON.parse(JSON.stringify(item.value));
    modified.value = false;
  }

  const fetchProductsLoading = ref(false);

  async function fetchProducts(
    keyword?: string,
    skip?: number,
    ids?: string[]
  ): Promise<Product[]> {
    fetchProductsLoading.value = true;

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      let filtered = [...MOCK_PRODUCTS];

      // Filter by keyword
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filtered = filtered.filter(product =>
          product.name?.toLowerCase().includes(lowerKeyword) ||
          product.sku?.toLowerCase().includes(lowerKeyword)
        );
      }

      // Filter by ids if provided
      if (ids && ids.length > 0) {
        filtered = filtered.filter(product => ids.includes(product.id));
      }

      // Apply pagination
      const skipValue = skip || 0;
      const takeValue = 20;
      const results = filtered.slice(skipValue, skipValue + takeValue);

      return results;
    } finally {
      fetchProductsLoading.value = false;
    }
  }

  return {
    item,
    loading: computed(() => loading.value),
    isModified: computed(() => modified.value),
    loadOffer,
    createOffer,
    updateOffer,
    deleteOffer,
    validateSku,
    enableOffer,
    disableOffer,
    setAsDefault,
    resetModificationState,
    fetchProducts,
    fetchProductsLoading: computed(() => fetchProductsLoading.value),
  };
}
