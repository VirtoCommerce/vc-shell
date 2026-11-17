import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import type { AssetLike } from "@core/composables/useAssetsManager";
import AssetsDetailsHeader from "./assets-details-header.vue";

vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

// jsdom has no CSS.escape (used by VcImage)
vi.stubGlobal("CSS", { escape: (v: string) => v });

const image: AssetLike = { url: "/assets/cat.png", name: "cat.png", size: 2048 };

function setup(asset: AssetLike) {
  return mount(AssetsDetailsHeader, {
    props: { asset },
    global: { stubs: { VcIcon: true }, mocks: { $t: (key: string) => key } },
  });
}

const preview = (w: VueWrapper) => w.find('[data-test-id="assets-details-preview"]');
const tile = (w: VueWrapper) => w.find('[data-test-id="assets-details-tile"]');
const url = (w: VueWrapper) => w.find('[data-test-id="assets-details-url"]');

describe("AssetsDetailsHeader", () => {
  it("shows the image preview for an image name", () => {
    const wrapper = setup(image);
    expect(preview(wrapper).exists()).toBe(true);
    expect(tile(wrapper).exists()).toBe(false);
    expect(wrapper.find('[data-test-id="assets-details-title"]').text()).toBe("cat.png");
  });

  it("shows a FILE tile for a name without extension", () => {
    const wrapper = setup({ url: "/assets/README", name: "README" });
    expect(preview(wrapper).exists()).toBe(false);
    expect(tile(wrapper).text()).toContain("FILE");
  });

  it("shows the extension tile when the image fails to load", async () => {
    const wrapper = setup(image);
    await wrapper.find("img").trigger("error");
    expect(preview(wrapper).exists()).toBe(false);
    expect(tile(wrapper).text()).toContain("PNG");
  });

  it("emits dimensions after load", async () => {
    const wrapper = setup(image);
    const img = wrapper.find("img");
    Object.defineProperty(img.element, "naturalWidth", { value: 640 });
    Object.defineProperty(img.element, "naturalHeight", { value: 480 });
    await img.trigger("load");
    expect(wrapper.emitted("dimensions")?.at(-1)).toEqual(["640 × 480"]);
    expect(wrapper.text()).toContain("640 × 480");
  });

  it("resets dimensions and error when the file changes", async () => {
    const wrapper = setup(image);
    await wrapper.find("img").trigger("error");
    await wrapper.setProps({ asset: { ...image, modifiedDate: "2026-03-01T00:00:00Z" } });
    await flushPromises();
    expect(preview(wrapper).exists()).toBe(true);
    expect(wrapper.emitted("dimensions")?.at(-1)).toEqual([undefined]);
  });

  it("hides the url row when the asset has no url", () => {
    expect(url(setup(image)).text()).toContain(`${window.location.origin}/assets/cat.png`);
    const wrapper = setup({ name: "cat.png" });
    expect(url(wrapper).exists()).toBe(false);
    expect(preview(wrapper).exists()).toBe(false);
    expect(tile(wrapper).exists()).toBe(true);
  });

  it("shows extension and size chips", () => {
    const text = setup({ url: "/a/report.pdf", name: "report.pdf", size: 10 }).text();
    expect(text).toContain("PDF");
    expect(text).toContain("10 Bytes");
  });

  it("renders and shows the raw url when the url is malformed", () => {
    const wrapper = setup({ url: "http://[x", name: "a.pdf" });
    expect(url(wrapper).text()).toContain("http://[x");
  });
});
