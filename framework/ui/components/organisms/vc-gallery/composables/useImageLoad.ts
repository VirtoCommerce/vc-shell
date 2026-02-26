import { ref, watch, MaybeRef, toValue } from "vue";

export function useImageLoad(src: MaybeRef<string | undefined>) {
  const isLoaded = ref(false);
  const hasError = ref(false);

  function onLoad() {
    isLoaded.value = true;
    hasError.value = false;
  }

  function onError() {
    hasError.value = true;
    isLoaded.value = false;
  }

  watch(
    () => toValue(src),
    () => {
      isLoaded.value = false;
      hasError.value = false;
    },
  );

  return { isLoaded, hasError, onLoad, onError };
}
