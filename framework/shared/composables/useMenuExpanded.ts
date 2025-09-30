import { useLocalStorage } from "@vueuse/core";
import { ref } from "vue";

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
  const appName = pathSegments[0] || "default";
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

  return {
    isExpanded,
    toggleExpanded,
    isHoverExpanded,
    toggleHoverExpanded,
  };
};
