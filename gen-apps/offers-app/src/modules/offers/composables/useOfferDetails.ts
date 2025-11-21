import { computed, ref, ComputedRef, Ref, reactive } from "vue";
import { useAsync, useApiClient, useModificationTracker, useLoading } from "@vc-shell/framework";

// TODO: Replace with your actual API client imports
// Example: import { ProductsClient, IProduct } from "@your-app/api/products";

// @ts-expect-error - Replace with your API types
interface IOffer {
  id?: string;
  name?: string;
  createdDate?: string;
  [key: string]: any;
}

// @ts-expect-error - Replace with your API client
class OfferClient {
  // TODO: Replace these mock methods with your actual API client methods
  async getOfferById(id: string): Promise<IOffer> {
    throw new Error("Method not implemented. Replace with your actual API method.");
  }

  async updateOffer(data: IOffer): Promise<IOffer> {
    throw new Error("Method not implemented. Replace with your actual API method.");
  }

  async createOffer(data: IOffer): Promise<IOffer> {
    throw new Error("Method not implemented. Replace with your actual API method.");
  }

  async deleteOffer(id: string): Promise<void> {
    throw new Error("Method not implemented. Replace with your actual API method.");
  }
}

export interface IUseOfferDetails {
  item: Ref<IOffer>;
  loading: ComputedRef<boolean>;
  loadOffer: (id: string) => Promise<void>;
  saveOffer: (data?: IOffer) => Promise<IOffer | undefined>;
  deleteOffer: (id: string) => Promise<void>;

  // Modification tracking
  isModified: Readonly<Ref<boolean>>;
  resetModificationState: () => void;
}

export function useOfferDetails(): IUseOfferDetails {
  const { getApiClient } = useApiClient(OfferClient);

  const item = ref<IOffer>(reactive({} as IOffer));

  // Use modification tracker - КАК В useOrderDetailsNew.ts
  const { currentValue, isModified, resetModificationState } = useModificationTracker(item);

  const { action: loadOffer, loading: loadingOffer } = useAsync<string>(async (id) => {
    if (id) {
      const apiClient = await getApiClient();
      const data = await apiClient.getOfferById(id);

      currentValue.value = reactive(data);
      resetModificationState();
    }
  });

  const { action: saveOffer, loading: savingOffer } = useAsync<IOffer | undefined, IOffer | undefined>(async (data) => {
    if (!data) return;

    const apiClient = await getApiClient();
    let result: IOffer;

    if (data.id) {
      result = await apiClient.updateOffer(data);
    } else {
      result = await apiClient.createOffer(data);
    }

    if (result) {
      currentValue.value = reactive(result);
      resetModificationState();
    }

    return result;
  });

  const { action: deleteOffer, loading: deletingOffer } = useAsync<string>(async (id) => {
    const apiClient = await getApiClient();
    await apiClient.deleteOffer(id);
  });

  return {
    item: currentValue, // ВАЖНО: возвращаем currentValue, а не item
    loading: useLoading(loadingOffer, savingOffer, deletingOffer),
    loadOffer,
    saveOffer,
    deleteOffer,
    isModified,
    resetModificationState,
  };
}
