import { describe, expect, it, vi } from "vitest";

vi.unmock("vue-i18n");

// useSelectVisibility observes the select itself; jsdom has no IntersectionObserver at all.
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Capture how the load-more trigger is observed; jsdom has no layout to intersect with.
const observed = vi.hoisted(() => [] as { threshold?: number | number[]; rootMargin?: string }[]);

vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();
  return {
    ...actual,
    useIntersectionObserver: (
      target: unknown,
      callback: unknown,
      options: { threshold?: number; rootMargin?: string } = {},
    ) => {
      observed.push(options);
      return {
        isSupported: { value: true },
        stop: () => {},
        pause: () => {},
        resume: () => {},
        isActive: { value: true },
      };
    },
  };
});

import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import VcSelect from "@ui/components/molecules/vc-select/vc-select.vue";

const i18n = createI18n({ legacy: false, locale: "en", fallbackWarn: false, missingWarn: false, messages: { en: {} } });

describe("VcSelect load-more trigger", () => {
  it("loads the next page once any part of the trigger shows, not only all of it", () => {
    mount(VcSelect as any, {
      props: { modelValue: null, options: [] },
      global: { plugins: [i18n], stubs: { VcIcon: true, teleport: true } },
    });

    // threshold 1 on a 1px trigger never fires under a fractional zoom: scrolled to the end, the
    // trigger still sits a fraction of a pixel past the viewport (measured at 80% and 90%).
    expect(observed).toHaveLength(1);
    expect(observed[0].threshold).toBe(0);
    expect(observed[0].rootMargin).toMatch(/^0px 0px [1-9]\d*px 0px$/);
  });
});
