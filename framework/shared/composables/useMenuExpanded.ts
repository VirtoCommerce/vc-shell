import { useLocalStorage } from "@vueuse/core";
import { ref } from "vue";

const STORAGE_KEY = "VC_APP_MENU_EXPANDED";
const HOVER_DELAY = 200;

const isHoverExpanded = ref(false);

export const useMenuExpanded = () => {
  const isExpanded = useLocalStorage(STORAGE_KEY, true);

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
