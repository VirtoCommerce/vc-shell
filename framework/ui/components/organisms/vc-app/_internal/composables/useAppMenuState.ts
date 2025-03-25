import { ref, reactive, readonly, computed, MaybeRef, ComputedRef, inject, InjectionKey, provide, Ref } from "vue";
import { useMenuExpanded } from "../../../../../../shared/composables/useMenuExpanded";

export interface AppMenuState {
  isSidebarExpanded: MaybeRef<boolean>;
  isMenuOpen: boolean;
  activeButtonId: string | null;
}

export interface AppMenuStateReturn {
  state: ComputedRef<Readonly<AppMenuState>>;
  isButtonActive: ComputedRef<(buttonId: string) => boolean>;
  toggleSidebar: () => void;
  toggleMenu: () => void;
  setActiveButton: (buttonId: string | null) => void;
  toggleHoverExpanded: (shouldExpand?: boolean) => void;
  isHoverExpanded: Ref<boolean>;
  closeAll: () => void;
}

// Key for injection
export const AppMenuStateKey: InjectionKey<AppMenuStateReturn> = Symbol("AppMenuState");

// Private state storage for singleton
let _instance: AppMenuStateReturn | null = null;

export const useAppMenuState = (): AppMenuStateReturn => {
  // Check if an instance already exists for singleton pattern
  if (_instance) {
    return _instance;
  }

  // Try to get instance through inject
  const injected = inject(AppMenuStateKey, null);
  if (injected) {
    return injected;
  }

  const { isExpanded, toggleExpanded, isHoverExpanded, toggleHoverExpanded: toggleHoverExpandedFn } = useMenuExpanded();

  // Use reactive for better performance with objects
  const stateData = reactive<AppMenuState>({
    isSidebarExpanded: isExpanded,
    isMenuOpen: false,
    activeButtonId: null,
  });

  // Wrap in readonly for protection against mutations from outside
  const state = computed(() => readonly(stateData));

  const toggleSidebar = () => {
    toggleExpanded();
    // Synchronize state, since isExpanded is updated in useMenuExpanded
    stateData.isSidebarExpanded = isExpanded.value;
  };

  const toggleHoverExpanded = (shouldExpand?: boolean) => {
    toggleHoverExpandedFn(shouldExpand);
  };

  const toggleMenu = () => {
    stateData.isMenuOpen = !stateData.isMenuOpen;
    if (!stateData.isMenuOpen) {
      stateData.activeButtonId = null;
    }
  };

  const setActiveButton = (buttonId: string | null) => {
    stateData.activeButtonId = buttonId;
  };

  const isButtonActive = computed(() => (buttonId: string) => stateData.activeButtonId === buttonId);

  const closeAll = () => {
    stateData.isMenuOpen = false;
    stateData.activeButtonId = null;
  };

  const instance: AppMenuStateReturn = {
    state,
    isButtonActive,
    toggleSidebar,
    toggleMenu,
    setActiveButton,
    toggleHoverExpanded,
    isHoverExpanded,
    closeAll,
  };

  // Save instance for singleton pattern
  _instance = instance;

  // Provide state through provide for dependency injection
  provide(AppMenuStateKey, instance);

  return instance;
};
