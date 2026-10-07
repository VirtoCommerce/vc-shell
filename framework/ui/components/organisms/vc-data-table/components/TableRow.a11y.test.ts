import { afterEach, describe, expect, it, vi } from "vitest";

// Use real vue-i18n — this test uses createI18n with real messages
vi.unmock("vue-i18n");

import { mount, VueWrapper } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import TableRow from "@ui/components/organisms/vc-data-table/components/TableRow.vue";

const i18n = createI18n({ legacy: false, locale: "en", fallbackWarn: false, missingWarn: false, messages: { en: {} } });

describe("TableRow keyboard a11y", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  it("clickable rows have tabindex=0", () => {
    wrapper = mount(TableRow, {
      props: { clickable: true },
      global: { plugins: [i18n] },
    });
    expect(wrapper.attributes("tabindex")).toBe("0");
  });

  it("non-clickable rows do not have tabindex", () => {
    wrapper = mount(TableRow, {
      props: { clickable: false },
      global: { plugins: [i18n] },
    });
    expect(wrapper.attributes("tabindex")).toBeUndefined();
  });

  it("non-clickable rows (no clickable prop) do not have tabindex", () => {
    wrapper = mount(TableRow, {
      props: {},
      global: { plugins: [i18n] },
    });
    expect(wrapper.attributes("tabindex")).toBeUndefined();
  });
  // Keys typed into a control inside a cell belong to that control. The row listens for Space and Enter
  // only when it is itself focused: a row that swallowed them stopped switches and checkboxes in cells
  // from toggling with Space, and turned Enter in a cell input into a row click.
  describe("keys from controls inside a cell", () => {
    function mountWithCellControls() {
      return mount(TableRow, {
        props: { clickable: true },
        slots: {
          default: '<input type="checkbox" data-test="cell-checkbox" /><input type="text" data-test="cell-input" />',
        },
        global: { plugins: [i18n] },
        attachTo: document.body,
      });
    }

    it("Space on a focused row is the row's: it emits space-press and is prevented", async () => {
      wrapper = mountWithCellControls();
      const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
      wrapper.element.dispatchEvent(event);

      expect(wrapper.emitted("space-press")).toHaveLength(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it("Space on a checkbox inside a cell is left to the checkbox: not prevented, no space-press", async () => {
      wrapper = mountWithCellControls();
      const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
      wrapper.find('[data-test="cell-checkbox"]').element.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
      expect(wrapper.emitted("space-press")).toBeUndefined();
    });

    it("Enter on a focused row clicks it", async () => {
      wrapper = mountWithCellControls();
      wrapper.element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

      expect(wrapper.emitted("click")).toHaveLength(1);
    });

    it("Enter in an input inside a cell does not click the row and is not prevented", async () => {
      wrapper = mountWithCellControls();
      const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
      wrapper.find('[data-test="cell-input"]').element.dispatchEvent(event);

      expect(wrapper.emitted("click")).toBeUndefined();
      expect(event.defaultPrevented).toBe(false);
    });
  });
});
