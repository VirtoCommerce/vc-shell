import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { mountWithSetup, expectNoVueWarnings } from "@framework/test-helpers";

// ── Mock useApiClient to avoid real HTTP calls ────────────────────────────────
// useSettings calls getUICustomizationSetting inside onMounted.
// We mock the API client layer so tests run without a network.

const mockGetUICustomizationSetting = vi.fn();

vi.mock("@core/composables/useApiClient", () => ({
  useApiClient: () => ({
    getApiClient: vi.fn().mockResolvedValue({
      getUICustomizationSetting: mockGetUICustomizationSetting,
    }),
  }),
}));

// Import after mocks are registered
import { useSettings } from "./index";

beforeEach(() => {
  mockGetUICustomizationSetting.mockReset();
  // Default: API returns null — no remote settings
  mockGetUICustomizationSetting.mockResolvedValue({ defaultValue: null });
});

// ── useSettings() ─────────────────────────────────────────────────────────────

describe("useSettings()", () => {
  it("returns expected interface (uiSettings ref, applySettings function, loading computed)", () => {
    const { result } = mountWithSetup(() => useSettings());
    // uiSettings is a Ref (has .value)
    expect(result.uiSettings).toBeDefined();
    expect(typeof result.uiSettings.value).toBe("object");
    // applySettings is a function
    expect(typeof result.applySettings).toBe("function");
    // loading is a ComputedRef (has .value)
    expect(result.loading).toBeDefined();
    expect(typeof result.loading.value).toBe("boolean");
  });

  it("applySettings(overrides) updates uiSettings with the supplied values", async () => {
    const { result, wrapper } = mountWithSetup(() => useSettings());
    await wrapper.vm.$nextTick();

    result.applySettings({ logo: "logo.png", title: "My App", avatar: "av.png", role: "admin" });

    expect(result.uiSettings.value.logo).toBe("logo.png");
    expect(result.uiSettings.value.title).toBe("My App");
    expect(result.uiSettings.value.avatar).toBe("av.png");
    expect(result.uiSettings.value.role).toBe("admin");
  });

  it("uiSettings is empty object initially (no remote settings returned)", async () => {
    mockGetUICustomizationSetting.mockResolvedValue({ defaultValue: null });
    const { result, wrapper } = mountWithSetup(() => useSettings());
    // Before onMounted fires, should be empty
    expect(result.uiSettings.value).toEqual({});
    await wrapper.vm.$nextTick();
    // After onMounted and API call with null, still empty
    expect(result.uiSettings.value).toEqual({});
  });
});

// ── cleanup ────────────────────────────────────────────────────────────────────

describe("cleanup", () => {
  it("unmount() produces no Vue warnings (onMounted lifecycle handled cleanly)", async () => {
    // Critical: useSettings uses onMounted (async). We must await nextTick so the
    // mounted hook fires before we unmount — otherwise we get a false green
    // (unmount before the hook runs, so no warnings emitted yet).
    await expectNoVueWarnings(async () => {
      const Comp = defineComponent({
        setup() {
          useSettings();
          return () => h("div");
        },
      });
      const wrapper = mount(Comp);
      // Let onMounted fire and the async API call resolve
      await wrapper.vm.$nextTick();
      wrapper.unmount();
    });
  });
});
