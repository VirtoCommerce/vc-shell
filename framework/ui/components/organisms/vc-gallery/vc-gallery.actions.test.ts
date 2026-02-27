import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { createI18n } from "vue-i18n";
import VcGallery from "./vc-gallery.vue";

const openPreview = vi.fn();

vi.mock("./composables/useGalleryPreview", () => ({
  useGalleryPreview: () => ({
    openPreview,
  }),
}));

const i18n = createI18n({ legacy: false, locale: "en", messages: { en: {} } });

describe("VcGallery item actions", () => {
  it("triggers preview callback and emits edit/remove from item slot actions", async () => {
    openPreview.mockReset();

    const wrapper = mount(VcGallery, {
      props: {
        images: [{ id: "1", name: "photo.jpg", url: "https://example.com/photo.jpg", sortOrder: 0 }],
      },
      slots: {
        item: ({ actions }: { actions: { preview: () => void; edit: () => void; remove: () => void } }) =>
          h("div", [
            h(
              "button",
              {
                type: "button",
                class: "preview-btn",
                onClick: () => actions.preview(),
              },
              "preview",
            ),
            h(
              "button",
              {
                type: "button",
                class: "edit-btn",
                onClick: () => actions.edit(),
              },
              "edit",
            ),
            h(
              "button",
              {
                type: "button",
                class: "remove-btn",
                onClick: () => actions.remove(),
              },
              "remove",
            ),
          ]),
      },
      global: {
        plugins: [i18n],
        stubs: {
          VcFileUpload: true,
          VcHint: true,
          VcIcon: true,
          VcImageUpload: true,
        },
      },
    });

    await wrapper.find(".preview-btn").trigger("click");
    await wrapper.find(".edit-btn").trigger("click");
    await wrapper.find(".remove-btn").trigger("click");

    expect(openPreview).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("edit")?.length).toBe(1);
    expect(wrapper.emitted("remove")?.length).toBe(1);
  });
});
