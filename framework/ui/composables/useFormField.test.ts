import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, provide, ref } from "vue";
import { mount } from "@vue/test-utils";
import { InputGroupContextKey, type InputGroupContext } from "@ui/components/molecules/vc-input-group/context";
import { useFormField } from "./useFormField";

function mountWithProvider<T>(
  setupFn: () => T,
  providerSetup?: () => void,
) {
  let result: T;
  const Inner = defineComponent({
    setup() {
      result = setupFn();
      return () => h("div");
    },
  });
  const Outer = defineComponent({
    setup() {
      providerSetup?.();
      return () => h(Inner);
    },
  });
  const wrapper = mount(Outer);
  return { result: result!, wrapper };
}

describe("useFormField", () => {
  it("generates unique field IDs", () => {
    const { result } = mountWithProvider(() =>
      useFormField({ label: "Test" }),
    );

    expect(result.fieldId.value).toMatch(/^vc-field-/);
    expect(result.labelId.value).toMatch(/-label$/);
    expect(result.errorId.value).toMatch(/-error$/);
    expect(result.hintId.value).toMatch(/-hint$/);
  });

  it("invalid is false when no error props", () => {
    const { result } = mountWithProvider(() =>
      useFormField({}),
    );
    expect(result.invalid.value).toBe(false);
  });

  it("invalid is true when error prop is true", () => {
    const { result } = mountWithProvider(() =>
      useFormField({ error: true }),
    );
    expect(result.invalid.value).toBe(true);
  });

  it("invalid is true when errorMessage is provided", () => {
    const { result } = mountWithProvider(() =>
      useFormField({ errorMessage: "Required" }),
    );
    expect(result.invalid.value).toBe(true);
  });

  it("resolvedDisabled respects props.disabled", () => {
    const { result } = mountWithProvider(() =>
      useFormField({ disabled: true }),
    );
    expect(result.resolvedDisabled.value).toBe(true);
  });

  it("resolvedDisabled is false by default", () => {
    const { result } = mountWithProvider(() =>
      useFormField({}),
    );
    expect(result.resolvedDisabled.value).toBe(false);
  });

  it("resolvedName uses props.name when no group context", () => {
    const { result } = mountWithProvider(() =>
      useFormField({ name: "myField" }),
    );
    expect(result.resolvedName.value).toBe("myField");
  });

  it("ariaRequired is true when required", () => {
    const { result } = mountWithProvider(() =>
      useFormField({ required: true }),
    );
    expect(result.ariaRequired.value).toBe(true);
  });

  it("ariaRequired is undefined when not required", () => {
    const { result } = mountWithProvider(() =>
      useFormField({}),
    );
    expect(result.ariaRequired.value).toBeUndefined();
  });

  it("ariaDescribedBy includes errorId when errorMessage present", () => {
    const { result } = mountWithProvider(() =>
      useFormField({ errorMessage: "Error!" }),
    );
    expect(result.ariaDescribedBy.value).toContain(result.errorId.value);
  });

  it("ariaDescribedBy includes hintId when hint present", () => {
    const { result } = mountWithProvider(() =>
      useFormField({ hint: "Some hint" }),
    );
    expect(result.ariaDescribedBy.value).toContain(result.hintId.value);
  });

  it("ariaDescribedBy is undefined when no error or hint", () => {
    const { result } = mountWithProvider(() =>
      useFormField({}),
    );
    expect(result.ariaDescribedBy.value).toBeUndefined();
  });

  // Group context integration
  it("inherits disabled from group context", () => {
    const groupContext: InputGroupContext = {
      name: ref(undefined),
      disabled: ref(true),
      invalid: ref(false),
      describedBy: ref(undefined),
    };

    const { result } = mountWithProvider(
      () => useFormField({}),
      () => provide(InputGroupContextKey, groupContext),
    );

    expect(result.resolvedDisabled.value).toBe(true);
  });

  it("inherits invalid from group context", () => {
    const groupContext: InputGroupContext = {
      name: ref(undefined),
      disabled: ref(false),
      invalid: ref(true),
      describedBy: ref(undefined),
    };

    const { result } = mountWithProvider(
      () => useFormField({}),
      () => provide(InputGroupContextKey, groupContext),
    );

    expect(result.invalid.value).toBe(true);
  });

  it("inherits name from group context", () => {
    const groupContext: InputGroupContext = {
      name: ref("groupName"),
      disabled: ref(false),
      invalid: ref(false),
      describedBy: ref(undefined),
    };

    const { result } = mountWithProvider(
      () => useFormField({}),
      () => provide(InputGroupContextKey, groupContext),
    );

    expect(result.resolvedName.value).toBe("groupName");
  });

  it("includes group describedBy in ariaDescribedBy", () => {
    const groupContext: InputGroupContext = {
      name: ref(undefined),
      disabled: ref(false),
      invalid: ref(false),
      describedBy: ref("group-desc-id"),
    };

    const { result } = mountWithProvider(
      () => useFormField({ errorMessage: "Error" }),
      () => provide(InputGroupContextKey, groupContext),
    );

    expect(result.ariaDescribedBy.value).toContain("group-desc-id");
    expect(result.ariaDescribedBy.value).toContain(result.errorId.value);
  });
});
