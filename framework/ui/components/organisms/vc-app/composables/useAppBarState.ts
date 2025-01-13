import { reactive, computed, inject, ComputedRef, InjectionKey, provide } from "vue";
import { useLocalStorage } from "@vueuse/core";

export interface AppBarState {
  // Is dropdown open (for mobile view)
  isDropdownOpen: boolean;
  // Is sidebar expanded (for desktop view)
  isSidebarExpanded: boolean;
  // Is navigation open (for mobile view)
  isNavigationOpen: boolean;
}

export interface AppBarStateContext {
  state: AppBarState;
  toggleDropdown: () => void;
  toggleSidebar: () => void;
  toggleNavigation: () => void;
  shouldShowContent: ComputedRef<boolean>;
}

export const AppBarStateKey = Symbol("AppBarState") as InjectionKey<AppBarStateContext>;

export function useAppBarStateProvider() {
  const savedSidebarState = useLocalStorage("VC_APP_MENU_EXPANDED", true);

  const isMobile = inject("isMobile") as ComputedRef<boolean>;

  const state = reactive<AppBarState>({
    isDropdownOpen: false,
    isSidebarExpanded: savedSidebarState.value,
    isNavigationOpen: false,
  });

  const toggleDropdown = () => {
    state.isDropdownOpen = !state.isDropdownOpen;

    if (isMobile.value) {
      state.isNavigationOpen = !state.isNavigationOpen;
    }
  };

  const toggleSidebar = () => {
    state.isSidebarExpanded = !state.isSidebarExpanded;
    savedSidebarState.value = state.isSidebarExpanded;
  };

  const toggleNavigation = () => {
    if (isMobile.value) {
      state.isDropdownOpen = !state.isDropdownOpen;
      state.isNavigationOpen = !state.isNavigationOpen;
    }
  };

  const shouldShowContent = computed(() => !isMobile.value);

  const context: AppBarStateContext = {
    state,
    toggleDropdown,
    toggleSidebar,
    toggleNavigation,
    shouldShowContent,
  };

  provide(AppBarStateKey, context);

  return context;
}

export function useAppBarState(): AppBarStateContext {
  const context = inject(AppBarStateKey);

  if (!context) {
    throw new Error("useAppBarState must be used within VcAppBar component tree");
  }

  return context;
}
