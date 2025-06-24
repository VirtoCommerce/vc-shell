import { ref } from "vue";
import { useAppBarWidget } from "../../../../../../../core/composables";
import { useToggleableContent } from "./useToggleableContent";

// Store only the ID of the active widget outside the function
const activeWidgetId = ref<string | null>(null);

export function useAppBarWidgets() {
  const { items } = useAppBarWidget();

  // Use the common composable to manage content
  const {
    showItem: showWidget,
    hideAllItems: hideAllWidgets,
    toggleItem: toggleWidget,
    currentItem: currentWidget,
    isAnyItemVisible: isAnyWidgetVisible,
  } = useToggleableContent(items, activeWidgetId);

  return {
    showWidget,
    hideAllWidgets,
    toggleWidget,
    currentWidget,
    isAnyWidgetVisible,
  };
}
