import { onBeforeMount, onBeforeUnmount, unref, ComputedRef } from "vue";

/**
 * Prevents the user from closing the tab if the modified flag is set to true.
 * @param modified - The flag that indicates whether the user has made changes.
 * @returns The modified flag.
 */
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
