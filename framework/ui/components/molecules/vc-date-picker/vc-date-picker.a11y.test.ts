import { afterEach, describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
import { createI18n } from "vue-i18n";
import { ref } from "vue";
import VcDatePicker from "@ui/components/molecules/vc-date-picker/vc-date-picker.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      COMPONENTS: {
        MOLECULES: { VC_INPUT: { DATE_TIME_PLACEHOLDER: "Select date & time", DATE_PLACEHOLDER: "Select date" } },
      },
    },
  },
});

describe("VcDatePicker a11y", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountDatePicker = (props: Record<string, unknown> = {}) => {
    wrapper = mount(VcDatePicker as any, {
      props: { modelValue: null, ...props },
      global: {
        plugins: [i18n],
        stubs: {
          VcIcon: true,
          // Stub the heavy VueDatePicker third-party component
          VueDatePicker: {
            template: '<input type="text" aria-label="Date picker input" class="vc-date-picker__stub" />',
          },
        },
        config: {
          globalProperties: {
            $isMobile: ref(false),
            $isDesktop: ref(true),
          },
        },
      },
      attachTo: document.body,
    });
    return wrapper;
  };

  it("has no a11y violations in default state with label", async () => {
    const w = mountDatePicker({ label: "Date" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations when required", async () => {
    const w = mountDatePicker({ label: "Start date", required: true });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations in error state", async () => {
    const w = mountDatePicker({ label: "End date", error: true, errorMessage: "Date is required" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });
});
