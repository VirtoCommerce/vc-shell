import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useLoading } from "./index";

describe("useLoading", () => {
  it("returns false when no args provided", () => {
    const result = useLoading();
    expect(result.value).toBe(false);
  });

  it("returns false when all refs are false", () => {
    const a = ref(false);
    const b = ref(false);
    const result = useLoading(a, b);
    expect(result.value).toBe(false);
  });

  it("returns true when any ref is true", () => {
    const a = ref(false);
    const b = ref(true);
    const result = useLoading(a, b);
    expect(result.value).toBe(true);
  });

  it("reacts to changes in source refs", () => {
    const a = ref(false);
    const b = ref(false);
    const result = useLoading(a, b);
    expect(result.value).toBe(false);

    a.value = true;
    expect(result.value).toBe(true);

    a.value = false;
    expect(result.value).toBe(false);
  });

  it("works with a single ref", () => {
    const a = ref(true);
    const result = useLoading(a);
    expect(result.value).toBe(true);

    a.value = false;
    expect(result.value).toBe(false);
  });
});
