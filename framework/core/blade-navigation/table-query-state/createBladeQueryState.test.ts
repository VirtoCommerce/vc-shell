import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computed, ref } from "vue";
import type { Router } from "vue-router";
import type { BladeDescriptor, IBladeStack } from "@core/blade-navigation/types";
import { createBladeQueryState } from "./createBladeQueryState";

// urlSync is created internally; stub it so we can assert syncUrlReplace is called.
const syncUrlReplace = vi.fn();
vi.mock("@core/blade-navigation/utils/urlSync", () => ({
  createUrlSync: () => ({ syncUrlReplace, syncUrlPush: vi.fn() }),
}));

function makeDeps(query: Record<string, string> = {}) {
  const descriptor = ref<BladeDescriptor>({ id: "b1", name: "Offers", url: "/offers", visible: true });
  const router = { currentRoute: { value: { query } } } as unknown as Router;
  const updateBladeQuery = vi.fn();
  const bladeStack = { updateBladeQuery } as unknown as IBladeStack;
  return { descriptor: computed(() => descriptor.value), router, bladeStack, updateBladeQuery };
}

describe("createBladeQueryState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    syncUrlReplace.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it("read() decodes namespaced values from the URL using blade.url", () => {
    const { descriptor, router, bladeStack } = makeDeps({ offers_sort: "name:DESC", offers_page: "2" });
    const svc = createBladeQueryState({ descriptor, router, bladeStack });
    expect(svc.read()).toEqual({ sort: "name:DESC", page: 2 });
  });

  it("read() prefers an explicit tableKey over blade.url", () => {
    const { descriptor, router, bladeStack } = makeDeps({ grid_search: "abc" });
    const svc = createBladeQueryState({ descriptor, router, bladeStack });
    expect(svc.read("grid")).toEqual({ search: "abc" });
  });

  it("write() debounces, calls updateBladeQuery with encoded patch, then syncUrlReplace", () => {
    const { descriptor, router, bladeStack, updateBladeQuery } = makeDeps();
    const svc = createBladeQueryState({ descriptor, router, bladeStack });

    svc.write(undefined, { page: 3 });
    expect(updateBladeQuery).not.toHaveBeenCalled(); // debounced

    vi.advanceTimersByTime(160);
    expect(updateBladeQuery).toHaveBeenCalledWith("b1", { offers_page: "3" });
    expect(syncUrlReplace).toHaveBeenCalledTimes(1);
  });

  it("coalesces multiple field writes in one window into a single descriptor update", () => {
    const { descriptor, router, bladeStack, updateBladeQuery } = makeDeps();
    const svc = createBladeQueryState({ descriptor, router, bladeStack });

    svc.write(undefined, { sort: "name:DESC" });
    svc.write(undefined, { page: 1 });
    vi.advanceTimersByTime(160);

    expect(updateBladeQuery).toHaveBeenCalledTimes(1);
    expect(updateBladeQuery).toHaveBeenCalledWith("b1", { offers_sort: "name:DESC", offers_page: "1" });
    expect(syncUrlReplace).toHaveBeenCalledTimes(1);
  });

  it("read() hydrates the descriptor from the URL (without replacing it)", () => {
    // On reload the descriptor query is empty but the URL has params; read()
    // must seed the descriptor so a later syncUrlReplace does not wipe them.
    const { descriptor, router, bladeStack, updateBladeQuery } = makeDeps({
      offers_sort: "name:DESC",
      offers_search: "ski",
    });
    const svc = createBladeQueryState({ descriptor, router, bladeStack });

    svc.read();

    expect(updateBladeQuery).toHaveBeenCalledWith("b1", { offers_sort: "name:DESC", offers_search: "ski" });
    expect(syncUrlReplace).not.toHaveBeenCalled(); // URL already holds these values
  });

  it("read() leaves the descriptor untouched when the URL has no params", () => {
    const { descriptor, router, bladeStack, updateBladeQuery } = makeDeps({});
    const svc = createBladeQueryState({ descriptor, router, bladeStack });

    svc.read();

    expect(updateBladeQuery).not.toHaveBeenCalled();
  });

  it("is a no-op when the blade has no url and no tableKey", () => {
    const descriptor = computed<BladeDescriptor>(() => ({ id: "b1", name: "X", visible: true }));
    const router = { currentRoute: { value: { query: { _sort: "name:ASC" } } } } as unknown as Router;
    const updateBladeQuery = vi.fn();
    const bladeStack = { updateBladeQuery } as unknown as IBladeStack;

    const svc = createBladeQueryState({ descriptor, router, bladeStack });
    expect(svc.read()).toEqual({});
    svc.write(undefined, { page: 2 });
    vi.advanceTimersByTime(200);
    expect(updateBladeQuery).not.toHaveBeenCalled();
  });
});
