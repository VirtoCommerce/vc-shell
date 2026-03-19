import { describe, it, expect, vi } from "vitest";
import { useMultivalueColor } from "./useMultivalueColor";

interface TestItem {
  label: string;
  colorCode?: string;
}

describe("useMultivalueColor", () => {
  it("setColorPickerRef adds element to map", () => {
    const result = useMultivalueColor<TestItem>({
      modelValue: () => [],
      emit: { updateModelValue: vi.fn() },
    });

    const el = document.createElement("input");
    result.setColorPickerRef(el, 0);

    expect(result.colorPickerRefs.value.get(0)).toBe(el);
  });

  it("setColorPickerRef removes element when null", () => {
    const result = useMultivalueColor<TestItem>({
      modelValue: () => [],
      emit: { updateModelValue: vi.fn() },
    });

    const el = document.createElement("input");
    result.setColorPickerRef(el, 0);
    result.setColorPickerRef(null, 0);

    expect(result.colorPickerRefs.value.has(0)).toBe(false);
  });

  it("openColorPicker clicks the input at given index", () => {
    const result = useMultivalueColor<TestItem>({
      modelValue: () => [],
      emit: { updateModelValue: vi.fn() },
    });

    const el = document.createElement("input");
    el.click = vi.fn();
    result.setColorPickerRef(el, 2);

    result.openColorPicker(2);
    expect(el.click).toHaveBeenCalled();
  });

  it("openColorPicker does nothing for missing index", () => {
    const result = useMultivalueColor<TestItem>({
      modelValue: () => [],
      emit: { updateModelValue: vi.fn() },
    });

    // Should not throw
    result.openColorPicker(99);
  });

  it("handleColorChange updates colorCode on the item", () => {
    const updateModelValue = vi.fn();
    const items: TestItem[] = [
      { label: "Red", colorCode: "#ff0000" },
      { label: "Blue", colorCode: "#0000ff" },
    ];

    const result = useMultivalueColor<TestItem>({
      modelValue: () => items,
      emit: { updateModelValue },
    });

    const event = { target: { value: "#00ff00" } } as unknown as Event;
    result.handleColorChange(event, 0);

    expect(updateModelValue).toHaveBeenCalledWith([
      { label: "Red", colorCode: "#00ff00" },
      { label: "Blue", colorCode: "#0000ff" },
    ]);
  });

  it("handleColorChange does nothing when target value is empty", () => {
    const updateModelValue = vi.fn();
    const result = useMultivalueColor<TestItem>({
      modelValue: () => [{ label: "Red" }],
      emit: { updateModelValue },
    });

    const event = { target: { value: "" } } as unknown as Event;
    result.handleColorChange(event, 0);

    expect(updateModelValue).not.toHaveBeenCalled();
  });
});
