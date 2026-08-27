import { computed, getCurrentInstance, nextTick, onMounted, ref, watch, type ComputedRef } from "vue";

/**
 * Decides when a blade may replace its content with skeletons.
 *
 * A skeleton stands in for content that has not rendered yet. Once the blade has
 * shown its real content, `loading` means something is in flight — a save, a
 * delete — and swapping the controls out then unmounts whatever the user has
 * focused, dropping focus to `<body>` (WCAG 2.4.3 Focus Order). It also takes
 * the field they were typing in out from under them.
 *
 * So the skeleton is available once per entity context, before its first render
 * of real content. Later `loading` for that entity is reported through
 * `aria-busy` and each control's own pending state instead.
 */
export function useBladeSkeleton(
  isLoading: () => boolean,
  contextKey: () => unknown = () => undefined,
): ComputedRef<boolean> {
  const hasRenderedContent = ref(false);
  let armed = false;

  function arm() {
    armed = true;
    if (!isLoading()) hasRenderedContent.value = true;
  }

  watch(
    [isLoading, contextKey],
    ([loading, context], previous) => {
      if (previous.length > 0 && context !== previous[1]) {
        hasRenderedContent.value = false;
      }
      if (!loading && armed) hasRenderedContent.value = true;
    },
    { immediate: true },
  );

  // Not armed during setup. `loading` is false at that point for every blade —
  // the fetch starts in the parent page's onMounted, and a child finishes setup
  // before the parent's hook runs — so latching there would record "content has
  // shown" before anything was even requested, and the skeleton could never
  // appear. nextTick pushes arming past the parent's onMounted; this component's
  // own hook alone is still too early.
  if (getCurrentInstance()) {
    onMounted(() => void nextTick(arm));
  } else {
    void nextTick(arm);
  }

  return computed(() => isLoading() && !hasRenderedContent.value);
}
