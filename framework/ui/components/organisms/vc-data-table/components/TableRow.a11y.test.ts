import { afterEach, describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import TableRow from "@ui/components/organisms/vc-data-table/components/TableRow.vue";

const i18n = createI18n({ legacy: false, locale: "en", messages: { en: {} } });

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
});
