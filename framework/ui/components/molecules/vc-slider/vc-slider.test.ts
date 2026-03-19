import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcSlider from "@ui/components/molecules/vc-slider/vc-slider.vue";

// Mock swiper
vi.mock("swiper/vue", () => ({
  Swiper: {
    name: "Swiper",
    template: '<div class="mock-swiper"><slot /></div>',
    props: ["modules", "spaceBetween", "navigation", "slidesPerView", "observer", "observeParents"],
  },
  SwiperSlide: {
    name: "SwiperSlide",
    template: '<div class="mock-swiper-slide"><slot /></div>',
  },
}));
vi.mock("swiper/modules", () => ({ Navigation: {} }));
vi.mock("swiper/css", () => ({}));
vi.mock("swiper/css/navigation", () => ({}));

describe("VcSlider", () => {
  const slides = [{ title: "Slide 1" }, { title: "Slide 2" }, { title: "Slide 3" }];

  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(VcSlider as any, {
      props: { slides, ...props },
      global: {
        stubs: {
          VcIcon: true,
        },
      },
    });

  it("renders correctly", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-slider").exists()).toBe(true);
  });

  it("renders swiper component", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".mock-swiper").exists()).toBe(true);
  });

  it("renders correct number of slides", () => {
    const wrapper = mountComponent();
    expect(wrapper.findAll(".mock-swiper-slide")).toHaveLength(3);
  });

  it("renders with empty slides", () => {
    const wrapper = mountComponent({ slides: [] });
    expect(wrapper.findAll(".mock-swiper-slide")).toHaveLength(0);
  });

  it("renders navigation buttons when navigation is true", () => {
    const wrapper = mountComponent({ navigation: true });
    expect(wrapper.find(".vc-slider__prev").exists()).toBe(true);
    expect(wrapper.find(".vc-slider__next").exists()).toBe(true);
  });

  it("sets aria-label from prop", () => {
    const wrapper = mountComponent({ ariaLabel: "Product gallery" });
    expect(wrapper.find("[role='region']").attributes("aria-label")).toBe("Product gallery");
  });

  it("uses default aria-label", () => {
    const wrapper = mountComponent();
    expect(wrapper.find("[role='region']").attributes("aria-label")).toBe("Content carousel");
  });

  it("has previous and next navigation buttons with aria-labels", () => {
    const wrapper = mountComponent({ navigation: true });
    expect(wrapper.find('button[aria-label="Previous slide"]').exists()).toBe(true);
    expect(wrapper.find('button[aria-label="Next slide"]').exists()).toBe(true);
  });
});
