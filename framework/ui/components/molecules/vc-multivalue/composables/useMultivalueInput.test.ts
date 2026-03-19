import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMultivalueInput } from "./useMultivalueInput";

// Mock convertColorNameToHex
vi.mock("@core/utilities", () => ({
  convertColorNameToHex: vi.fn((name: string) => {
    const colors: Record<string, string> = { red: "#ff0000", blue: "#0000ff" };
    return colors[name.toLowerCase()] || null;
  }),
}));

describe("useMultivalueInput", () => {
  let addItem: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addItem = vi.fn();
  });

  it("initializes inputValue as undefined", () => {
    const result = useMultivalueInput({
      type: () => "text",
      optionLabel: () => "label",
      addItem,
    });

    expect(result.inputValue.value).toBeUndefined();
  });

  it("onInputSubmit adds a text item", () => {
    const result = useMultivalueInput({
      type: () => "text",
      optionLabel: () => "label",
      addItem,
    });

    const event = { target: { value: "hello" } } as unknown as KeyboardEvent;
    result.onInputSubmit(event);

    expect(addItem).toHaveBeenCalledWith({ label: "hello" });
    expect(result.inputValue.value).toBeUndefined();
  });

  it("onInputSubmit does nothing for empty value", () => {
    const result = useMultivalueInput({
      type: () => "text",
      optionLabel: () => "label",
      addItem,
    });

    const event = { target: { value: "" } } as unknown as KeyboardEvent;
    result.onInputSubmit(event);

    expect(addItem).not.toHaveBeenCalled();
  });

  it("onInputSubmit does nothing for null value", () => {
    const result = useMultivalueInput({
      type: () => "text",
      optionLabel: () => "label",
      addItem,
    });

    const event = { target: { value: null } } as unknown as KeyboardEvent;
    result.onInputSubmit(event);

    expect(addItem).not.toHaveBeenCalled();
  });

  it("onInputSubmit adds color item with hex conversion", () => {
    const result = useMultivalueInput({
      type: () => "color",
      optionLabel: () => "name",
      addItem,
    });

    const event = { target: { value: "red" } } as unknown as KeyboardEvent;
    result.onInputSubmit(event);

    expect(addItem).toHaveBeenCalledWith({
      name: "red",
      colorCode: "#ff0000",
    });
  });

  it("onInputSubmit uses #000000 when color name not recognized", () => {
    const result = useMultivalueInput({
      type: () => "color",
      optionLabel: () => "name",
      addItem,
    });

    const event = { target: { value: "unknown" } } as unknown as KeyboardEvent;
    result.onInputSubmit(event);

    expect(addItem).toHaveBeenCalledWith({
      name: "unknown",
      colorCode: "#000000",
    });
  });

  it("onKeyDown prevents minus/e/plus for number type", () => {
    const result = useMultivalueInput({
      type: () => "number",
      optionLabel: () => "label",
      addItem,
    });

    for (const key of ["-", "e", "+"]) {
      const event = { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
      result.onKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalled();
    }
  });

  it("onKeyDown prevents non-digit keys for integer type", () => {
    const result = useMultivalueInput({
      type: () => "integer",
      optionLabel: () => "label",
      addItem,
    });

    const event = { key: "a", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    result.onKeyDown(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("onKeyDown allows digit keys for integer type", () => {
    const result = useMultivalueInput({
      type: () => "integer",
      optionLabel: () => "label",
      addItem,
    });

    const event = { key: "5", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    result.onKeyDown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("onKeyDown allows control keys for integer type", () => {
    const result = useMultivalueInput({
      type: () => "integer",
      optionLabel: () => "label",
      addItem,
    });

    for (const key of ["Backspace", "Delete", "Enter", "Tab", "ArrowUp"]) {
      const event = { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
      result.onKeyDown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    }
  });

  it("onKeyDown does not prevent keys for text type", () => {
    const result = useMultivalueInput({
      type: () => "text",
      optionLabel: () => "label",
      addItem,
    });

    const event = { key: "a", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    result.onKeyDown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
