import { describe, it, expect } from "vitest";
import { mountWithSetup } from "@framework/test-helpers";
import { useMultivalueOptions } from "./useMultivalueOptions";

interface TestOption {
  id: string;
  label: string;
}

describe("useMultivalueOptions", () => {
  it("returns all options when nothing is selected", () => {
    const options: TestOption[] = [
      { id: "1", label: "One" },
      { id: "2", label: "Two" },
    ];

    const { result } = mountWithSetup(() =>
      useMultivalueOptions<TestOption>({
        options: () => options,
        modelValue: () => [],
        optionValue: () => "id",
      }),
    );

    expect(result.availableOptions.value).toEqual(options);
  });

  it("excludes selected items from available options", () => {
    const options: TestOption[] = [
      { id: "1", label: "One" },
      { id: "2", label: "Two" },
      { id: "3", label: "Three" },
    ];

    const { result } = mountWithSetup(() =>
      useMultivalueOptions<TestOption>({
        options: () => options,
        modelValue: () => [{ id: "2", label: "Two" }],
        optionValue: () => "id",
      }),
    );

    expect(result.availableOptions.value).toEqual([
      { id: "1", label: "One" },
      { id: "3", label: "Three" },
    ]);
  });

  it("returns empty when all options are selected", () => {
    const options: TestOption[] = [{ id: "1", label: "One" }];

    const { result } = mountWithSetup(() =>
      useMultivalueOptions<TestOption>({
        options: () => options,
        modelValue: () => [{ id: "1", label: "One" }],
        optionValue: () => "id",
      }),
    );

    expect(result.availableOptions.value).toEqual([]);
  });

  it("returns empty when options list is empty", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueOptions<TestOption>({
        options: () => [],
        modelValue: () => [],
        optionValue: () => "id",
      }),
    );

    expect(result.availableOptions.value).toEqual([]);
  });

  it("uses correct optionValue key for comparison", () => {
    const options = [
      { id: "1", label: "One" },
      { id: "2", label: "Two" },
    ];

    const { result } = mountWithSetup(() =>
      useMultivalueOptions<TestOption>({
        options: () => options,
        modelValue: () => [{ id: "x", label: "One" }], // different id, same label
        optionValue: () => "label",
      }),
    );

    // Filtering by label="One", so only "Two" remains
    expect(result.availableOptions.value).toEqual([{ id: "2", label: "Two" }]);
  });
});
