import { shallowRef, Component, ref, markRaw, ShallowRef, Ref } from "vue";

export interface ToolbarBus {
  content: ShallowRef<Component | null>;
  metadata: Ref<Record<string, unknown>>;
  setContent: (content: Component | null, meta?: Record<string, unknown>) => void;
  clearContent: () => void;
  hasContent: () => boolean;
}

export function createToolbarBus(): ToolbarBus {
  const content = shallowRef<Component | null>(null);
  const metadata = ref<Record<string, unknown>>({});

  const setContent = (newContent: Component | null, meta: Record<string, unknown> = {}) => {
    content.value = newContent ? markRaw(newContent) : null;
    metadata.value = meta;
  };

  const clearContent = () => {
    content.value = null;
    metadata.value = {};
  };

  const hasContent = () => content.value !== null;

  return {
    content,
    metadata,
    setContent,
    clearContent,
    hasContent,
  };
}
