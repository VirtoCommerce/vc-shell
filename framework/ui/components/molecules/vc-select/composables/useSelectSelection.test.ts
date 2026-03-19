import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useSelectSelection } from "./useSelectSelection";

interface TestOption {
  id: string;
  title: string;
}

function createOpts(overrides: Partial<Parameters<typeof useSelectSelection<TestOption>>[0]> = {}) {
  const defaults: Parameters<typeof useSelectSelection<TestOption>>[0] = {
    modelValue: () => null,
    multiple: () => false,
    emitValue: () => false,
    mapOptions: () => false,
    displayItems: ref<TestOption[]>([
      { id: "1", title: "One" },
      { id: "2", title: "Two" },
      { id: "3", title: "Three" },
    ]),
    resolvedDefaults: ref<TestOption[]>([]),
    cachedItems: ref<TestOption[]>([]),
    getOptionValue: computed(() => (opt: TestOption) => opt.id),
    getOptionLabel: computed(() => (opt: TestOption) => opt.title),
    getOption: (value, _cache, defaults, list) => {
      return defaults.find((d) => d.id === value) || list.find((l) => l.id === value) || value;
    },
    fieldValueIsFilled: (val) => val !== undefined && val !== null && val.length > 0,
    isOpened: ref(false),
    popperUpdate: vi.fn(),
    emit: {
      updateModelValue: vi.fn(),
      close: vi.fn(),
    },
    ...overrides,
  };
  return defaults;
}

describe("useSelectSelection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("innerValue is empty array when modelValue is null", () => {
    const { result } = mountWithSetup(() => useSelectSelection(createOpts()));
    expect(result.innerValue.value).toEqual([]);
  });

  it("innerValue wraps single value in array", () => {
    const { result } = mountWithSetup(() =>
      useSelectSelection(createOpts({ modelValue: () => "test" })),
    );
    expect(result.innerValue.value).toEqual(["test"]);
  });

  it("innerValue keeps array for multiple mode", () => {
    const { result } = mountWithSetup(() =>
      useSelectSelection(
        createOpts({
          modelValue: () => ["a", "b"],
          multiple: () => true,
        }),
      ),
    );
    expect(result.innerValue.value).toEqual(["a", "b"]);
  });

  it("hasValue is false when no value", () => {
    const { result } = mountWithSetup(() => useSelectSelection(createOpts()));
    expect(result.hasValue.value).toBe(false);
  });

  it("hasValue is true when value present", () => {
    const { result } = mountWithSetup(() =>
      useSelectSelection(createOpts({ modelValue: () => "test" })),
    );
    expect(result.hasValue.value).toBe(true);
  });

  it("isOptionSelected returns true for selected option", () => {
    const { result } = mountWithSetup(() =>
      useSelectSelection(
        createOpts({
          modelValue: () => ({ id: "1", title: "One" }),
          mapOptions: () => false,
        }),
      ),
    );
    expect(result.isOptionSelected({ id: "1", title: "One" })).toBe(true);
  });

  it("isOptionSelected returns false for unselected option", () => {
    const { result } = mountWithSetup(() =>
      useSelectSelection(
        createOpts({
          modelValue: () => ({ id: "1", title: "One" }),
        }),
      ),
    );
    expect(result.isOptionSelected({ id: "2", title: "Two" })).toBe(false);
  });

  it("toggleOption emits value for single select", () => {
    const emit = { updateModelValue: vi.fn(), close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useSelectSelection(createOpts({ emit })),
    );

    result.toggleOption({ id: "1", title: "One" });

    expect(emit.updateModelValue).toHaveBeenCalledWith({ id: "1", title: "One" });
    expect(emit.close).toHaveBeenCalled();
  });

  it("toggleOption closes dropdown for single select", () => {
    const isOpened = ref(true);
    const emit = { updateModelValue: vi.fn(), close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useSelectSelection(createOpts({ isOpened, emit })),
    );

    result.toggleOption({ id: "1", title: "One" });
    expect(isOpened.value).toBe(false);
  });

  it("toggleOption does nothing for undefined option", () => {
    const emit = { updateModelValue: vi.fn(), close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useSelectSelection(createOpts({ emit })),
    );

    result.toggleOption(undefined as any);
    expect(emit.updateModelValue).not.toHaveBeenCalled();
  });

  it("toggleOption adds item in multiple mode", () => {
    const emit = { updateModelValue: vi.fn(), close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useSelectSelection(
        createOpts({
          modelValue: () => [],
          multiple: () => true,
          emit,
        }),
      ),
    );

    result.toggleOption({ id: "1", title: "One" });
    expect(emit.updateModelValue).toHaveBeenCalledWith([{ id: "1", title: "One" }]);
  });

  it("toggleOption removes item in multiple mode when already selected", () => {
    const opt1 = { id: "1", title: "One" };
    const opt2 = { id: "2", title: "Two" };
    const emit = { updateModelValue: vi.fn(), close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useSelectSelection(
        createOpts({
          modelValue: () => [opt1, opt2],
          multiple: () => true,
          emit,
        }),
      ),
    );

    result.toggleOption(opt1);
    expect(emit.updateModelValue).toHaveBeenCalledWith([opt2]);
  });

  it("removeAtIndex removes item from multiple mode", () => {
    const opt1 = { id: "1", title: "One" };
    const opt2 = { id: "2", title: "Two" };
    const emit = { updateModelValue: vi.fn(), close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useSelectSelection(
        createOpts({
          modelValue: () => [opt1, opt2],
          multiple: () => true,
          emit,
        }),
      ),
    );

    result.removeAtIndex(0);
    expect(emit.updateModelValue).toHaveBeenCalledWith([opt2]);
  });

  it("removeAtIndex emits null for single mode", () => {
    const emit = { updateModelValue: vi.fn(), close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useSelectSelection(
        createOpts({
          modelValue: () => "test",
          emit,
        }),
      ),
    );

    result.removeAtIndex(0);
    expect(emit.updateModelValue).toHaveBeenCalledWith(null);
  });

  it("removeAtIndex does nothing for invalid index", () => {
    const emit = { updateModelValue: vi.fn(), close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useSelectSelection(createOpts({ emit })),
    );

    result.removeAtIndex(-1);
    result.removeAtIndex(999);
    expect(emit.updateModelValue).not.toHaveBeenCalled();
  });

  it("onReset emits empty array for multiple", () => {
    const emit = { updateModelValue: vi.fn(), close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useSelectSelection(
        createOpts({
          multiple: () => true,
          emit,
        }),
      ),
    );

    result.onReset();
    expect(emit.updateModelValue).toHaveBeenCalledWith([]);
  });

  it("onReset emits null for single", () => {
    const emit = { updateModelValue: vi.fn(), close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useSelectSelection(createOpts({ emit })),
    );

    result.onReset();
    expect(emit.updateModelValue).toHaveBeenCalledWith(null);
  });

  it("selectedScope maps innerValue to scope objects", () => {
    const { result } = mountWithSetup(() =>
      useSelectSelection(
        createOpts({
          modelValue: () => "val",
        }),
      ),
    );

    expect(result.selectedScope.value).toHaveLength(1);
    expect(result.selectedScope.value[0].index).toBe(0);
    expect(result.selectedScope.value[0].selected).toBe(true);
    expect(typeof result.selectedScope.value[0].toggleOption).toBe("function");
  });

  it("optionScope maps displayItems with selected state", () => {
    const { result } = mountWithSetup(() =>
      useSelectSelection(
        createOpts({
          modelValue: () => ({ id: "1", title: "One" }),
        }),
      ),
    );

    expect(result.optionScope.value).toHaveLength(3);
    expect(result.optionScope.value[0].selected).toBe(true);
    expect(result.optionScope.value[1].selected).toBe(false);
  });

  it("toggleOption emits optionValue when emitValue is true", () => {
    const emit = { updateModelValue: vi.fn(), close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useSelectSelection(
        createOpts({
          emitValue: () => true,
          emit,
        }),
      ),
    );

    result.toggleOption({ id: "1", title: "One" });
    expect(emit.updateModelValue).toHaveBeenCalledWith("1");
  });
});
