import { ref, readonly, computed, MaybeRef } from "vue";
import { useMenuExpanded } from "../../../../../../shared/composables/useMenuExpanded";

export interface AppMenuState {
  isSidebarExpanded: MaybeRef<boolean>;
  isMenuOpen: boolean;
  activeButtonId: string | null;
}

const {
  isExpanded: isSidebarExpanded,
  toggleExpanded: toggleSidebarExpanded,
  isHoverExpanded,
  toggleHoverExpanded: toggleHoverExpandedFn,
} = useMenuExpanded();

const state = ref<AppMenuState>({
  isSidebarExpanded,
  isMenuOpen: false,
  activeButtonId: null,
});

export const useAppMenuState = () => {
  const toggleSidebar = () => {
    toggleSidebarExpanded();
  };

  const toggleHoverExpanded = (shouldExpand?: boolean) => {
    toggleHoverExpandedFn(shouldExpand);
  };

  const toggleMenu = () => {
    state.value.isMenuOpen = !state.value.isMenuOpen;
    if (!state.value.isMenuOpen) {
      state.value.activeButtonId = null;
    }
  };

  const setActiveButton = (buttonId: string | null) => {
    state.value.activeButtonId = buttonId;
  };

  const isButtonActive = computed(() => (buttonId: string) => state.value.activeButtonId === buttonId);

  const closeAll = () => {
    state.value.isMenuOpen = false;
    state.value.activeButtonId = null;
  };

  return {
    state: readonly(state),
    isButtonActive,
    toggleSidebar,
    toggleMenu,
    setActiveButton,
    toggleHoverExpanded,
    isHoverExpanded,
    closeAll,
  };
};
