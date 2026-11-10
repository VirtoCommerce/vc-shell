import { describe, it, expect, afterEach, vi } from "vitest";
import { effectScope, nextTick, ref, type EffectScope, type Ref } from "vue";
import { useBarLayout, NARROW_WIDTH } from "./useBarLayout";

let callback: ((entries: Array<{ contentRect: { width: number } }>) => void) | undefined;
const disconnect = vi.fn();
const observe = vi.fn();

class MockResizeObserver {
  constructor(cb: typeof callback) {
    callback = cb;
  }
  observe = observe;
  unobserve = vi.fn();
  disconnect = disconnect;
}

vi.stubGlobal("ResizeObserver", MockResizeObserver);

interface Setup {
  scope: EffectScope;
  layout: ReturnType<typeof useBarLayout>;
  isMobile: Ref<boolean>;
  collapseSearch: Ref<boolean | undefined>;
  hasExtras: Ref<boolean>;
  resize: (width: number) => Promise<void>;
}

const scopes: EffectScope[] = [];

function setup(): Setup {
  const scope = effectScope();
  scopes.push(scope);
  const isMobile = ref(false);
  const collapseSearch = ref<boolean | undefined>(undefined);
  const hasExtras = ref(true);
  const el = ref<HTMLElement | undefined>(document.createElement("div"));
  const layout = scope.run(() =>
    useBarLayout({
      el,
      isMobile,
      collapseSearch: () => collapseSearch.value,
      hasExtras: () => hasExtras.value,
    }),
  )!;
  const resize = async (width: number) => {
    callback?.([{ contentRect: { width } }]);
    await nextTick();
  };
  return { scope, layout, isMobile, collapseSearch, hasExtras, resize };
}

afterEach(() => {
  scopes.splice(0).forEach((s) => s.stop());
  callback = undefined;
  disconnect.mockClear();
  observe.mockClear();
});

describe("useBarLayout", () => {
  it("treats the bar as wide before the first measurement", () => {
    const { layout } = setup();
    expect(layout.narrow.value).toBe(false);
  });

  it("is narrow below 640px and on a phone", async () => {
    const { layout, isMobile, resize } = setup();
    await resize(NARROW_WIDTH - 1);
    expect(layout.narrow.value).toBe(true);
    await resize(NARROW_WIDTH);
    expect(layout.narrow.value).toBe(false);
    await resize(1200);
    isMobile.value = true;
    expect(layout.narrow.value).toBe(true);
  });

  it("auto collapses only when narrow and there is more than the search", async () => {
    const { layout, hasExtras, resize } = setup();
    await resize(300);
    expect(layout.searchCollapsed.value).toBe(true);
    hasExtras.value = false;
    expect(layout.searchCollapsed.value).toBe(false);
    hasExtras.value = true;
    await resize(1200);
    expect(layout.searchCollapsed.value).toBe(false);
  });

  it("collapseSearch true / false overrides auto", async () => {
    const { layout, collapseSearch, resize } = setup();
    await resize(1200);
    collapseSearch.value = true;
    expect(layout.searchCollapsed.value).toBe(true);
    await resize(300);
    collapseSearch.value = false;
    expect(layout.searchCollapsed.value).toBe(false);
  });

  it("disconnects the observer on scope dispose", () => {
    const { scope } = setup();
    expect(observe).toHaveBeenCalledTimes(1);
    scope.stop();
    expect(disconnect).toHaveBeenCalled();
  });
});
