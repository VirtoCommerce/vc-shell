import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcImageTile from "@ui/components/molecules/vc-image-tile/vc-image-tile.vue";

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useImageLoad
vi.mock("@ui/components/organisms/vc-gallery/composables/useImageLoad", () => ({
  useImageLoad: () => ({
    isLoaded: { value: true },
    hasError: { value: false },
    onLoad: vi.fn(),
    onError: vi.fn(),
  }),
}));

// Mock vueuse click-outside directive
vi.mock("@vueuse/components", () => ({
  vOnClickOutside: {
    mounted: () => {},
    unmounted: () => {},
  },
}));

describe("VcImageTile", () => {
  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(VcImageTile as any, {
      props,
      global: {
        stubs: {
          VcIcon: true,
        },
        directives: {
          "on-click-outside": () => {},
        },
      },
    });

  it("renders correctly", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-image-tile").exists()).toBe(true);
  });

  it("renders image with src and alt", () => {
    const wrapper = mountComponent({ src: "test.jpg", alt: "Test image" });
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("test.jpg");
    expect(img.attributes("alt")).toBe("Test image");
  });

  it("does not render image when src is not provided", () => {
    const wrapper = mountComponent();
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("renders name in tray when provided", () => {
    const wrapper = mountComponent({ name: "photo.jpg" });
    expect(wrapper.find(".vc-image-tile__name").exists()).toBe(true);
    expect(wrapper.find(".vc-image-tile__name").text()).toBe("photo.jpg");
  });

  it("does not render name when not provided", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-image-tile__name").exists()).toBe(false);
  });

  it("renders preview action button by default", () => {
    const wrapper = mountComponent();
    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders edit button when actions.edit is true", () => {
    const wrapper = mountComponent({ actions: { edit: true } });
    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("renders remove button when actions.remove is true", () => {
    const wrapper = mountComponent({ actions: { remove: true } });
    const buttons = wrapper.findAll("button.vc-image-tile-action--danger");
    expect(buttons.length).toBe(1);
  });

  it("emits preview when preview button is clicked", async () => {
    const wrapper = mountComponent();
    const previewBtn = wrapper.findAll("button")[0];
    await previewBtn.trigger("click");
    expect(wrapper.emitted("preview")).toBeTruthy();
  });

  it("emits remove when remove button is clicked", async () => {
    const wrapper = mountComponent({ actions: { remove: true } });
    const removeBtn = wrapper.find("button.vc-image-tile-action--danger");
    await removeBtn.trigger("click");
    expect(wrapper.emitted("remove")).toBeTruthy();
  });

  it("applies contain as default imageFit", () => {
    const wrapper = mountComponent({ src: "test.jpg" });
    const img = wrapper.find("img");
    expect(img.attributes("style")).toContain("contain");
  });

  it("applies cover imageFit", () => {
    const wrapper = mountComponent({ src: "test.jpg", imageFit: "cover" });
    const img = wrapper.find("img");
    expect(img.attributes("style")).toContain("cover");
  });
});
