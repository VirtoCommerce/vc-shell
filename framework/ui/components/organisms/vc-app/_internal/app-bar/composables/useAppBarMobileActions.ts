import { watch } from "vue";
import { useAppBarMobileButtons } from "../../../../../../../core/composables/useAppBarMobileButtons";
import { useToggleableContent } from "./useToggleableContent";
import { useAppBarState } from "./useAppBarState";

export function useAppBarMobileActions() {
  const { getButtons } = useAppBarMobileButtons();
  const { activeMobileActionId } = useAppBarState();

  // Use the common composable to manage content
  const {
    showItem: showAction,
    hideAllItems: hideAllActions,
    toggleItem: toggleAction,
    currentItem: currentAction,
    isAnyItemVisible: isAnyActionVisible,
    closeItem: closeAction,
  } = useToggleableContent(getButtons, activeMobileActionId);

  // Watch for changes in the list of buttons
  watch(
    () => getButtons.value,
    (newButtons) => {
      // If the active button exists
      if (activeMobileActionId.value) {
        // Check if this button still exists in the list
        const buttonStillExists = newButtons.some((button) => button.id === activeMobileActionId.value);

        // If the button was removed - close it
        if (!buttonStillExists) {
          const activeButton = currentAction.value;
          if (activeButton?.onClose) {
            activeButton.onClose();
          }
          hideAllActions();
        }
      }
    },
    { deep: true },
  );

  return {
    showAction,
    hideAllActions,
    toggleAction,
    currentAction,
    isAnyActionVisible,
    closeAction,
  };
}
