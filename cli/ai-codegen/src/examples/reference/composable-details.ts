/**
 * @file Reference Details Composable
 * @description SINGLE SOURCE OF TRUTH for details composable pattern
 * @version 2.0.0
 * @lastUpdated 2025-11-26
 *
 * This is the authoritative example for details composables in VC-Shell.
 * All details composables should follow this pattern exactly.
 *
 * KEY PATTERNS:
 * 1. useAsync<T> - generic type with guard clause
 * 2. useModificationTracker - for dirty state tracking
 * 3. useLoading - combine multiple loading states
 * 4. useApiClient - typed API client access
 * 5. Return currentValue from tracker, NOT original item
 */

import { computed, ref, ComputedRef, Ref, reactive } from "vue";
import { useAsync, useApiClient, useModificationTracker, useLoading } from "@vc-shell/framework";

// =============================================================================
// TYPES - Define in api_client/{module}.api.ts
// =============================================================================

/** Entity interface */
export interface IProduct {
  id?: string;
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  status?: string;
  isActive?: boolean;
  createdDate?: string;
}

/** Create command */
export interface ICreateProductCommand {
  name: string;
  sku?: string;
  description?: string;
  price?: number;
}

/** Update command */
export interface IUpdateProductCommand extends ICreateProductCommand {
  id: string;
}

// =============================================================================
// API CLIENT - Define in api_client/{module}.client.ts
// =============================================================================

// This would be imported from your API client
declare class ProductClient {
  getProductById(id: string): Promise<IProduct>;
  createProduct(command: ICreateProductCommand): Promise<IProduct>;
  updateProduct(command: IUpdateProductCommand): Promise<IProduct>;
  deleteProduct(id: string): Promise<void>;
}

// =============================================================================
// COMPOSABLE INTERFACE - Export for type safety
// =============================================================================

export interface IUseProductDetails {
  // State
  item: Ref<IProduct>;
  loading: ComputedRef<boolean>;

  // From useModificationTracker
  isModified: Readonly<Ref<boolean>>;
  resetModificationState: () => void;

  // Actions
  loadProduct: (id: string) => Promise<void>;
  saveProduct: (data?: IProduct) => Promise<IProduct | undefined>;
  deleteProduct: (id: string) => Promise<void>;
}

// =============================================================================
// COMPOSABLE IMPLEMENTATION
// =============================================================================

export function useProductDetails(): IUseProductDetails {
  const { getApiClient } = useApiClient(ProductClient);

  // ---------------------------------------------------------------------------
  // STATE with useModificationTracker
  // ---------------------------------------------------------------------------

  /**
   * useModificationTracker Setup:
   * 1. Create base ref with reactive object
   * 2. Tracker returns { currentValue, isModified, resetModificationState }
   * 3. ALWAYS return currentValue to blade, NOT original item
   */
  const item = ref<IProduct>(reactive({} as IProduct));
  const { currentValue, isModified, resetModificationState } = useModificationTracker(item);

  // ---------------------------------------------------------------------------
  // ASYNC ACTIONS - useAsync with generic type + guard
  // ---------------------------------------------------------------------------

  /**
   * ⚠️ CRITICAL: useAsync Generic Type Pattern
   *
   * ✅ CORRECT: useAsync<string>(async (id) => { if (!id) return; ... })
   *    - id is typed as string | undefined
   *    - Guard clause is REQUIRED
   *
   * ❌ WRONG: useAsync(async (id: string) => { ... })
   *    - TypeScript thinks id is ALWAYS defined
   *    - Runtime crash when called without id!
   */

  // Load entity by ID
  const { action: loadProduct, loading: loadingProduct } = useAsync<string>(async (id) => {
    // ⚠️ GUARD REQUIRED - id can be undefined!
    if (!id) return;

    const apiClient = await getApiClient();
    const data = await apiClient.getProductById(id);

    // Update tracked value and reset modification state
    currentValue.value = reactive(data);
    resetModificationState();
  });

  // Save entity (create or update)
  // Two generic params: <InputType, OutputType>
  const { action: saveProduct, loading: savingProduct } = useAsync<
    IProduct | undefined,
    IProduct | undefined
  >(async (data) => {
    // ⚠️ GUARD REQUIRED - data can be undefined!
    if (!data) return;

    const apiClient = await getApiClient();
    let result: IProduct;

    if (data.id) {
      // Update existing
      result = await apiClient.updateProduct(data as IUpdateProductCommand);
    } else {
      // Create new
      result = await apiClient.createProduct(data as ICreateProductCommand);
    }

    // Update tracked value and reset modification state
    if (result) {
      currentValue.value = reactive(result);
      resetModificationState();
    }

    return result;
  });

  // Delete entity
  const { action: deleteProduct, loading: deletingProduct } = useAsync<string>(async (id) => {
    // ⚠️ GUARD REQUIRED - id can be undefined!
    if (!id) return;

    const apiClient = await getApiClient();
    await apiClient.deleteProduct(id);
  });

  // ---------------------------------------------------------------------------
  // COMBINED LOADING STATE
  // ---------------------------------------------------------------------------

  /**
   * useLoading combines multiple loading refs into single ComputedRef<boolean>
   * True if ANY of the passed refs is true
   */
  const loading = useLoading(loadingProduct, savingProduct, deletingProduct);

  // ---------------------------------------------------------------------------
  // RETURN - IMPORTANT: return currentValue, NOT item!
  // ---------------------------------------------------------------------------

  return {
    // State - return currentValue from tracker for proper dirty tracking
    item: currentValue,
    loading,

    // Modification tracking
    isModified,
    resetModificationState,

    // Actions
    loadProduct,
    saveProduct,
    deleteProduct,
  };
}
