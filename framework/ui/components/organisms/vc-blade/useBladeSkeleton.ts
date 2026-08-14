import { computed, ref, watch, type ComputedRef } from "vue";

/**
 * Decides when a blade may replace its content with skeletons.
 *
 * A skeleton stands in for content that has not rendered yet. Once the blade has
 * shown its real content, `loading` means something is in flight — a save, a
 * delete — and swapping the controls out then unmounts whatever the user has
 * focused, dropping focus to `<body>` (WCAG 2.4.3 Focus Order). It also takes
 * the field they were typing in out from under them.
 *
 * So the skeleton is available exactly once, before the first render of real
 * content. After that `loading` is reported through `aria-busy` and each
 * control's own pending state instead.
 */
export function useBladeSkeleton(isLoading: () => boolean): ComputedRef<boolean> {
  const hasRenderedContent = ref(false);

  watch(
    isLoading,
    (loading) => {
      if (!loading) hasRenderedContent.value = true;
    },
    { immediate: true },
  );

  return computed(() => isLoading() && !hasRenderedContent.value);
}
