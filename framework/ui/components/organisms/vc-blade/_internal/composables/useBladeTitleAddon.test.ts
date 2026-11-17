import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { createBladeTitleAddonRegistry } from "./useBladeTitleAddon";

describe("createBladeTitleAddonRegistry", () => {
  it("unregister removes it", () => {
    const { registry, render } = createBladeTitleAddonRegistry();
    const fn = () => h("div");
    const off = registry.register(fn);
    expect(render.value).toBe(fn);
    off?.();
    expect(render.value).toBeNull();
  });

  it("a second registration is ignored with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { registry, render } = createBladeTitleAddonRegistry();
    const first = () => h("div");
    const second = () => h("span");
    registry.register(first);
    const off = registry.register(second);
    expect(render.value).toBe(first);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(off).toBeNull();
    expect(render.value).toBe(first);
    warn.mockRestore();
  });
});
