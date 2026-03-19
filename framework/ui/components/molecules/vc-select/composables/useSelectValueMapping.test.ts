import { describe, it, expect } from "vitest";
import { mountWithSetup } from "@framework/test-helpers";
import { useSelectValueMapping } from "./useSelectValueMapping";

interface TestOption {
  id: string;
  title: string;
  value?: number;
}

describe("useSelectValueMapping", () => {
  it("getOptionValue defaults to 'id' property", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<TestOption>({
        optionValue: () => undefined,
        optionLabel: () => undefined,
      }),
    );

    const opt: TestOption = { id: "abc", title: "Test" };
    expect(result.getOptionValue.value(opt)).toBe("abc");
  });

  it("getOptionLabel defaults to 'title' property", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<TestOption>({
        optionValue: () => undefined,
        optionLabel: () => undefined,
      }),
    );

    const opt: TestOption = { id: "abc", title: "Hello" };
    expect(result.getOptionLabel.value(opt)).toBe("Hello");
  });

  it("getOptionValue uses custom string key", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<TestOption>({
        optionValue: () => "title",
        optionLabel: () => undefined,
      }),
    );

    const opt: TestOption = { id: "abc", title: "Test" };
    expect(result.getOptionValue.value(opt)).toBe("Test");
  });

  it("getOptionLabel uses custom string key", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<TestOption>({
        optionValue: () => undefined,
        optionLabel: () => "id",
      }),
    );

    const opt: TestOption = { id: "abc", title: "Test" };
    expect(result.getOptionLabel.value(opt)).toBe("abc");
  });

  it("getOptionValue uses custom function", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<TestOption>({
        optionValue: () => (opt: TestOption) => `custom-${opt.id}`,
        optionLabel: () => undefined,
      }),
    );

    const opt: TestOption = { id: "abc", title: "Test" };
    expect(result.getOptionValue.value(opt)).toBe("custom-abc");
  });

  it("handles primitive options (string)", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<string>({
        optionValue: () => undefined,
        optionLabel: () => undefined,
      }),
    );

    expect(result.getOptionValue.value("hello")).toBe("hello");
    expect(result.getOptionLabel.value("hello")).toBe("hello");
  });

  it("handles null option gracefully", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<any>({
        optionValue: () => undefined,
        optionLabel: () => undefined,
      }),
    );

    expect(result.getOptionValue.value(null)).toBeNull();
  });

  it("returns whole object when key not found", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<{ name: string }>({
        optionValue: () => undefined, // defaults to 'id', which won't exist
        optionLabel: () => undefined,
      }),
    );

    const opt = { name: "test" };
    expect(result.getOptionValue.value(opt)).toEqual(opt);
  });

  it("getOption finds from defaultValues first", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<TestOption>({
        optionValue: () => undefined,
        optionLabel: () => undefined,
      }),
    );

    const def: TestOption = { id: "1", title: "Default" };
    const list: TestOption = { id: "1", title: "List" };

    const found = result.getOption("1" as any, [], [def], [list]);
    expect(found.title).toBe("Default");
  });

  it("getOption falls back to optionsList", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<TestOption>({
        optionValue: () => undefined,
        optionLabel: () => undefined,
      }),
    );

    const list: TestOption = { id: "1", title: "List" };
    const found = result.getOption("1" as any, [], [], [list]);
    expect(found.title).toBe("List");
  });

  it("getOption returns value as-is when not found anywhere", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<TestOption>({
        optionValue: () => undefined,
        optionLabel: () => undefined,
      }),
    );

    const found = result.getOption("missing" as any, [], [], []);
    expect(found).toBe("missing");
  });

  it("getEmittingOptionValue returns label", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<TestOption>({
        optionValue: () => undefined,
        optionLabel: () => undefined,
      }),
    );

    const opt: TestOption = { id: "1", title: "Hello" };
    expect(result.getEmittingOptionValue(opt)).toBe("Hello");
  });

  it("fieldValueIsFilled returns true for non-empty array", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<TestOption>({
        optionValue: () => undefined,
        optionLabel: () => undefined,
      }),
    );

    expect(result.fieldValueIsFilled([{ id: "1", title: "A" }])).toBe(true);
  });

  it("fieldValueIsFilled returns false for undefined", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<TestOption>({
        optionValue: () => undefined,
        optionLabel: () => undefined,
      }),
    );

    expect(result.fieldValueIsFilled(undefined as any)).toBe(false);
  });

  it("fieldValueIsFilled returns false for null", () => {
    const { result } = mountWithSetup(() =>
      useSelectValueMapping<TestOption>({
        optionValue: () => undefined,
        optionLabel: () => undefined,
      }),
    );

    expect(result.fieldValueIsFilled(null as any)).toBe(false);
  });
});
