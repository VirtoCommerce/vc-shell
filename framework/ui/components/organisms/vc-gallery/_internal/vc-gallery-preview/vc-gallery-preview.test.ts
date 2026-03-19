import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref, nextTick } from "vue";
import VcGalleryPreview from "./vc-gallery-preview.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@ui/components/organisms/vc-popup", () => ({
  VcPopup: defineComponent({
    name: "VcPopup",
    props: ["isMobileFullscreen", "modalWidth"],
    emits: ["close"],
    setup(_, { slots, emit }) {
      return () =>
        h("div", { class: "mock-popup" }, [
          h("div", { class: "mock-popup-header" }, slots.header?.()),
          h("div", { class: "mock-popup-content" }, slots.content?.()),
        ]);
    },
  }),
}));

vi.mock("@ui/components/atoms/vc-icon", () => ({
  VcIcon: defineComponent({
    name: "VcIcon",
    props: ["icon", "size"],
    setup(props) {
      return () => h("i", { class: `mock-icon ${props.icon}` });
    },
  }),
}));

const images = [
  { url: "https://example.com/img1.jpg", name: "Image 1", altText: "Alt 1" },
  { url: "https://example.com/img2.jpg", name: "Image 2", altText: "Alt 2" },
  { url: "https://example.com/img3.jpg", name: "Image 3", altText: "Alt 3" },
];

describe("vc-gallery-preview.vue", () => {
  beforeEach(() => {
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("renders nothing when images is empty", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images: [], index: 0 },
    });
    expect(wrapper.find(".mock-popup").exists()).toBe(false);
  });

  it("renders popup with image when images provided", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 0 },
    });
    expect(wrapper.find(".mock-popup").exists()).toBe(true);
    expect(wrapper.find(".vc-gallery-preview__image").attributes("src")).toBe(images[0].url);
  });

  it("displays current image name in header", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 1 },
    });
    expect(wrapper.find(".vc-gallery-preview__filename").text()).toBe("Image 2");
  });

  it("shows next button when not at last image", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 0 },
    });
    expect(wrapper.find(".vc-gallery-preview__nav--next").exists()).toBe(true);
  });

  it("hides prev button at first image", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 0 },
    });
    expect(wrapper.find(".vc-gallery-preview__nav--prev").exists()).toBe(false);
  });

  it("navigates to next image on next button click", async () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 0 },
    });
    await wrapper.find(".vc-gallery-preview__nav--next").trigger("click");
    await nextTick();
    expect(wrapper.find(".vc-gallery-preview__image").attributes("src")).toBe(images[1].url);
  });

  it("renders thumbnail strip when multiple images", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 0 },
    });
    expect(wrapper.find(".vc-gallery-preview__filmstrip").exists()).toBe(true);
    expect(wrapper.findAll(".vc-gallery-preview__thumb").length).toBe(3);
  });

  it("does not render thumbnail strip for single image", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images: [images[0]], index: 0 },
    });
    expect(wrapper.find(".vc-gallery-preview__filmstrip").exists()).toBe(false);
  });

  it("shows counter with current/total", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 1 },
    });
    const counter = wrapper.find(".vc-gallery-preview__counter");
    expect(counter.text()).toContain("2");
    expect(counter.text()).toContain("3");
  });

  it("copies link to clipboard on copy button click", async () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 0 },
    });
    await wrapper.find(".vc-gallery-preview__action-btn").trigger("click");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(images[0].url);
  });

  it("handles keyboard ArrowRight navigation", async () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 0 },
      attachTo: document.body,
    });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    await nextTick();
    expect(wrapper.find(".vc-gallery-preview__image").attributes("src")).toBe(images[1].url);
    wrapper.unmount();
  });

  it("emits close on Escape key", async () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 0 },
      attachTo: document.body,
    });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();
    expect(wrapper.emitted("close")).toBeTruthy();
    wrapper.unmount();
  });
});
