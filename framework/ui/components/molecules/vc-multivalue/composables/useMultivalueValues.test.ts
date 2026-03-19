import { describe, it, expect, vi } from "vitest";
import { mountWithSetup } from "@framework/test-helpers";
import { useMultivalueValues } from "./useMultivalueValues";

interface TestItem {
  label: string;
  colorCode?: string;
}

describe("useMultivalueValues", () => {
  it("formatValue returns label for text type", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueValues<TestItem>({
        modelValue: () => [],
        optionLabel: () => "label",
        type: () => "text",
        emit: { updateModelValue: vi.fn() },
      }),
    );

    expect(result.formatValue.value({ label: "hello" })).toBe("hello");
  });

  it("formatValue returns fixed(3) for number type", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueValues<TestItem>({
        modelValue: () => [],
        optionLabel: () => "label",
        type: () => "number",
        emit: { updateModelValue: vi.fn() },
      }),
    );

    expect(result.formatValue.value({ label: "3.14159" } as any)).toBe("3.142");
  });

  it("formatValue returns truncated integer for integer type", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueValues<TestItem>({
        modelValue: () => [],
        optionLabel: () => "label",
        type: () => "integer",
        emit: { updateModelValue: vi.fn() },
      }),
    );

    expect(result.formatValue.value({ label: "3.7" } as any)).toBe(3);
  });

  it("removeAtIndex removes item and emits", () => {
    const updateModelValue = vi.fn();
    const items: TestItem[] = [{ label: "A" }, { label: "B" }, { label: "C" }];

    const { result } = mountWithSetup(() =>
      useMultivalueValues<TestItem>({
        modelValue: () => items,
        optionLabel: () => "label",
        type: () => "text",
        emit: { updateModelValue },
      }),
    );

    result.removeAtIndex(1);
    expect(updateModelValue).toHaveBeenCalledWith([{ label: "A" }, { label: "C" }]);
  });

  it("clearAll emits empty array", () => {
    const updateModelValue = vi.fn();

    const { result } = mountWithSetup(() =>
      useMultivalueValues<TestItem>({
        modelValue: () => [{ label: "A" }],
        optionLabel: () => "label",
        type: () => "text",
        emit: { updateModelValue },
      }),
    );

    result.clearAll();
    expect(updateModelValue).toHaveBeenCalledWith([]);
  });

  it("addItem appends item and emits", () => {
    const updateModelValue = vi.fn();
    const existing: TestItem[] = [{ label: "A" }];

    const { result } = mountWithSetup(() =>
      useMultivalueValues<TestItem>({
        modelValue: () => existing,
        optionLabel: () => "label",
        type: () => "text",
        emit: { updateModelValue },
      }),
    );

    result.addItem({ label: "B" });
    expect(updateModelValue).toHaveBeenCalledWith([{ label: "A" }, { label: "B" }]);
  });

  it("addItem works on empty list", () => {
    const updateModelValue = vi.fn();

    const { result } = mountWithSetup(() =>
      useMultivalueValues<TestItem>({
        modelValue: () => [],
        optionLabel: () => "label",
        type: () => "text",
        emit: { updateModelValue },
      }),
    );

    result.addItem({ label: "First" });
    expect(updateModelValue).toHaveBeenCalledWith([{ label: "First" }]);
  });

  it("formatValue returns color label as-is for color type", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueValues<TestItem>({
        modelValue: () => [],
        optionLabel: () => "label",
        type: () => "color",
        emit: { updateModelValue: vi.fn() },
      }),
    );

    expect(result.formatValue.value({ label: "red", colorCode: "#ff0000" })).toBe("red");
  });
});
