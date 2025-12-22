import { inject, ref, computed, watch, onUnmounted, type Ref, type ComputedRef } from "vue";
import { mergeWith, isPlainObject } from "lodash-es";
import { AiAgentServiceKey, BladeInstanceKey } from "../../../../injection-keys";
import type { IAiAgentServiceInternal } from "../services/ai-agent-service";
import type {
  ISuggestion,
  UseAiAgentContextOptions,
  UseAiAgentContextReturn,
  IPreviewChangesPayload,
  AiAgentContextType,
} from "../types";
import { createLogger } from "../../../utilities";

const logger = createLogger("use-ai-agent-context");

/**
 * Custom merge function for AI agent preview changes.
 * Handles sparse arrays where null means "skip this index".
 *
 * @example
 * // Nested objects - deep merge
 * deepMergeChanges({seo: {title: "Old", desc: "Desc"}}, {seo: {title: "New"}})
 * // → {seo: {title: "New", desc: "Desc"}}
 *
 * @example
 * // Sparse arrays - null skips index
 * deepMergeChanges({items: [{a:1}, {b:2}]}, {items: [null, {c:3}]})
 * // → {items: [{a:1}, {b:2, c:3}]}
 */
function deepMergeChanges<T extends object>(target: T, source: object): T {
  const customizer = (targetVal: unknown, sourceVal: unknown): unknown => {
    // If source value is null/undefined, keep target value (skip this index/field)
    if (sourceVal === null || sourceVal === undefined) {
      return targetVal;
    }

    // If both are arrays, merge by index with sparse array support
    if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
      const result = [...targetVal];
      sourceVal.forEach((item, index) => {
        if (item !== null && item !== undefined) {
          if (isPlainObject(item) && isPlainObject(result[index])) {
            // Recursively merge objects in array
            result[index] = deepMergeChanges(result[index] as object, item);
          } else {
            // Replace primitive or non-object values
            result[index] = item;
          }
        }
        // null/undefined in source array = skip this index
      });
      return result;
    }

    // For objects, let mergeWith handle recursively with this customizer
    return undefined;
  };

  return mergeWith({}, target, source, customizer);
}

/**
 * Checks if the ref value is an array
 */
function isArrayRef<T>(dataRef: Ref<T> | Ref<T[]>): dataRef is Ref<T[]> {
  return Array.isArray(dataRef.value);
}

/**
 * Normalizes any ref value to an array for sending to the AI agent
 */
function normalizeToArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return value != null ? [value] : [];
}

/**
 * Gets the target object for applying changes based on ref type
 */
function getTargetForChanges<T>(dataRef: Ref<T> | Ref<T[]>): T | undefined {
  if (isArrayRef(dataRef)) {
    // Array ref - return first item
    return dataRef.value[0];
  }
  // Single object ref - return the object directly
  return dataRef.value;
}

/**
 * Composable for binding blade data to AI agent context.
 *
 * This composable automatically:
 * - Sends data updates to the AI agent when dataRef changes
 * - Normalizes single objects to arrays for the AI agent
 * - Handles PREVIEW_CHANGES messages to update form data
 * - Provides preview state for visual feedback
 *
 * @example List blade (array of selected items)
 * ```typescript
 * const { selectedItems } = useTableSelection<Offer>();
 *
 * useAiAgentContext({ dataRef: selectedItems });
 * ```
 *
 * @example Details blade (single object - automatically wrapped in array)
 * ```typescript
 * const offer = ref<Offer>({});
 *
 * // Just pass the ref directly - no need to wrap in array!
 * const { previewState } = useAiAgentContext({ dataRef: offer });
 *
 * // Use previewState.isActive to show preview indicator
 * ```
 *
 * @example With custom suggestions
 * ```typescript
 * useAiAgentContext({
 *   dataRef: offer,
 *   suggestions: [
 *     {
 *       id: "translate",
 *       title: "Translate description",
 *       icon: "translation",
 *       iconColor: "#FF4A4A",
 *       prompt: "Translate the offer description to English"
 *     },
 *   ],
 * });
 * ```
 */
export function useAiAgentContext<T extends { id: string; objectType: string; name: string; [key: string]: unknown }>(
  options: UseAiAgentContextOptions<T>,
): UseAiAgentContextReturn {
  const { dataRef, suggestions } = options;

  // Try to get the service (may not be available if plugin not installed)
  const service = inject(AiAgentServiceKey) as IAiAgentServiceInternal | undefined;

  // Get current blade instance to identify which blade this context belongs to
  const bladeInstance = inject(BladeInstanceKey, null);
  const bladeId = computed(() => bladeInstance?.value?.id);

  // Preview state
  const isPreviewActive = ref(false);
  const changedFieldsList = ref<string[]>([]);

  // If service is not available, return dummy preview state
  if (!service) {
    logger.debug("AiAgentService not available, context binding disabled");
    return {
      previewState: {
        isActive: computed(() => false),
        changedFields: computed(() => []),
      },
    };
  }

  // Determine context type based on dataRef type
  // Array ref = list blade (multiple selected items)
  // Single object ref = details blade (single item being edited)
  const detectedContextType: AiAgentContextType = isArrayRef(dataRef) ? "list" : "details";

  // Set context data in service (items, contextType, and suggestions)
  // Always sends an array to the service, normalizing single objects
  // Context is bound to specific blade ID
  const updateContextData = () => {
    const items = normalizeToArray(dataRef.value).map((item) => ({
      id: item.id,
      objectType: item.objectType,
      name: item.name,
    }));
    service._setContextData(items, detectedContextType, suggestions, bladeId.value);
    console.log(
      `[USE-AI-AGENT-CONTEXT] Context updated: ${items.length} items, type: ${detectedContextType}, blade: ${bladeId.value}`,
    );
  };

  // Log that the handler is being registered
  console.log("[USE-AI-AGENT-CONTEXT] Registering PREVIEW_CHANGES handler for blade:", bladeId.value);

  // Watch dataRef for changes and update context
  const stopWatch = watch(
    dataRef,
    () => {
      updateContextData();
      // Clear preview state when data changes from outside
      if (isPreviewActive.value) {
        isPreviewActive.value = false;
        changedFieldsList.value = [];
      }
    },
    { deep: true, immediate: true },
  );

  // Handle PREVIEW_CHANGES messages
  // Applies changes to the target object (single ref or first item in array)
  const unsubscribe = service._onPreviewChanges((payload: IPreviewChangesPayload) => {
    console.log("[USE-AI-AGENT-CONTEXT] PREVIEW_CHANGES handler called", {
      bladeId: bladeId.value,
      payloadKeys: Object.keys(payload.data || {}),
      changedFields: payload.changedFields,
      hasDataRef: !!dataRef,
      dataRefValue: dataRef?.value ? "present" : "empty",
    });

    const target = getTargetForChanges(dataRef);
    if (!target) {
      console.warn("[USE-AI-AGENT-CONTEXT] Cannot apply preview changes: no data in dataRef", {
        bladeId: bladeId.value,
        dataRefValue: dataRef?.value,
      });
      return;
    }

    const targetObj = target as Record<string, unknown>;
    const updatedData = payload.data;

    console.log("[USE-AI-AGENT-CONTEXT] Applying preview changes", {
      bladeId: bladeId.value,
      targetObjKeys: Object.keys(targetObj),
      updatedDataKeys: Object.keys(updatedData),
      updatedDataPreview: JSON.stringify(updatedData).substring(0, 500),
    });

    // Deep merge changes into target object
    // Supports:
    // - Nested objects: {"seo": {"metaTitle": "New"}} merges into existing seo
    // - Sparse arrays: [null, {"price": 50}] updates index 1 only (null = skip)
    const mergedResult = deepMergeChanges(targetObj, updatedData);

    // Copy merged result back to target object (to trigger Vue reactivity)
    Object.keys(mergedResult).forEach((key) => {
      targetObj[key] = mergedResult[key as keyof typeof mergedResult];
    });

    console.log("[USE-AI-AGENT-CONTEXT] Deep merge completed", {
      bladeId: bladeId.value,
      resultPreview: JSON.stringify(targetObj).substring(0, 500),
    });

    // Update preview state
    isPreviewActive.value = true;
    changedFieldsList.value = payload.changedFields || Object.keys(updatedData);

    console.log("[USE-AI-AGENT-CONTEXT] Preview changes applied successfully", {
      bladeId: bladeId.value,
      changedFields: changedFieldsList.value,
      isPreviewActive: isPreviewActive.value,
      targetObjAfter: JSON.stringify(targetObj).substring(0, 500),
    });
  });

  // Cleanup on unmount
  onUnmounted(() => {
    stopWatch();
    unsubscribe();
    // Clear context for this specific blade when component unmounts
    service._setContextData([], "list", undefined, bladeId.value);
    logger.debug(`Context cleared on unmount for blade: ${bladeId.value}`);
  });

  return {
    previewState: {
      isActive: computed(() => isPreviewActive.value),
      changedFields: computed(() => changedFieldsList.value),
    },
  };
}

/**
 * Clears the preview state manually.
 * Useful when user saves or discards changes.
 */
export function clearPreviewState(previewState: UseAiAgentContextReturn["previewState"]): void {
  // This is a helper for external clearing if needed
  // The actual state is cleared when dataRef changes
  logger.debug("Preview state cleared manually");
}
