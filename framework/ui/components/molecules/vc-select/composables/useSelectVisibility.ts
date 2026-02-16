import { ref, onMounted, onUnmounted } from "vue";

export function useSelectVisibility() {
  const selectRootRef = ref<HTMLDivElement | null>(null);
  const isSelectVisible = ref(false);

  let rootVisibilityObserver: IntersectionObserver | null = null;

  function checkVisibilityFallback() {
    if (selectRootRef.value && !isSelectVisible.value) {
      const rect = selectRootRef.value.getBoundingClientRect();
      const isVisible =
        rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
      if (isVisible) {
        isSelectVisible.value = true;
      }
    }
  }

  function ensureVisibility() {
    if (!isSelectVisible.value && selectRootRef.value) {
      const rect = selectRootRef.value.getBoundingClientRect();
      const isVisible =
        rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
      if (isVisible) {
        isSelectVisible.value = true;
      }
    }
  }

  onMounted(() => {
    if (selectRootRef.value) {
      rootVisibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isSelectVisible.value = entry.isIntersecting;
        },
        { threshold: 0.1 },
      );
      rootVisibilityObserver.observe(selectRootRef.value);

      // Fallback for iframe: check visibility after a delay
      setTimeout(checkVisibilityFallback, 100);
    }
  });

  onUnmounted(() => {
    if (rootVisibilityObserver && selectRootRef.value) {
      rootVisibilityObserver.unobserve(selectRootRef.value);
    }
    if (rootVisibilityObserver) {
      rootVisibilityObserver.disconnect();
    }
  });

  return {
    selectRootRef,
    isSelectVisible,
    ensureVisibility,
  };
}
