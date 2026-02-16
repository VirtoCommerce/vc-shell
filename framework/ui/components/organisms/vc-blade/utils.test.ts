import { describe, expect, it } from "vitest";
import { computed, ref } from "vue";
import { resolveVisibility, resolveReactiveBoolean } from "./utils";

describe("resolveVisibility", () => {
  it("returns true when value is undefined", () => {
    expect(resolveVisibility(undefined)).toBe(true);
  });

  it("returns the boolean value directly", () => {
    expect(resolveVisibility(true)).toBe(true);
    expect(resolveVisibility(false)).toBe(false);
  });

  it("unwraps a Ref<boolean>", () => {
    const visible = ref(true);
    expect(resolveVisibility(visible)).toBe(true);

    visible.value = false;
    expect(resolveVisibility(visible)).toBe(false);
  });

  it("unwraps a ComputedRef<boolean>", () => {
    const flag = ref(true);
    const visible = computed(() => flag.value);
    expect(resolveVisibility(visible)).toBe(true);

    flag.value = false;
    expect(resolveVisibility(visible)).toBe(false);
  });

  it("calls a function with blade instance", () => {
    const bladeInstance = { id: "test-blade" } as any;
    const fn = (blade: any) => blade?.id === "test-blade";

    expect(resolveVisibility(fn, bladeInstance)).toBe(true);
    expect(resolveVisibility(fn, undefined)).toBe(false);
  });

  it("coerces function return to boolean", () => {
    expect(resolveVisibility(() => undefined)).toBe(false);
    expect(resolveVisibility(() => true)).toBe(true);
  });

  it("coerces Ref<undefined> to false via Boolean()", () => {
    const visible = ref<boolean | undefined>(undefined);
    expect(resolveVisibility(visible)).toBe(false);
  });
});

describe("resolveReactiveBoolean", () => {
  it("returns false when value is undefined", () => {
    expect(resolveReactiveBoolean(undefined)).toBe(false);
  });

  it("returns the boolean value directly", () => {
    expect(resolveReactiveBoolean(true)).toBe(true);
    expect(resolveReactiveBoolean(false)).toBe(false);
  });

  it("unwraps a Ref<boolean>", () => {
    const val = ref(true);
    expect(resolveReactiveBoolean(val)).toBe(true);

    val.value = false;
    expect(resolveReactiveBoolean(val)).toBe(false);
  });

  it("unwraps a ComputedRef<boolean>", () => {
    const flag = ref(false);
    const val = computed(() => !flag.value);
    expect(resolveReactiveBoolean(val)).toBe(true);

    flag.value = true;
    expect(resolveReactiveBoolean(val)).toBe(false);
  });

  it("coerces Ref<undefined> to false via Boolean()", () => {
    const val = ref<boolean | undefined>(undefined);
    expect(resolveReactiveBoolean(val)).toBe(false);
  });
});
