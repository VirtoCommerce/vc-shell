import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import VcGalleryPreview from "./vc-gallery-preview.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@framework/core/composables/useResponsive", () => {
  const { ref } = require("vue");
  return {
    useResponsive: () => ({
      isMobile: ref(false),
      isDesktop: ref(true),
    }),
  };
});

vi.mock("@ui/components/organisms/vc-popup", () => ({
  VcPopup: defineComponent({
    name: "VcPopup",
    props: ["isMobileFullscreen", "modalWidth"],
    emits: ["close"],
    setup(_, { slots, emit: _emit }) {
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

// Mock Swiper — render slides directly without actual Swiper behavior
vi.mock("swiper/vue", () => ({
  Swiper: defineComponent({
    name: "Swiper",
    emits: ["swiper", "slideChange"],
    setup(_, { slots, emit: _emit }) {
      return () => h("div", { class: "mock-swiper" }, slots.default?.());
    },
  }),
  SwiperSlide: defineComponent({
    name: "SwiperSlide",
    setup(_, { slots }) {
      return () => h("div", { class: "mock-swiper-slide" }, slots.default?.());
    },
  }),
}));

vi.mock("swiper/modules", () => ({
  Keyboard: {},
  FreeMode: {},
}));

vi.mock("swiper/css", () => ({}));

const images = [
  { url: "https://example.com/img1.jpg", name: "Image 1", altText: "Alt 1" },
  { url: "https://example.com/img2.jpg", name: "Image 2", altText: "Alt 2" },
  { url: "https://example.com/img3.jpg", name: "Image 3", altText: "Alt 3" },
];

describe("vc-gallery-preview.vue", () => {
  beforeEach(() => {
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

  it("renders popup with images when images provided", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 0 },
    });
    expect(wrapper.find(".mock-popup").exists()).toBe(true);
    // All images rendered as swiper slides
    const imgs = wrapper.findAll(".vc-gallery-preview__image");
    expect(imgs.length).toBe(3);
    expect(imgs[0].attributes("src")).toBe(images[0].url);
  });

  it("displays current image name in header", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 1 },
    });
    expect(wrapper.find(".vc-gallery-preview__filename").text()).toBe("Image 2");
  });

  it("shows nav buttons on desktop when not at edges", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 1 },
    });
    expect(wrapper.find(".vc-gallery-preview__nav--prev").exists()).toBe(true);
    expect(wrapper.find(".vc-gallery-preview__nav--next").exists()).toBe(true);
  });

  it("hides prev button at first image", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 0 },
    });
    expect(wrapper.find(".vc-gallery-preview__nav--prev").exists()).toBe(false);
  });

  it("hides next button at last image", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 2 },
    });
    expect(wrapper.find(".vc-gallery-preview__nav--next").exists()).toBe(false);
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

  it("marks active thumbnail based on index", () => {
    const wrapper = mount(VcGalleryPreview, {
      props: { images, index: 1 },
    });
    const thumbs = wrapper.findAll(".vc-gallery-preview__thumb");
    expect(thumbs[1].classes()).toContain("vc-gallery-preview__thumb--active");
    expect(thumbs[0].classes()).not.toContain("vc-gallery-preview__thumb--active");
  });
});
