import { ref, computed } from "vue";
import { mountWithSetup } from "@framework/test-helpers";

const mockBadges = ref(new Map<string, unknown>());

vi.mock("@core/composables/useMenuService", () => ({
  useMenuService: () => ({
    menuBadges: mockBadges,
  }),
}));

import { useBadge, type ResolvedBadge } from "./useBadge";

describe("useBadge", () => {
  beforeEach(() => {
    mockBadges.value = new Map();
  });

  it("returns invisible badge when no config provided", () => {
    const { result } = mountWithSetup(() => useBadge(undefined));

    expect(result.value.isVisible).toBe(false);
    expect(result.value.content).toBeUndefined();
    expect(result.value.variant).toBe("primary");
    expect(result.value.isDot).toBe(false);
  });

  it("resolves direct badge config with content number", () => {
    const { result } = mountWithSetup(() => useBadge({ content: 5, variant: "danger" }));

    expect(result.value.isVisible).toBe(true);
    expect(result.value.content).toBe(5);
    expect(result.value.variant).toBe("danger");
  });

  it("truncates numeric content > 99 to '99+'", () => {
    const { result } = mountWithSetup(() => useBadge({ content: 150 }));

    expect(result.value.content).toBe("99+");
    expect(result.value.isVisible).toBe(true);
  });

  it("truncates string numeric content > 99 to '99+'", () => {
    const { result } = mountWithSetup(() => useBadge({ content: "200" }));

    expect(result.value.content).toBe("99+");
  });

  it("handles shorthand config (just a value)", () => {
    const { result } = mountWithSetup(() => useBadge(42));

    expect(result.value.content).toBe(42);
    expect(result.value.isVisible).toBe(true);
  });

  it("resolves function content", () => {
    const { result } = mountWithSetup(() => useBadge({ content: () => 7 }));

    expect(result.value.content).toBe(7);
  });

  it("resolves ref content", () => {
    const count = ref(3);
    const { result } = mountWithSetup(() => useBadge({ content: count }));

    expect(result.value.content).toBe(3);
  });

  it("isDot badge is visible even without content", () => {
    const { result } = mountWithSetup(() => useBadge({ content: undefined, isDot: true }));

    expect(result.value.isDot).toBe(true);
    expect(result.value.isVisible).toBe(true);
  });

  it("content of 0 is not visible", () => {
    const { result } = mountWithSetup(() => useBadge({ content: 0 }));

    expect(result.value.isVisible).toBe(false);
  });

  it("empty string content is not visible", () => {
    const { result } = mountWithSetup(() => useBadge({ content: "" }));

    expect(result.value.isVisible).toBe(false);
  });

  it("falls back to routeId lookup in registry", () => {
    mockBadges.value.set("my-route", { content: 10, variant: "success" });
    const { result } = mountWithSetup(() => useBadge(undefined, "my-route"));

    expect(result.value.content).toBe(10);
    expect(result.value.variant).toBe("success");
    expect(result.value.isVisible).toBe(true);
  });

  it("falls back to groupId lookup when routeId not found", () => {
    mockBadges.value.set("my-group", { content: 2, variant: "warning" });
    const { result } = mountWithSetup(() => useBadge(undefined, "no-match", "my-group"));

    expect(result.value.content).toBe(2);
    expect(result.value.variant).toBe("warning");
  });

  it("direct config takes priority over registry", () => {
    mockBadges.value.set("my-route", { content: 99 });
    const { result } = mountWithSetup(() => useBadge({ content: 1 }, "my-route"));

    expect(result.value.content).toBe(1);
  });

  it("defaults variant to primary", () => {
    const { result } = mountWithSetup(() => useBadge({ content: 5 }));

    expect(result.value.variant).toBe("primary");
  });
});
