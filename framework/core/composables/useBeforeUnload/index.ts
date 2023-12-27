import { onBeforeMount, onBeforeUnmount, unref, ComputedRef } from "vue";

export const useBeforeUnload = (modified: ComputedRef<boolean>) => {
  onBeforeMount(() => {
    window.addEventListener("beforeunload", preventUnload);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("beforeunload", preventUnload);
  });

  function preventUnload(event: Event) {
    if (!unref(modified)) return;
    event.preventDefault();
  }

  return {
    modified,
  };
};
