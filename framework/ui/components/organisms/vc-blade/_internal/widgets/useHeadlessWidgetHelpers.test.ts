import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => `translated:${key}`,
  }),
}));

import { useHeadlessWidgetHelpers } from "./useHeadlessWidgetHelpers";
import type { IWidget } from "@core/services/widget-service";

function makeWidget(overrides: Partial<IWidget> = {}): IWidget {
  return {
    id: "w1",
    title: "Widget Title",
    ...overrides,
  } as IWidget;
}

describe("useHeadlessWidgetHelpers", () => {
  it("returns the expected API shape", () => {
    const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());

    expect(result).toHaveProperty("resolveBadge");
    expect(result).toHaveProperty("resolveLoading");
    expect(result).toHaveProperty("resolveDisabled");
    expect(result).toHaveProperty("resolveTitle");
    expect(result).toHaveProperty("handleHeadlessClick");
  });

  describe("resolveBadge", () => {
    it("returns undefined when no headless config", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      expect(result.resolveBadge(makeWidget())).toBeUndefined();
    });

    it("returns static badge value", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      const widget = makeWidget({ headless: { badge: 5 } as any });
      expect(result.resolveBadge(widget)).toBe(5);
    });

    it("resolves ref badge", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      const badge = ref(10);
      const widget = makeWidget({ headless: { badge } as any });
      expect(result.resolveBadge(widget)).toBe(10);
    });
  });

  describe("resolveLoading", () => {
    it("returns false when no headless config", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      expect(result.resolveLoading(makeWidget())).toBe(false);
    });

    it("returns boolean loading value", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      const widget = makeWidget({ headless: { loading: true } as any });
      expect(result.resolveLoading(widget)).toBe(true);
    });

    it("resolves ref loading", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      const loading = ref(true);
      const widget = makeWidget({ headless: { loading } as any });
      expect(result.resolveLoading(widget)).toBe(true);
    });
  });

  describe("resolveDisabled", () => {
    it("returns false when no headless config", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      expect(result.resolveDisabled(makeWidget())).toBe(false);
    });

    it("returns static boolean", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      const widget = makeWidget({ headless: { disabled: true } as any });
      expect(result.resolveDisabled(widget)).toBe(true);
    });

    it("resolves ref disabled", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      const disabled = ref(true);
      const widget = makeWidget({ headless: { disabled } as any });
      expect(result.resolveDisabled(widget)).toBe(true);
    });
  });

  describe("resolveTitle", () => {
    it("returns raw title when no headless config", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      expect(result.resolveTitle(makeWidget({ title: "Hello" }))).toBe("Hello");
    });

    it("returns translated title when headless config exists", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      const widget = makeWidget({ title: "key.label", headless: {} as any });
      expect(result.resolveTitle(widget)).toBe("translated:key.label");
    });

    it("returns empty string when no title", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      expect(result.resolveTitle(makeWidget({ title: undefined }))).toBe("");
    });
  });

  describe("handleHeadlessClick", () => {
    it("calls onClick when defined", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      const onClick = vi.fn();
      const widget = makeWidget({ headless: { onClick } as any });

      result.handleHeadlessClick(widget);
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("does not throw when no headless config", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      expect(() => result.handleHeadlessClick(makeWidget())).not.toThrow();
    });

    it("does not throw when onClick is undefined", () => {
      const { result } = mountWithSetup(() => useHeadlessWidgetHelpers());
      const widget = makeWidget({ headless: {} as any });
      expect(() => result.handleHeadlessClick(widget)).not.toThrow();
    });
  });
});
