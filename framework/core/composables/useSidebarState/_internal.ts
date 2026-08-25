import { ref, computed, onScopeDispose } from "vue";
import type { Ref, ComputedRef } from "vue";
import { useLocalStorage } from "@vueuse/core";

export interface SidebarState {
  /** Sidebar is pinned open by user (persisted to localStorage) */
  isPinned: Ref<boolean>;
  /** Sidebar is temporarily expanded on mouse hover (desktop only) */
  isHoverExpanded: Ref<boolean>;
  /** Mobile menu overlay is visible */
  isMenuOpen: Ref<boolean>;
  /** Derived: sidebar content should render in expanded mode (pinned OR hovered) */
  isExpanded: ComputedRef<boolean>;
}

export interface SidebarActions {
  /** Toggle the pinned state (persists to localStorage) */
  togglePin: () => void;
  /** Set hover expansion state with delay for opening */
  setHoverExpanded: (value: boolean) => void;
  /** Open the mobile menu / widget overlay */
  openMenu: () => void;
  /** Close the mobile menu / widget overlay */
  closeMenu: () => void;
}

export type UseSidebarStateReturn = SidebarState & SidebarActions;

/** @deprecated Use UseSidebarStateReturn instead */
export type SidebarStateReturn = UseSidebarStateReturn;

const STORAGE_KEY_PREFIX = "VC_APP_MENU_EXPANDED";
const HOVER_DELAY = 200;

/**
 * localStorage key holding the pinned state, scoped per application.
 * The app name defaults to the first segment of `window.location.pathname`
 * ("/vendor-portal/" -> "vendor-portal"), so several vc-shell apps on one
 * domain keep independent sidebar states.
 */
export function sidebarStorageKey(appName?: string): string {
  const resolved = appName || window.location.pathname.split("/").filter(Boolean)[0] || "default";
  return `${STORAGE_KEY_PREFIX}_${resolved}`;
}

/**
 * Builds a standalone sidebar state instance. Not provided, not shared:
 * `provideSidebarState()` owns the one instance the component tree sees.
 */
export function createSidebarStateInstance(): UseSidebarStateReturn {
  const isPinned = useLocalStorage(sidebarStorageKey(), true);
  const isHoverExpanded = ref(false);
  const isMenuOpen = ref(false);

  const isExpanded = computed(() => isPinned.value || isHoverExpanded.value);

  let expandTimeout: ReturnType<typeof setTimeout> | null = null;

  const togglePin = () => {
    isPinned.value = !isPinned.value;
  };

  // Opening is debounced so a cursor brushing the rail does not flash it open;
  // closing is immediate. `undefined` is a defensive no-op; the public type requires a boolean.
  const setHoverExpanded = (value?: boolean) => {
    if (expandTimeout) {
      clearTimeout(expandTimeout);
      expandTimeout = null;
    }

    if (value) {
      expandTimeout = setTimeout(() => {
        if (isHoverExpanded.value !== value) {
          isHoverExpanded.value = value;
        }
      }, HOVER_DELAY);
    } else if (value === false) {
      isHoverExpanded.value = value;
    }
  };

  // Drop a pending hover timeout when the owning effect scope goes away.
  onScopeDispose(() => {
    if (expandTimeout) {
      clearTimeout(expandTimeout);
      expandTimeout = null;
    }
  });

  const openMenu = () => {
    isMenuOpen.value = true;
  };

  const closeMenu = () => {
    isMenuOpen.value = false;
  };

  return {
    isPinned,
    isHoverExpanded,
    isMenuOpen,
    isExpanded,
    togglePin,
    setHoverExpanded,
    openMenu,
    closeMenu,
  };
}
