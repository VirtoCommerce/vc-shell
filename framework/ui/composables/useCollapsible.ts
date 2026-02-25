import { ref, computed, watch, type Ref, type CSSProperties } from "vue";
import { useResizeObserver } from "@vueuse/core";

export interface UseCollapsibleOptions {
  /** Height in px when collapsed. Default: 0 (fully hidden) */
  collapsedHeight?: number;
  /** Max height in px when expanded. Undefined = no limit */
  maxExpandedHeight?: number;
  /** Initial expanded state. Default: false */
  expanded?: boolean;
}

export interface UseCollapsibleReturn {
  /** Template ref — attach to the inner content element */
  contentRef: Ref<HTMLElement | undefined>;
  /** Whether the panel is currently expanded */
  isExpanded: Ref<boolean>;
  /** True when content overflows the collapsed height (i.e. expand is meaningful) */
  hasOverflow: Readonly<Ref<boolean>>;
  /** True when expanded content exceeds maxExpandedHeight (needs scroll) */
  hasScroll: Readonly<Ref<boolean>>;
  /** Bind to the wrapper element's :style */
  wrapperStyle: Readonly<Ref<CSSProperties>>;
  /** Measured content height in px */
  contentHeight: Readonly<Ref<number>>;
  /** Toggle expanded state */
  toggle: () => void;
}

export function useCollapsible(options: UseCollapsibleOptions = {}): UseCollapsibleReturn {
  const collapsedHeight = options.collapsedHeight ?? 0;
  const maxExpandedHeight = options.maxExpandedHeight;

  const contentRef = ref<HTMLElement>();
  const contentHeight = ref(0);
  const isExpanded = ref(options.expanded ?? false);

  const hasOverflow = computed(() => contentHeight.value > collapsedHeight);

  const hasScroll = computed(
    () => maxExpandedHeight !== undefined && contentHeight.value > maxExpandedHeight,
  );

  const wrapperStyle = computed<CSSProperties>(() => {
    if (isExpanded.value) {
      if (maxExpandedHeight !== undefined && contentHeight.value > maxExpandedHeight) {
        return { maxHeight: `${maxExpandedHeight}px` };
      }
      return { maxHeight: `${contentHeight.value}px` };
    }
    return { maxHeight: collapsedHeight > 0 ? `${collapsedHeight}px` : "0px" };
  });

  function toggle() {
    isExpanded.value = !isExpanded.value;
  }

  useResizeObserver(contentRef, () => {
    if (contentRef.value) {
      contentHeight.value = contentRef.value.scrollHeight;
    }
  });

  return {
    contentRef,
    isExpanded,
    hasOverflow,
    hasScroll,
    wrapperStyle,
    contentHeight,
    toggle,
  };
}
