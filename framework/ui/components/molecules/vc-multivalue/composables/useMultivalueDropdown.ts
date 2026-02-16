import { ref, computed, watch, nextTick, type Ref } from "vue";
import { offset, flip, shift, type Middleware } from "@floating-ui/vue";
import { useKeyboardNavigation } from "../../../../../core/composables/useKeyboardNavigation";
import { useFloatingPosition } from "../../../../composables";

type FloatingInstanceType = ReturnType<typeof useFloatingPosition> & {
  middlewareData: Ref<{
    sameWidth?: {
      width?: string;
    };
  }>;
};

interface UseMultivalueDropdownOptions {
  disabled: () => boolean;
  onItemSelect: (index: number) => void;
  emit: {
    close: () => void;
  };
}

/**
 * Manages dropdown visibility, Floating UI positioning, and keyboard navigation.
 * Mirrors the pattern from useSelectDropdown.
 */
export function useMultivalueDropdown(options: UseMultivalueDropdownOptions) {
  const isOpened = ref(false);
  const isFocused = ref(false);
  const dropdownToggleRef = ref<HTMLElement | null>(null);
  const dropdownRef = ref<HTMLElement | null>(null);
  const searchRef = ref<HTMLInputElement | null>(null);

  function sameWidth(): Middleware {
    return {
      name: "sameWidth",
      fn({ rects }) {
        return {
          data: {
            width: `${rects.reference.width}px`,
          },
        };
      },
    };
  }

  const popper = useFloatingPosition(dropdownToggleRef, dropdownRef, {
    placement: "bottom",
    middleware: computed(() => [
      flip({ fallbackPlacements: ["top", "bottom"] }),
      shift({ mainAxis: false }),
      sameWidth(),
      offset({ mainAxis: 4 }),
    ]),
  }) as FloatingInstanceType;

  const dropdownStyle = computed(() => ({
    top: `${popper.y.value ?? 0}px`,
    left: `${popper.x.value ?? 0}px`,
    width: popper.middlewareData.value.sameWidth?.width,
  }));

  // Ensure dropdown repositions correctly after initial placement
  watch(
    () => popper.isPositioned.value,
    (newVal) => {
      if (newVal) {
        popper.update();
      }
    },
  );

  const keyboardNavigation = useKeyboardNavigation({
    onEnter: (element: HTMLElement) => {
      const index = parseInt(element.getAttribute("data-index") || "0", 10);
      options.onItemSelect(index);
    },
    onEscape: () => {
      closeDropdown();
    },
  });

  function openDropdown() {
    if (options.disabled()) return;

    isOpened.value = true;
    isFocused.value = true;

    nextTick(() => {
      if (dropdownRef.value) {
        keyboardNavigation.initKeyboardNavigation(dropdownRef.value);
        searchRef.value?.focus();
      }
    });
  }

  function closeDropdown() {
    isOpened.value = false;
    isFocused.value = false;
    keyboardNavigation.cleanupKeyboardNavigation();
    options.emit.close();
  }

  function toggleDropdown() {
    if (isOpened.value) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  return {
    isOpened,
    isFocused,
    dropdownToggleRef,
    dropdownRef,
    searchRef,
    popper,
    dropdownStyle,
    toggleDropdown,
    openDropdown,
    closeDropdown,
  };
}
