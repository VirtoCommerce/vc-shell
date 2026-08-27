import { describe, it, expect } from "vitest";
import { defineComponent, h, nextTick, onMounted, ref, type ComputedRef, type Ref } from "vue";
import { mount } from "@vue/test-utils";
import { useBladeSkeleton } from "./useBladeSkeleton";

/**
 * Mounts the composable the way a blade actually uses it: in a child whose
 * parent page starts its fetch in `onMounted`. Calling it as a plain function
 * cannot reproduce that ordering, which is how the latch bug reached a release —
 * every assertion below that depends on "the fetch has not started yet" is
 * meaningless outside a real mount.
 */
function mountInParent(opts: { loading: Ref<boolean>; contextKey?: Ref<unknown>; fetchOnMount?: boolean }) {
  let skeleton!: ComputedRef<boolean>;

  const Child = defineComponent({
    setup() {
      skeleton = useBladeSkeleton(
        () => opts.loading.value,
        () => opts.contextKey?.value,
      );
      return () => h("div");
    },
  });

  const Parent = defineComponent({
    setup() {
      onMounted(() => {
        if (opts.fetchOnMount) opts.loading.value = true;
      });
      return () => h(Child);
    },
  });

  const wrapper = mount(Parent);
  return { wrapper, skeleton: () => skeleton.value };
}

describe("useBladeSkeleton", () => {
  it("shows the skeleton on the first load, when the parent starts fetching after mount", async () => {
    const loading = ref(false);
    const { skeleton } = mountInParent({ loading, fetchOnMount: true });

    await nextTick();
    await nextTick();

    expect(skeleton()).toBe(true);
  });

  it("hides the skeleton once the first load finishes", async () => {
    const loading = ref(false);
    const { skeleton } = mountInParent({ loading, fetchOnMount: true });

    await nextTick();
    loading.value = false;
    await nextTick();

    expect(skeleton()).toBe(false);
  });

  // The point of the whole thing: a save re-raises `loading`, and replacing the
  // controls then would unmount whatever the user has focused (WCAG 2.4.3).
  it("does not return to the skeleton when loading is raised again after content has shown", async () => {
    const loading = ref(false);
    const contextKey = ref("entity-a");
    const { skeleton } = mountInParent({ loading, contextKey, fetchOnMount: true });

    await nextTick();
    loading.value = false;
    await nextTick();
    expect(skeleton()).toBe(false);

    loading.value = true;
    await nextTick();

    expect(skeleton()).toBe(false);
  });

  it("resets the initial-load latch when the same blade instance switches entity context", async () => {
    const loading = ref(false);
    const contextKey = ref("entity-a");
    const { skeleton } = mountInParent({ loading, contextKey, fetchOnMount: true });

    await nextTick();
    loading.value = false;
    await nextTick();
    expect(skeleton()).toBe(false);

    loading.value = true;
    contextKey.value = "entity-b";
    await nextTick();

    expect(skeleton()).toBe(true);
  });

  it("shows the skeleton for a blade that is already loading when it mounts", async () => {
    const loading = ref(true);
    const { skeleton } = mountInParent({ loading });

    expect(skeleton()).toBe(true);

    loading.value = false;
    await nextTick();

    expect(skeleton()).toBe(false);
  });
});
