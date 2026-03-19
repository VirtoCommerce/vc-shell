import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import VcPagination from "@ui/components/molecules/vc-pagination/vc-pagination.vue";
import { IsMobileKey } from "@framework/injection-keys";

describe("VcPagination", () => {
  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(VcPagination as any, {
      props: { pages: 10, currentPage: 1, ...props },
      global: {
        provide: {
          [IsMobileKey as symbol]: ref(false),
        },
        stubs: {
          VcIcon: true,
        },
      },
    });

  it("renders correctly", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-pagination").exists()).toBe(true);
  });

  it("has navigation aria-label", () => {
    const wrapper = mountComponent();
    expect(wrapper.find("nav").attributes("aria-label")).toBe("Pagination");
  });

  it("renders page buttons", () => {
    const wrapper = mountComponent({ pages: 5 });
    const pageButtons = wrapper.findAll("button").filter((b) => {
      const label = b.attributes("aria-label");
      return label && label.startsWith("Page ");
    });
    expect(pageButtons.length).toBe(5);
  });

  it("highlights current page", () => {
    const wrapper = mountComponent({ currentPage: 3 });
    const currentBtn = wrapper.find("button.vc-pagination__item--current");
    expect(currentBtn.exists()).toBe(true);
    expect(currentBtn.text()).toBe("3");
  });

  it("disables previous button on first page", () => {
    const wrapper = mountComponent({ currentPage: 1 });
    const prevBtn = wrapper.find('button[aria-label="Previous page"]');
    expect(prevBtn.attributes("disabled")).toBeDefined();
  });

  it("disables next button on last page", () => {
    const wrapper = mountComponent({ pages: 5, currentPage: 5 });
    const nextBtn = wrapper.find('button[aria-label="Next page"]');
    expect(nextBtn.attributes("disabled")).toBeDefined();
  });

  it("enables previous button when not on first page", () => {
    const wrapper = mountComponent({ currentPage: 3 });
    const prevBtn = wrapper.find('button[aria-label="Previous page"]');
    expect(prevBtn.attributes("disabled")).toBeUndefined();
  });

  it("emits itemClick with page number when page is clicked", async () => {
    const wrapper = mountComponent({ pages: 5, currentPage: 1 });
    const page3Btn = wrapper.find('button[aria-label="Page 3"]');
    await page3Btn.trigger("click");
    expect(wrapper.emitted("itemClick")).toBeTruthy();
    expect(wrapper.emitted("itemClick")![0]).toEqual([3]);
  });

  it("shows first/last buttons by default", () => {
    const wrapper = mountComponent();
    expect(wrapper.find('button[aria-label="First page"]').exists()).toBe(true);
    expect(wrapper.find('button[aria-label="Last page"]').exists()).toBe(true);
  });

  it("disables first button on first page", () => {
    const wrapper = mountComponent({ currentPage: 1 });
    const firstBtn = wrapper.find('button[aria-label="First page"]');
    expect(firstBtn.attributes("disabled")).toBeDefined();
  });

  it("disables last button on last page", () => {
    const wrapper = mountComponent({ pages: 5, currentPage: 5 });
    const lastBtn = wrapper.find('button[aria-label="Last page"]');
    expect(lastBtn.attributes("disabled")).toBeDefined();
  });

  it("renders with maxPages override", () => {
    const wrapper = mountComponent({ pages: 20, maxPages: 3, currentPage: 10 });
    const pageButtons = wrapper.findAll("button").filter((b) => {
      const label = b.attributes("aria-label");
      return label && label.startsWith("Page ");
    });
    expect(pageButtons.length).toBe(3);
  });

  it("navigates to previous page", async () => {
    const wrapper = mountComponent({ currentPage: 3 });
    const prevBtn = wrapper.find('button[aria-label="Previous page"]');
    await prevBtn.trigger("click");
    expect(wrapper.emitted("itemClick")).toBeTruthy();
    expect(wrapper.emitted("itemClick")![0]).toEqual([2]);
  });

  it("navigates to next page", async () => {
    const wrapper = mountComponent({ currentPage: 3 });
    const nextBtn = wrapper.find('button[aria-label="Next page"]');
    await nextBtn.trigger("click");
    expect(wrapper.emitted("itemClick")).toBeTruthy();
    expect(wrapper.emitted("itemClick")![0]).toEqual([4]);
  });

  it("renders single page correctly", () => {
    const wrapper = mountComponent({ pages: 1, currentPage: 1 });
    const pageButtons = wrapper.findAll("button").filter((b) => {
      const label = b.attributes("aria-label");
      return label && label.startsWith("Page ");
    });
    expect(pageButtons.length).toBe(1);
  });
});
