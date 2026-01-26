import { useLocalStorage } from "@vueuse/core";
import { ref, onScopeDispose } from "vue";

const STORAGE_KEY_PREFIX = "VC_APP_MENU_EXPANDED";
const HOVER_DELAY = 200;

const isHoverExpanded = ref(false);

/**
 * Get unique storage key for current application based on URL path
 * This ensures each application has its own menu state
 */
function getStorageKey(): string {
  // Extract app name from pathname (e.g., "/vendor-portal/" -> "vendor-portal")
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const appName = pathSegments[pathSegments.length - 1] || "default";
  return `${STORAGE_KEY_PREFIX}_${appName}`;
}

export const useMenuExpanded = () => {
  const isExpanded = useLocalStorage(getStorageKey(), true);

  let expandTimeout: ReturnType<typeof setTimeout> | null = null;

  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
  };

  const toggleHoverExpanded = (shouldExpand?: boolean) => {
    if (expandTimeout) {
      clearTimeout(expandTimeout);
    }

    if (shouldExpand) {
      expandTimeout = setTimeout(() => {
        if (isHoverExpanded.value !== shouldExpand) {
          isHoverExpanded.value = shouldExpand;
        }
      }, HOVER_DELAY);
    } else if (shouldExpand === false) {
      isHoverExpanded.value = shouldExpand;
    }
  };

  /**
   * Cleanup timeout when the effect scope is disposed
   * This prevents memory leaks when component using this composable is unmounted
   */
  const cleanup = () => {
    if (expandTimeout) {
      clearTimeout(expandTimeout);
      expandTimeout = null;
    }
  };

  // Register cleanup function to be called when effect scope is disposed
  onScopeDispose(cleanup);

  return {
    isExpanded,
    toggleExpanded,
    isHoverExpanded,
    toggleHoverExpanded,
  };
};
