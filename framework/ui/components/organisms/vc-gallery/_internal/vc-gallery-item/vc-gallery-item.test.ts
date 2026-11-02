import { beforeAll, describe, expect, it, vi } from "vitest";

// Use real vue-i18n — this test uses createI18n with real messages
vi.unmock("vue-i18n");

import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import VcGalleryItem from "./vc-gallery-item.vue";

const i18n = createI18n({ legacy: false, locale: "en", fallbackWarn: false, missingWarn: false, messages: { en: {} } });

beforeAll(() => {
  if (!window.matchMedia) {
    // jsdom fallback for touch/hover detection in component click handler
    window.matchMedia = (query: string) =>
      ({
        matches: query === "(hover: none)",
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList;
  }
});

describe("VcGalleryItem actions", () => {
  it("emits preview/edit/remove on action button click", async () => {
    const wrapper = mount(VcGalleryItem, {
      props: {
        image: { id: "1", name: "image.jpg", url: "https://example.com/image.jpg" },
        readonly: false,
      },
      global: {
        plugins: [i18n],
      },
    });

    const buttons = wrapper.findAll(".vc-image-tile-action");
    expect(buttons.length).toBe(3);

    await buttons[0].trigger("click");
    await buttons[1].trigger("click");
    await buttons[2].trigger("click");

    expect(wrapper.emitted("preview")?.length).toBe(1);
    expect(wrapper.emitted("edit")?.length).toBe(1);
    expect(wrapper.emitted("remove")?.length).toBe(1);
  });

  describe("thumbnails", () => {
    const tileSize = (image: Record<string, unknown>) =>
      mount(VcGalleryItem, { props: { image, thumbnailSize: "216x216" }, global: { plugins: [i18n] } })
        .findComponent({ name: "VcImageTile" })
        .props("thumbnailSize");

    it("asks for a thumbnail of a file the platform stores", () => {
      expect(
        tileSize({ url: "https://shop.test/cms-content/assets/catalog/a.jpg", relativeUrl: "/catalog/a.jpg" }),
      ).toBe("216x216");
      expect(
        tileSize({ url: "https://shop.test/cms-content/assets//catalog/a.jpg", relativeUrl: "//catalog/a.jpg" }),
      ).toBe("216x216");
    });

    it("shows the original of an image linked from another host", () => {
      const url = "https://i.etsystatic.com/1/r/il/a.jpg";
      expect(tileSize({ url, relativeUrl: url })).toBeUndefined();
    });

    it("keeps the thumbnail when the image has no relativeUrl", () => {
      expect(tileSize({ url: "https://cdn.test/a.jpg" })).toBe("216x216");
    });
  });
});
