import { describe, it, expect, vi } from "vitest";
import { useCellBase, type CellBaseProps, type CellBaseEmits } from "./useCellBase";

function makeProps(overrides: Partial<CellBaseProps> = {}): CellBaseProps {
  return {
    value: undefined,
    editable: false,
    label: "",
    fieldName: "",
    fieldId: "price",
    rules: undefined,
    rowIndex: 0,
    ...overrides,
  };
}

function makeEmit(): CellBaseEmits {
  return vi.fn() as unknown as CellBaseEmits;
}

describe("useCellBase", () => {
  it("displayValue returns empty string for null/undefined", () => {
    const props = makeProps({ value: null });
    const { displayValue } = useCellBase({ props, emit: makeEmit() });
    expect(displayValue.value).toBe("");
  });

  it("displayValue stringifies non-null values by default", () => {
    const props = makeProps({ value: 42 });
    const { displayValue } = useCellBase({ props, emit: makeEmit() });
    expect(displayValue.value).toBe("42");
  });

  it("displayValue uses custom formatter when provided", () => {
    const props = makeProps({ value: 100 });
    const formatter = (val: number) => `$${val}`;
    const { displayValue } = useCellBase({ props, emit: makeEmit(), formatter });
    expect(displayValue.value).toBe("$100");
  });

  it("isValueEmpty returns true for null/undefined by default", () => {
    const props = makeProps({ value: null });
    const { isValueEmpty } = useCellBase({ props, emit: makeEmit() });
    expect(isValueEmpty.value).toBe(true);
  });

  it("isValueEmpty returns false for non-null values by default", () => {
    const props = makeProps({ value: 0 });
    const { isValueEmpty } = useCellBase({ props, emit: makeEmit() });
    expect(isValueEmpty.value).toBe(false);
  });

  it("isValueEmpty uses custom isEmpty function", () => {
    const props = makeProps({ value: 0 });
    const isEmpty = (val: number) => val === 0;
    const { isValueEmpty } = useCellBase({ props, emit: makeEmit(), isEmpty });
    expect(isValueEmpty.value).toBe(true);
  });

  it("onBlur emits blur when no errors", () => {
    const emit = vi.fn();
    const props = makeProps({ rowIndex: 3, fieldId: "name" });
    const { onBlur } = useCellBase({ props, emit: emit as unknown as CellBaseEmits });
    onBlur([]);
    expect(emit).toHaveBeenCalledWith("blur", { row: 3, field: "name" });
  });

  it("onBlur does NOT emit blur when there are errors", () => {
    const emit = vi.fn();
    const props = makeProps();
    const { onBlur } = useCellBase({ props, emit: emit as unknown as CellBaseEmits });
    onBlur(["required"]);
    expect(emit).not.toHaveBeenCalled();
  });

  it("onUpdate emits update with field and value", () => {
    const emit = vi.fn();
    const props = makeProps({ fieldId: "qty" });
    const { onUpdate } = useCellBase({ props, emit: emit as unknown as CellBaseEmits });
    onUpdate(99);
    expect(emit).toHaveBeenCalledWith("update", { field: "qty", value: 99 });
  });

  it("onUpdate uses empty string when fieldId is undefined", () => {
    const emit = vi.fn();
    const props = makeProps({ fieldId: undefined });
    const { onUpdate } = useCellBase({ props, emit: emit as unknown as CellBaseEmits });
    onUpdate("hello");
    expect(emit).toHaveBeenCalledWith("update", { field: "", value: "hello" });
  });

  it("editableWrapperProps returns correct shape", () => {
    const props = makeProps({ label: "Price", fieldName: "price_0", value: 10, rules: { required: true } });
    const { editableWrapperProps } = useCellBase({ props, emit: makeEmit() });
    expect(editableWrapperProps.value).toEqual({
      label: "Price",
      fieldName: "price_0",
      modelValue: 10,
      rules: { required: true },
    });
  });
});
