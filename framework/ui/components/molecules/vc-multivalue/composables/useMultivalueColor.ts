import { ref } from "vue";

interface UseMultivalueColorOptions<T> {
  modelValue: () => T[];
  emit: {
    updateModelValue: (val: T[]) => void;
  };
}

/**
 * Manages color picker logic for color-type multivalue:
 * - Stores refs to hidden <input type="color"> elements
 * - Opens native color picker on color square click
 * - Updates colorCode on color change
 */
export function useMultivalueColor<T>(options: UseMultivalueColorOptions<T>) {
  const colorPickerRefs = ref<Map<number, HTMLInputElement>>(new Map());

  function setColorPickerRef(el: HTMLInputElement | null, index: number) {
    if (el) {
      colorPickerRefs.value.set(index, el);
    } else {
      colorPickerRefs.value.delete(index);
    }
  }

  function openColorPicker(index: number) {
    const picker = colorPickerRefs.value.get(index);
    picker?.click();
  }

  function handleColorChange(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    if (target?.value) {
      const updatedValues = [...options.modelValue()];
      updatedValues[index] = {
        ...updatedValues[index],
        colorCode: target.value,
      };
      options.emit.updateModelValue(updatedValues);
    }
  }

  return {
    colorPickerRefs,
    setColorPickerRef,
    openColorPicker,
    handleColorChange,
  };
}
