import { ref, watch } from "vue";
import { useAppBarMobileButtons } from "../../../../../../../core/composables/useAppBarMobileButtons";
import { useToggleableContent } from "./useToggleableContent";

// Store only ID of the active action
const activeActionId = ref<string | null>(null);

export function useAppBarMobileActions() {
  const { getButtons } = useAppBarMobileButtons();

  // Use the common composable to manage content
  const {
    showItem: showAction,
    hideAllItems: hideAllActions,
    toggleItem: toggleAction,
    currentItem: currentAction,
    isAnyItemVisible: isAnyActionVisible,
    closeItem: closeAction,
  } = useToggleableContent(getButtons, activeActionId);

  // Watch for changes in the list of buttons
  watch(
    () => getButtons.value,
    (newButtons) => {
      // If the active button exists
      if (activeActionId.value) {
        // Check if this button still exists in the list
        const buttonStillExists = newButtons.some((button) => button.id === activeActionId.value);

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
