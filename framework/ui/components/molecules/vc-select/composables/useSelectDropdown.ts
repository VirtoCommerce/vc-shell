import { ref, computed, type Ref, watch } from "vue";
import { offset as uiOffset, flip, shift, type Middleware, type Placement } from "@floating-ui/vue";
import { useFloatingPosition } from "../../../../composables";

type FloatingInstanceType = ReturnType<typeof useFloatingPosition> & {
  middlewareData: Ref<{
    sameWidth?: {
      width?: string;
    };
  }>;
};

interface UseSelectDropdownOptions {
  placement: string;
  outline: () => boolean;
  isSelectVisible: Ref<boolean>;
  selectRootRef: Ref<HTMLElement | null>;
  disabled: () => boolean;
  ensureVisibility: () => void;
}

export function useSelectDropdown(options: UseSelectDropdownOptions) {
  const isOpened = ref(false);
  const isFocused = ref(false);
  const dropdownToggleRef = ref<HTMLElement | null>(null);
  const dropdownRef = ref<HTMLElement | null>(null);

  function sameWidth(): Middleware {
    return {
      name: "sameWidth",
      fn({ rects }) {
        return {
          data: {
            width: options.outline() ? `${rects.reference.width}px` : "max-content",
          },
        };
      },
    };
  }

  const popper = useFloatingPosition(dropdownToggleRef, dropdownRef, {
    placement: computed(() => options.placement as Placement),
    middleware: computed(() => [
      flip({ fallbackPlacements: ["top", "bottom"] }),
      shift({ mainAxis: false }),
      sameWidth(),
      uiOffset({ mainAxis: 4 }),
    ]),
  }) as FloatingInstanceType;

  const dropdownStyle = computed(() => {
    return {
      top: `${popper.y.value ?? 0}px`,
      left: `${popper.x.value ?? 0}px`,
      width: popper.middlewareData.value.sameWidth?.width,
    };
  });

  watch(
    () => popper.isPositioned.value,
    (newVal) => {
      if (newVal) {
        popper.update();
      }
    },
  );

  function toggleDropdown() {
    if (options.disabled()) return;

    // Ensure isSelectVisible is true when opening dropdown (fallback for iframe)
    if (!isOpened.value && !options.isSelectVisible.value) {
      options.ensureVisibility();
    }

    isOpened.value = !isOpened.value;
  }

  return {
    isOpened,
    isFocused,
    dropdownToggleRef,
    dropdownRef,
    popper,
    dropdownStyle,
    toggleDropdown,
  };
}
