import { useAppBarWidget } from "@core/composables";
import { useToggleableContent } from "@ui/components/organisms/vc-app/_internal/app-bar/composables/useToggleableContent";
import { useAppBarState } from "@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarState";

export function useAppBarWidgets() {
  const { items } = useAppBarWidget();
  const { activeWidgetId } = useAppBarState();

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
