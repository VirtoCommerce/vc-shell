import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";

import VcTableEmpty from "./vc-table-empty.vue";

function factory(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(VcTableEmpty, {
    props: {
      items: [],
      columnsInit: false,
      ...props,
    },
    slots,
    global: {
      stubs: {
        VcIcon: {
          name: "VcIcon",
          props: ["icon", "size", "class"],
          template: '<i class="vc-icon-stub" />',
        },
        VcButton: {
          name: "VcButton",
          template: '<button class="vc-button-stub"><slot /></button>',
        },
      },
      mocks: {
        $t: (key: string) => key,
        $isMobile: ref(false),
        $isDesktop: ref(true),
      },
    },
  });
}

describe("VcTableEmpty", () => {
  it("renders empty state when items is empty and no search", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-table-empty--default").exists()).toBe(true);
  });

  it("renders default empty text from i18n", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-table-empty__text").text()).toBe("COMPONENTS.ORGANISMS.VC_TABLE.EMPTY");
  });

  it("renders custom empty text", () => {
    const wrapper = factory({ empty: { text: "No items yet" } });
    expect(wrapper.find(".vc-table-empty__text").text()).toBe("No items yet");
  });

  it("renders empty icon when provided", () => {
    const wrapper = factory({ empty: { icon: "lucide-inbox", text: "Empty" } });
    // VcIcon is rendered with a class binding; check for the stub inside vc-table-empty
    expect(wrapper.find(".vc-icon-stub").exists()).toBe(true);
  });

  it("hides empty icon when not provided", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-table-empty__icon").exists()).toBe(false);
  });

  it("renders empty action button when provided", () => {
    const handler = vi.fn();
    const wrapper = factory({
      empty: { text: "Empty", action: "Create One", clickHandler: handler },
    });
    expect(wrapper.find(".vc-button-stub").text()).toBe("Create One");
  });

  it("renders not-found state when searchValue is set", () => {
    const wrapper = factory({ searchValue: "xyz" });
    expect(wrapper.find(".vc-table-empty").exists()).toBe(true);
    // The not-found state uses vc-table-empty class (not --default)
    expect(wrapper.find(".vc-table-empty--default").exists()).toBe(false);
  });

  it("renders not-found state when activeFilterCount > 0", () => {
    const wrapper = factory({ activeFilterCount: 2 });
    expect(wrapper.find(".vc-table-empty").exists()).toBe(true);
    expect(wrapper.find(".vc-table-empty--default").exists()).toBe(false);
  });

  it("renders default not-found text from i18n", () => {
    const wrapper = factory({ searchValue: "xyz" });
    expect(wrapper.find(".vc-table-empty__text").text()).toBe("COMPONENTS.ORGANISMS.VC_TABLE.NOT_FOUND");
  });

  it("renders custom not-found text", () => {
    const wrapper = factory({
      searchValue: "xyz",
      notfound: { text: "Nothing matches your search" },
    });
    expect(wrapper.find(".vc-table-empty__text").text()).toBe("Nothing matches your search");
  });

  it("renders not-found action button when provided", () => {
    const handler = vi.fn();
    const wrapper = factory({
      searchValue: "xyz",
      notfound: { text: "Not found", action: "Clear Search", clickHandler: handler },
    });
    expect(wrapper.find(".vc-button-stub").text()).toBe("Clear Search");
  });

  it("hides content when items exist and columnsInit is false", () => {
    // When items has data and columnsInit=false, the outer v-if hides everything
    const wrapper = factory({ items: [{ id: 1 }], columnsInit: false });
    expect(wrapper.find(".vc-table-empty").exists()).toBe(false);
  });

  it("renders custom empty slot", () => {
    const wrapper = factory({}, { empty: '<div class="custom-empty">Custom Empty</div>' });
    expect(wrapper.find(".custom-empty").exists()).toBe(true);
  });

  it("renders custom notfound slot", () => {
    const wrapper = factory(
      { searchValue: "abc" },
      { notfound: '<div class="custom-notfound">Custom Not Found</div>' },
    );
    expect(wrapper.find(".custom-notfound").exists()).toBe(true);
  });
});
