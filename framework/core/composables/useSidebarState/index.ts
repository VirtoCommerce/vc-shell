import { ref, computed, provide, inject } from "vue";
import type { Ref, ComputedRef, InjectionKey } from "vue";
import { useMenuExpanded } from "@shared/composables";

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

export type SidebarStateReturn = SidebarState & SidebarActions;

const SIDEBAR_STATE_KEY: InjectionKey<SidebarStateReturn> = Symbol("SidebarState");

/**
 * Provides sidebar state to the component tree. Must be called once in VcApp setup.
 * Idempotent: returns existing instance if already provided in the current tree.
 * Internally delegates to useMenuExpanded() for shared reactive state,
 * ensuring UserDropdownButton (which uses useMenuExpanded directly) stays in sync.
 */
export function provideSidebarState(): SidebarStateReturn {
  const existing = inject(SIDEBAR_STATE_KEY, null);
  if (existing) return existing;

  // Delegate to shared useMenuExpanded composable for reactive state sync
  const {
    isExpanded: isPinned,
    isHoverExpanded,
    toggleExpanded: togglePin,
    toggleHoverExpanded,
  } = useMenuExpanded();

  const isMenuOpen = ref(false);

  const isExpanded = computed(() => isPinned.value || isHoverExpanded.value);

  const setHoverExpanded = (value: boolean) => {
    toggleHoverExpanded(value);
  };

  const openMenu = () => {
    isMenuOpen.value = true;
  };

  const closeMenu = () => {
    isMenuOpen.value = false;
  };

  const instance: SidebarStateReturn = {
    isPinned,
    isHoverExpanded,
    isMenuOpen,
    isExpanded,
    togglePin,
    setHoverExpanded,
    openMenu,
    closeMenu,
  };

  provide(SIDEBAR_STATE_KEY, instance);
  return instance;
}

/**
 * Access sidebar state from any descendant of VcApp.
 * Throws if called outside the VcApp component tree.
 */
export function useSidebarState(): SidebarStateReturn {
  const injected = inject(SIDEBAR_STATE_KEY);
  if (!injected) {
    throw new Error("useSidebarState() requires provideSidebarState() in a parent component");
  }
  return injected;
}
