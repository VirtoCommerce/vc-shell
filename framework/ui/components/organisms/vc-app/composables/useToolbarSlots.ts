import { useSlots, type Slot, h } from "vue";
import type { IMenuItem } from "../../../../../core/types";
import { ThemeSelector, LanguageSelector } from "../../../../../shared/components";

export function useToolbarSlots() {
  const slots = useSlots();

  const getToolbarMenuItems = (): IMenuItem[] => {
    const menuItems: IMenuItem[] = [];

    const slotConfig = {
      "toolbar:theme-selector": ThemeSelector,
      "toolbar:language-selector": LanguageSelector,
    };

    // Check each slot
    Object.entries(slotConfig).forEach(([slotName, defaultComponent]) => {
      const slot = slots[slotName];
      if (slot) {
        // If the slot exists, use its contents
        menuItems.push({
          component: slot,
        });
      } else {
        menuItems.push({
          component: () => h(defaultComponent),
        });
      }
    });

    return menuItems;
  };

  return {
    getToolbarMenuItems,
  };
}
