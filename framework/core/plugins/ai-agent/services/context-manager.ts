import { ref, computed, type ComputedRef } from "vue";
import { cloneDeep } from "lodash-es";
import { createLogger } from "@core/utilities";
import type {
  AiAgentContextType,
  IAiAgentBladeContext,
  IAiAgentUserContext,
  IChatBladeContext,
  IInitContextPayload,
  IUpdateContextPayload,
  ISuggestion,
} from "@core/plugins/ai-agent/types";

const logger = createLogger("ai-agent-context");

export interface ContextManagerOptions {
  userGetter: () => IAiAgentUserContext | undefined;
  bladeGetter: () => IAiAgentBladeContext | null;
  localeGetter: () => string;
  tokenGetter?: () => Promise<string | null>;
}

export interface ContextManager {
  contextItems: ComputedRef<Record<string, unknown>[]>;
  contextType: ComputedRef<AiAgentContextType>;
  contextSuggestions: ComputedRef<ISuggestion[] | undefined>;
  totalItemsCount: ComputedRef<number>;
  setContextData: (
    items: Record<string, unknown>[],
    type: AiAgentContextType,
    suggestions?: ISuggestion[],
    bladeId?: string,
  ) => { cleared: boolean };
  buildInitPayload: () => Promise<IInitContextPayload>;
  buildUpdatePayload: () => Promise<IUpdateContextPayload>;
}

function toBladeContext(blade: IAiAgentBladeContext | null): IChatBladeContext {
  if (!blade) {
    return { id: "unknown", name: "unknown", title: "Unknown" };
  }
  return {
    id: blade.id,
    name: blade.name,
    title: blade.title || blade.name,
    param: blade.param,
  };
}

export function createContextManager(options: ContextManagerOptions): ContextManager {
  const { userGetter, bladeGetter, localeGetter, tokenGetter } = options;

  const bladeContexts = ref<
    Map<string, { items: Record<string, unknown>[]; type: AiAgentContextType; suggestions?: ISuggestion[] }>
  >(new Map());

  const getActiveBladeContext = () => {
    const activeBlade = bladeGetter();
    if (!activeBlade)
      return {
        items: [] as Record<string, unknown>[],
        type: "list" as AiAgentContextType,
        suggestions: undefined,
      };
    return (
      bladeContexts.value.get(activeBlade.id) ?? {
        items: [] as Record<string, unknown>[],
        type: "list" as AiAgentContextType,
        suggestions: undefined,
      }
    );
  };

  const contextItems = computed(() => getActiveBladeContext().items);
  const contextType = computed(() => getActiveBladeContext().type);
  const contextSuggestions = computed(() => getActiveBladeContext().suggestions);
  const totalItemsCount = computed(() => contextItems.value.length);

  const setContextData = (
    items: Record<string, unknown>[],
    type: AiAgentContextType,
    suggestions?: ISuggestion[],
    bladeId?: string,
  ): { cleared: boolean } => {
    // Always use bladeGetter().id as the Map key — it returns blade.type.name (e.g. "offerslist"),
    // which matches getActiveBladeContext() lookup. bladeId from BladeDescriptorKey is a runtime
    // unique ID (e.g. "blade_1_abc") that would cause a key mismatch.
    const targetBladeId = bladeGetter()?.id || bladeId;
    if (!targetBladeId) {
      logger.warn("Cannot set context data: no blade id available");
      return { cleared: false };
    }

    if (items.length === 0 && !suggestions) {
      bladeContexts.value.delete(targetBladeId);
      logger.debug(`Context cleared for blade: ${targetBladeId}`);
      return { cleared: true };
    } else {
      bladeContexts.value.set(targetBladeId, { items, type, suggestions });
      logger.debug(`Context set for blade: ${targetBladeId}, items: ${items.length}, type: ${type}`);
      return { cleared: false };
    }
  };

  const buildInitPayload = async (): Promise<IInitContextPayload> => {
    const accessToken = tokenGetter ? ((await tokenGetter()) ?? undefined) : undefined;
    return {
      userId: userGetter()?.id || "",
      locale: localeGetter(),
      blade: toBladeContext(bladeGetter()),
      contextType: contextType.value,
      items: cloneDeep(contextItems.value),
      suggestions: contextSuggestions.value ? cloneDeep(contextSuggestions.value) : undefined,
      accessToken,
    };
  };

  const buildUpdatePayload = async (): Promise<IUpdateContextPayload> => {
    const accessToken = tokenGetter ? ((await tokenGetter()) ?? undefined) : undefined;
    return {
      blade: toBladeContext(bladeGetter()),
      contextType: contextType.value,
      items: cloneDeep(contextItems.value),
      suggestions: contextSuggestions.value ? cloneDeep(contextSuggestions.value) : undefined,
      locale: localeGetter(),
      accessToken,
    };
  };

  return {
    contextItems,
    contextType,
    contextSuggestions,
    totalItemsCount,
    setContextData,
    buildInitPayload,
    buildUpdatePayload,
  };
}
