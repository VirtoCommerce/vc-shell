import { useLocalStorage } from "@vueuse/core";

const STORAGE_KEY = "VC_APP_MENU_EXPANDED";

export const useMenuExpanded = () => {
  const isExpanded = useLocalStorage(STORAGE_KEY, true);

  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
  };

  return {
    isExpanded,
    toggleExpanded,
  };
};
