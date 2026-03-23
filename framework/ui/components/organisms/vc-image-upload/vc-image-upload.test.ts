import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useGalleryPreview
vi.mock("@ui/components/organisms/vc-gallery/composables/useGalleryPreview", () => ({
  useGalleryPreview: () => ({
    openPreview: vi.fn(),
  }),
}));

import VcImageUpload from "./vc-image-upload.vue";

const sampleImage = {
  url: "https://example.com/image.jpg",
  name: "test-image.jpg",
  altText: "A test image",
};

function factory(props: Record<string, unknown> = {}) {
  return mount(VcImageUpload, {
    props,
    global: {
      stubs: {
        VcImageTile: {
          name: "VcImageTile",
          props: ["src", "alt", "name", "imageFit", "actions"],
          template:
            '<div class="vc-image-tile-stub" @click="$emit(\'preview\')" ><button class="remove-btn" @click.stop="$emit(\'remove\')">remove</button></div>',
        },
        VcFileUpload: {
          name: "VcFileUpload",
          props: ["icon", "multiple", "rules", "name", "loading", "accept", "customText"],
          template: '<div class="vc-file-upload-stub"></div>',
        },
        VcHint: {
          name: "VcHint",
          template: '<span class="vc-hint-stub"><slot /></span>',
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

describe("VcImageUpload", () => {
  it("renders VcImageTile when image with url is provided", () => {
    const wrapper = factory({ image: sampleImage });
    expect(wrapper.find(".vc-image-tile-stub").exists()).toBe(true);
    expect(wrapper.find(".vc-file-upload-stub").exists()).toBe(false);
  });

  it("renders VcFileUpload when no image is provided and not disabled", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-file-upload-stub").exists()).toBe(true);
    expect(wrapper.find(".vc-image-tile-stub").exists()).toBe(false);
  });

  it("renders empty hint when disabled and no image", () => {
    const wrapper = factory({ disabled: true });
    expect(wrapper.find(".vc-image-upload__empty").exists()).toBe(true);
    expect(wrapper.find(".vc-hint-stub").exists()).toBe(true);
  });

  it("does not render VcFileUpload when disabled and no image", () => {
    const wrapper = factory({ disabled: true });
    expect(wrapper.find(".vc-file-upload-stub").exists()).toBe(false);
  });

  it("emits remove when VcImageTile emits remove", async () => {
    const wrapper = factory({ image: sampleImage });
    await wrapper.find(".remove-btn").trigger("click");
    expect(wrapper.emitted("remove")).toBeTruthy();
    expect(wrapper.emitted("remove")![0]).toEqual([sampleImage]);
  });

  it("renders image tile with correct src", () => {
    const wrapper = factory({ image: sampleImage });
    const tile = wrapper.findComponent({ name: "VcImageTile" });
    expect(tile.props("src")).toBe("https://example.com/image.jpg");
  });

  it("uses altText from image for alt prop", () => {
    const wrapper = factory({ image: sampleImage });
    const tile = wrapper.findComponent({ name: "VcImageTile" });
    expect(tile.props("alt")).toBe("A test image");
  });

  it("falls back to image name when altText is missing", () => {
    const wrapper = factory({ image: { url: "https://example.com/img.png", name: "fallback-name" } });
    const tile = wrapper.findComponent({ name: "VcImageTile" });
    expect(tile.props("alt")).toBe("fallback-name");
  });

  it("resolves actions with previewable and removable defaults", () => {
    const wrapper = factory({ image: sampleImage });
    const tile = wrapper.findComponent({ name: "VcImageTile" });
    expect(tile.props("actions")).toEqual({ preview: true, remove: true });
  });

  it("disables remove action when disabled=true", () => {
    const wrapper = factory({ image: sampleImage, disabled: true });
    const tile = wrapper.findComponent({ name: "VcImageTile" });
    expect(tile.props("actions")).toEqual({ preview: true, remove: false });
  });

  it("hides preview action when previewable=false", () => {
    const wrapper = factory({ image: sampleImage, previewable: false });
    const tile = wrapper.findComponent({ name: "VcImageTile" });
    expect(tile.props("actions").preview).toBe(false);
  });

  it("hides remove action when removable=false", () => {
    const wrapper = factory({ image: sampleImage, removable: false });
    const tile = wrapper.findComponent({ name: "VcImageTile" });
    expect(tile.props("actions").remove).toBe(false);
  });
});
