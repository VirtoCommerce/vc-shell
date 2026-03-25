import { ref, provide, inject, InjectionKey, Ref } from "vue";

interface TableSwipeContext {
  activeSwipeId: Ref<string | null>;
  setActiveSwipe: (id: string | null) => void;
}

const TableSwipeKey = Symbol() as InjectionKey<TableSwipeContext>;

export function provideTableSwipe() {
  const activeSwipeId = ref<string | null>(null);

  function setActiveSwipe(id: string | null) {
    activeSwipeId.value = id;
  }

  const context = {
    activeSwipeId,
    setActiveSwipe,
  };

  provide(TableSwipeKey, context);
  return context;
}

export function useTableSwipe() {
  const context = inject(TableSwipeKey);
  if (!context) {
    throw new Error("useTableSwipe must be used within a provider");
  }
  return context;
}
