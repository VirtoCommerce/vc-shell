import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// Use real vue-i18n — this test uses createI18n with real messages
vi.unmock("vue-i18n");

import { mount, VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
import { createI18n } from "vue-i18n";
import VcPopup from "@ui/components/organisms/vc-popup/vc-popup.vue";

// HeadlessUI Dialog uses ResizeObserver internally; provide a no-op stub for jsdom
beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
  }
});

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      COMPONENTS: {
        ORGANISMS: {
          VC_POPUP: {
            CLOSE: "Close",
          },
        },
      },
    },
  },
});

describe("VcPopup a11y", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountPopup = (props: Record<string, unknown> = {}) => {
    wrapper = mount(VcPopup as any, {
      props: {
        // Test open state — closed popup renders nothing, open state is the meaningful a11y surface
        modelValue: true,
        title: "Confirm Action",
        ...props,
      },
      global: {
        plugins: [i18n],
        stubs: {
          VcIcon: true,
          VcButton: true,
          // Stub HeadlessUI transitions to render slot content directly in jsdom.
          // The real TransitionRoot/TransitionChild can cause ResizeObserver errors.
          TransitionRoot: {
            template: "<div><slot /></div>",
          },
          TransitionChild: {
            template: "<div><slot /></div>",
          },
          // Stub Dialog + DialogPanel + DialogTitle with proper ARIA dialog structure.
          // HeadlessUI Dialog's focus trap doesn't work in jsdom (Phase 10 deferred).
          // aria-labelledby links dialog to its title for the aria-dialog-name axe rule.
          Dialog: {
            template: '<div role="dialog" aria-modal="true" aria-labelledby="vc-popup-title-stub"><slot /></div>',
          },
          DialogPanel: {
            template: "<div><slot /></div>",
          },
          DialogTitle: {
            template: '<h3 id="vc-popup-title-stub"><slot /></h3>',
          },
        },
      },
      attachTo: document.body,
    });
    return wrapper;
  };

  it("has no a11y violations in open state with title", async () => {
    const w = mountPopup({ title: "Confirm Action" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations with closable button", async () => {
    const w = mountPopup({ title: "Delete Item", closable: true });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });
});
