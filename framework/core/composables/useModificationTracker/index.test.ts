import { describe, it, expect } from "vitest";
import { ref, nextTick } from "vue";
import { useModificationTracker } from "./index";

describe("useModificationTracker", () => {
  it("starts unmodified with cloned current and pristine values", () => {
    const { currentValue, pristineValue, isModified } = useModificationTracker({ name: "a" });

    expect(currentValue.value).toEqual({ name: "a" });
    expect(pristineValue.value).toEqual({ name: "a" });
    expect(isModified.value).toBe(false);
  });

  it("clones the initial value so source mutations do not leak in", () => {
    const source = { name: "a" };
    const { currentValue, pristineValue } = useModificationTracker(source);

    source.name = "mutated";

    expect(currentValue.value.name).toBe("a");
    expect(pristineValue.value.name).toBe("a");
  });

  it("flags modification when the current value changes", async () => {
    const { currentValue, isModified } = useModificationTracker({ name: "a" });

    currentValue.value = { name: "b" };
    await nextTick();

    expect(isModified.value).toBe(true);
  });

  it("detects deeply nested changes", async () => {
    const { currentValue, isModified } = useModificationTracker({ nested: { count: 1 } });

    currentValue.value.nested.count = 2;
    await nextTick();

    expect(isModified.value).toBe(true);
  });

  it("treats null, undefined and empty string as equivalent", async () => {
    const { currentValue, isModified } = useModificationTracker<string | null | undefined>(null);

    currentValue.value = "";
    await nextTick();
    expect(isModified.value).toBe(false);

    currentValue.value = undefined;
    await nextTick();
    expect(isModified.value).toBe(false);
  });

  describe("resetModificationState", () => {
    it("adopts the current value as the new baseline when called without an argument", async () => {
      const { currentValue, pristineValue, isModified, resetModificationState } = useModificationTracker({ name: "a" });

      currentValue.value = { name: "b" };
      await nextTick();
      expect(isModified.value).toBe(true);

      resetModificationState();
      expect(isModified.value).toBe(false);
      expect(pristineValue.value).toEqual({ name: "b" });
    });

    it("resets both values to an explicit baseline", async () => {
      const { currentValue, pristineValue, isModified, resetModificationState } = useModificationTracker({ name: "a" });

      resetModificationState({ name: "baseline" });

      expect(currentValue.value).toEqual({ name: "baseline" });
      expect(pristineValue.value).toEqual({ name: "baseline" });
      expect(isModified.value).toBe(false);
    });

    it("unwraps a Ref baseline", () => {
      const { currentValue, pristineValue, resetModificationState } = useModificationTracker({ name: "a" });

      resetModificationState(ref({ name: "from-ref" }));

      expect(currentValue.value).toEqual({ name: "from-ref" });
      expect(pristineValue.value).toEqual({ name: "from-ref" });
    });

    it("clears isModified synchronously (before the watcher flushes)", async () => {
      const { currentValue, isModified, resetModificationState } = useModificationTracker({ name: "a" });

      currentValue.value = { name: "b" };
      await nextTick();
      expect(isModified.value).toBe(true);

      resetModificationState();
      // No await — must be false in the same tick.
      expect(isModified.value).toBe(false);
    });
  });

  describe("with a reactive initial value", () => {
    it("follows external source changes while unmodified", async () => {
      const source = ref({ name: "a" });
      const { currentValue, pristineValue, isModified } = useModificationTracker(source);

      source.value = { name: "external" };
      await nextTick();

      expect(currentValue.value).toEqual({ name: "external" });
      expect(pristineValue.value).toEqual({ name: "external" });
      expect(isModified.value).toBe(false);
    });

    it("preserves local edits when the external source changes", async () => {
      const source = ref({ name: "a" });
      const { currentValue, pristineValue, isModified } = useModificationTracker(source);

      currentValue.value = { name: "local-edit" };
      await nextTick();
      expect(isModified.value).toBe(true);

      source.value = { name: "external" };
      await nextTick();

      // Local edit is preserved, pristine tracks the new source, still modified.
      expect(currentValue.value).toEqual({ name: "local-edit" });
      expect(pristineValue.value).toEqual({ name: "external" });
      expect(isModified.value).toBe(true);
    });
  });

  it("exposes isModified as a read-only computed", () => {
    const { isModified } = useModificationTracker({ name: "a" });

    // A computed without a setter has no `.value` assignment path.
    expect(typeof isModified.value).toBe("boolean");
    expect("effect" in isModified).toBe(true);
  });
});
