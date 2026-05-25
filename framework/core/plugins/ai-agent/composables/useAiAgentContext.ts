import { inject, computed, watch, onUnmounted, type Ref } from "vue";
import { AiAgentServiceKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import type { IAiAgentServiceInternal } from "@core/plugins/ai-agent/services/ai-agent-service";
import type { UseAiAgentContextOptions, AiAgentContextType } from "@core/plugins/ai-agent/types";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-ai-agent-context");

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
 * Composable for binding blade data to AI agent context.
 *
 * Sends data updates to the AI agent when dataRef changes and normalizes
 * single objects to arrays for the agent protocol.
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
 * useAiAgentContext({ dataRef: offer });
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
export function useAiAgentContext<
  T extends {
    id?: string | undefined;
    objectType?: string | undefined;
    name?: string | undefined;
  },
>(options: UseAiAgentContextOptions<T>): void {
  const { dataRef, suggestions } = options;

  // Try to get the service (may not be available if plugin not installed)
  const service = inject(AiAgentServiceKey) as IAiAgentServiceInternal | undefined;

  // Get current blade descriptor to identify which blade this context belongs to
  const bladeDescriptor = inject(BladeDescriptorKey, null);
  const bladeId = computed(() => bladeDescriptor?.value?.id);

  // If service is not available, nothing to bind
  if (!service) {
    logger.debug("AiAgentService not available, context binding disabled");
    return;
  }

  // Determine context type based on dataRef type
  // Array ref = list blade (multiple selected items)
  // Single object ref = details blade (single item being edited)
  const detectedContextType: AiAgentContextType = isArrayRef(dataRef) ? "list" : "details";

  // Set context data in service (items, contextType, and suggestions)
  // Always sends an array to the service, normalizing single objects
  // Context is bound to specific blade ID
  const updateContextData = () => {
    const raw = normalizeToArray(dataRef.value);
    const items =
      detectedContextType === "details"
        ? raw.map((item) => ({ ...item }))
        : raw.map((item) => ({ id: item.id, objectType: item.objectType, name: item.name }));
    service._setContextData(items, detectedContextType, suggestions, bladeId.value);
    logger.debug(`Context updated: ${items.length} items, type: ${detectedContextType}, blade: ${bladeId.value}`);
  };

  // Watch dataRef for changes and update context
  const stopWatch = watch(dataRef, updateContextData, { deep: true, immediate: true });

  // Cleanup on unmount
  onUnmounted(() => {
    stopWatch();
    // Clear context for this specific blade when component unmounts
    service._setContextData([], "list", undefined, bladeId.value);
    logger.debug(`Context cleared on unmount for blade: ${bladeId.value}`);
  });
}
