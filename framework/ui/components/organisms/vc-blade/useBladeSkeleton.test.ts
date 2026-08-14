import { describe, it, expect } from "vitest";
import { ref, nextTick } from "vue";
import { useBladeSkeleton } from "./useBladeSkeleton";

describe("useBladeSkeleton", () => {
  it("shows the skeleton while the blade has nothing to display yet", () => {
    const loading = ref(true);
    expect(useBladeSkeleton(() => loading.value).value).toBe(true);
  });

  it("hides the skeleton once loading finishes", async () => {
    const loading = ref(true);
    const skeleton = useBladeSkeleton(() => loading.value);

    loading.value = false;
    await nextTick();

    expect(skeleton.value).toBe(false);
  });

  // The point of the whole thing: a save re-raises `loading`, and replacing the
  // controls then would unmount whatever the user has focused (WCAG 2.4.3).
  it("does not return to the skeleton when loading is raised again after content has shown", async () => {
    const loading = ref(true);
    const skeleton = useBladeSkeleton(() => loading.value);

    loading.value = false;
    await nextTick();
    loading.value = true;
    await nextTick();

    expect(skeleton.value).toBe(false);
  });

  it("never shows the skeleton for a blade that starts with its content ready", async () => {
    const loading = ref(false);
    const skeleton = useBladeSkeleton(() => loading.value);

    expect(skeleton.value).toBe(false);

    loading.value = true;
    await nextTick();

    expect(skeleton.value).toBe(false);
  });
});
