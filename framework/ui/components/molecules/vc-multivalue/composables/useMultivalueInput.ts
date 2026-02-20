import { ref } from "vue";
import { convertColorNameToHex } from "@shared/utilities";
import type { MultivalueType } from "@ui/components/molecules/vc-multivalue/composables/useMultivalueMode";

interface UseMultivalueInputOptions<T> {
  type: () => MultivalueType;
  optionLabel: () => string;
  addItem: (item: T) => void;
}

/**
 * Handles manual text input mode (multivalue=false):
 * - Input value state
 * - Enter key to add
 * - Blur to add
 * - Key filtering for number/integer types
 * - Color name → hex conversion for color type
 */
export function useMultivalueInput<T>(options: UseMultivalueInputOptions<T>) {
  const inputValue = ref<string>();

  function onInputSubmit(e: KeyboardEvent | FocusEvent) {
    const newValue = (e.target as HTMLInputElement).value;
    if (newValue === "" || newValue === undefined || newValue === null) {
      return;
    }

    const t = options.type();
    if (t === "color") {
      const hexColor = convertColorNameToHex(newValue);
      options.addItem({
        [options.optionLabel()]: newValue,
        colorCode: hexColor || "#000000",
      } as unknown as T);
    } else {
      options.addItem({ [options.optionLabel()]: newValue } as T);
    }
    inputValue.value = undefined;
  }

  function onKeyDown(e: KeyboardEvent) {
    const key = e.key;
    const t = options.type();
    const allowedKeys = ["Backspace", "Delete", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Tab"];

    if (t === "number" || t === "integer") {
      if (key === "-" || key === "e" || key === "+") {
        e.preventDefault();
      }
    }

    if (t === "integer") {
      if (!/^\d$/.test(key) && !allowedKeys.includes(key)) {
        e.preventDefault();
      }
    }
  }

  return {
    inputValue,
    onInputSubmit,
    onKeyDown,
  };
}
