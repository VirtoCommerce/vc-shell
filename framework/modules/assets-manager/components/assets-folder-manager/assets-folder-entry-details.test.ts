import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { computed, markRaw, ref } from "vue";
import type { BlobEntry, IAssetsFolderInfoItem } from "./types";
import { PlatformPermissions } from "@core/constants/permissions";
import AssetsFolderEntryDetails from "./assets-folder-entry-details.vue";

vi.hoisted(() => {
  (globalThis as Record<string, unknown>).defineBlade = () => undefined;
});

const state = vi.hoisted(() => ({
  options: undefined as unknown,
  closeSelf: vi.fn(),
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

vi.mock("@core/composables/useBlade", () => ({
  useBlade: () => ({ options: ref(state.options), closeSelf: state.closeSelf }),
}));

vi.mock("@core/notifications/notification", () => ({
  notification: { error: state.notifyError, success: state.notifySuccess },
}));

vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key),
  }),
}));

const image: BlobEntry = {
  type: "blob",
  name: "cat.png",
  url: "/assets/cat.png",
  size: 2048,
  contentType: "image/png",
  createdDate: "2026-01-02T10:00:00Z",
  modifiedDate: "2026-02-03T11:00:00Z",
};
const doc: BlobEntry = { type: "blob", name: "report.pdf", url: "/assets/report.pdf", size: 10 };

interface Toolbar {
  id: string;
  permissions?: string | string[];
  clickHandler: () => unknown;
}

function setup(
  current: BlobEntry | undefined,
  extra: { entryInfo?: (e: BlobEntry) => unknown; onDelete?: (e: BlobEntry) => Promise<boolean> } = {},
) {
  const source = ref<BlobEntry | undefined>(current);
  const onDelete = extra.onDelete ?? vi.fn().mockResolvedValue(true);
  state.options = markRaw({ entry: computed(() => source.value), entryInfo: extra.entryInfo, onDelete });
  const wrapper = mount(AssetsFolderEntryDetails, {
    global: {
      stubs: {
        VcBlade: {
          name: "VcBlade",
          template: "<div v-bind='$attrs'><slot /></div>",
          inheritAttrs: false,
          props: ["toolbarItems", "title"],
        },
        VcIcon: true,
      },
      mocks: { $t: (key: string) => key },
    },
  });
  const toolbar = () => wrapper.findComponent({ name: "VcBlade" }).props("toolbarItems") as Toolbar[];
  const field = (key: string) => wrapper.find(`[data-test-id="assets-folder-entry-details-field-${key}"]`);
  return { wrapper, source, onDelete, toolbar, field };
}

describe("AssetsFolderEntryDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.closeSelf.mockResolvedValue(false);
  });

  it("renders the file fields with an absolute url", async () => {
    const { wrapper, field } = setup(image);
    await flushPromises();
    expect(wrapper.find('[data-test-id="assets-folder-entry-details-blade"]').exists()).toBe(true);
    expect(field("name").text()).toContain("cat.png");
    expect(field("type").text()).toContain("image/png");
    expect(field("size").text()).toContain("2 KB");
    expect(field("created").text()).not.toBe("");
    expect(field("created").text()).toContain("2026");
    expect(field("modified").text()).toContain("2026");
    expect(field("url").text()).toContain(`${window.location.origin}/assets/cat.png`);
  });

  it("falls back to the upper-case extension when there is no content type", async () => {
    const { field } = setup(doc);
    await flushPromises();
    expect(field("type").text()).toContain("PDF");
  });

  it("copies the absolute url from the URL field", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { field } = setup(image);
    await flushPromises();
    await field("url").find("button").trigger("click");
    expect(writeText).toHaveBeenCalledWith(new URL("/assets/cat.png", window.location.origin).href);
  });

  it("shows the image dimensions only after the preview has loaded", async () => {
    const { wrapper, field } = setup(image);
    await flushPromises();
    expect(field("dimensions").exists()).toBe(false);
    const img = wrapper.find("img");
    Object.defineProperty(img.element, "naturalWidth", { value: 640 });
    Object.defineProperty(img.element, "naturalHeight", { value: 480 });
    await img.trigger("load");
    expect(field("dimensions").text()).toContain("640 × 480");
  });

  it("falls back to the extension badge and hides dimensions when the image fails to load", async () => {
    const { wrapper, field } = setup(image);
    await flushPromises();
    const img = wrapper.find("img");
    Object.defineProperty(img.element, "naturalWidth", { value: 640 });
    Object.defineProperty(img.element, "naturalHeight", { value: 480 });
    await img.trigger("load");
    await img.trigger("error");
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find(".assets-folder-entry-details__badge").text()).toBe("PNG");
    expect(field("dimensions").exists()).toBe(false);
  });

  it("resets the preview, dimensions and app rows when the same url is overwritten", async () => {
    const entryInfo = vi.fn().mockResolvedValue([]);
    const { wrapper, source, field } = setup(image, { entryInfo });
    await flushPromises();
    const img = wrapper.find("img");
    Object.defineProperty(img.element, "naturalWidth", { value: 640 });
    Object.defineProperty(img.element, "naturalHeight", { value: 480 });
    await img.trigger("load");
    await img.trigger("error");
    expect(field("dimensions").exists()).toBe(false);

    const overwritten = { ...image, modifiedDate: "2026-03-01T09:00:00Z" };
    source.value = overwritten;
    await flushPromises();
    expect(wrapper.find("img").exists()).toBe(true);
    expect(wrapper.find("img").element).not.toBe(img.element);
    expect(field("dimensions").exists()).toBe(false);
    expect(entryInfo.mock.calls).toEqual([[image], [overwritten]]);

    // A reload with the same url and date is the same file: nothing is asked again.
    source.value = { ...overwritten };
    await flushPromises();
    expect(entryInfo).toHaveBeenCalledTimes(2);
  });

  it("shows a badge and no dimensions for a non-image", async () => {
    const { wrapper, field } = setup(doc);
    await flushPromises();
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find(".assets-folder-entry-details__badge").text()).toBe("PDF");
    expect(field("dimensions").exists()).toBe(false);
  });

  describe("entryInfo", () => {
    it("renders the rows the hook resolves", async () => {
      const entryInfo = vi.fn().mockResolvedValue([{ label: "Used on", value: "3 pages" }]);
      const { wrapper } = setup(image, { entryInfo });
      await flushPromises();
      expect(entryInfo).toHaveBeenCalledWith(image);
      const info = wrapper.find('[data-test-id="assets-folder-entry-details-info"]');
      expect(info.text()).toContain("Used on");
      expect(info.text()).toContain("3 pages");
    });

    it("shows a skeleton while the hook is pending", async () => {
      let resolve!: (items: IAssetsFolderInfoItem[]) => void;
      const entryInfo = vi.fn(() => new Promise<IAssetsFolderInfoItem[]>((r) => (resolve = r)));
      const { wrapper } = setup(image, { entryInfo });
      await flushPromises();
      expect(wrapper.find('[data-test-id="assets-folder-entry-details-info-loading"]').exists()).toBe(true);
      resolve([{ label: "Used on", value: "3 pages" }]);
      await flushPromises();
      expect(wrapper.find('[data-test-id="assets-folder-entry-details-info-loading"]').exists()).toBe(false);
      expect(wrapper.text()).toContain("3 pages");
    });

    it("shows one muted line when the hook rejects and keeps the rest", async () => {
      const entryInfo = vi.fn().mockRejectedValue(new Error("nope"));
      const { wrapper, field } = setup(image, { entryInfo });
      await flushPromises();
      expect(wrapper.find('[data-test-id="assets-folder-entry-details-info-failed"]').text()).toBe(
        "ASSETS_MANAGER.FOLDER.DETAILS.INFO_FAILED",
      );
      expect(field("name").text()).toContain("cat.png");
    });

    it("ignores a stale result after the entry changes", async () => {
      const pending: ((items: IAssetsFolderInfoItem[]) => void)[] = [];
      const entryInfo = vi.fn(() => new Promise<IAssetsFolderInfoItem[]>((r) => pending.push(r)));
      const { wrapper, source } = setup(image, { entryInfo });
      await flushPromises();
      source.value = doc;
      await flushPromises();
      pending[1]([{ label: "Owner", value: "new" }]);
      pending[0]([{ label: "Owner", value: "old" }]);
      await flushPromises();
      expect(wrapper.text()).toContain("new");
      expect(wrapper.text()).not.toContain("old");
    });
  });

  it("closes itself when the entry disappears", async () => {
    const { source } = setup(image);
    await flushPromises();
    expect(state.closeSelf).not.toHaveBeenCalled();
    source.value = undefined;
    await flushPromises();
    expect(state.closeSelf).toHaveBeenCalledTimes(1);
  });

  it("closes itself when mounted without options", async () => {
    state.options = undefined;
    mount(AssetsFolderEntryDetails, {
      global: { stubs: { VcBlade: { template: "<div><slot /></div>" }, VcIcon: true } },
    });
    await flushPromises();
    expect(state.closeSelf).toHaveBeenCalledTimes(1);
  });

  describe("toolbar", () => {
    it("offers Download, Copy link and a permission-gated Delete", () => {
      const { toolbar } = setup(image);
      expect(toolbar().map((i) => i.id)).toEqual(["download", "copy-link", "delete"]);
      expect(toolbar().find((i) => i.id === "delete")!.permissions).toBe(PlatformPermissions.AssetDelete);
    });

    it("closes itself after a confirmed delete", async () => {
      const { toolbar, onDelete } = setup(image);
      toolbar()
        .find((i) => i.id === "delete")!
        .clickHandler();
      await flushPromises();
      expect(onDelete).toHaveBeenCalledWith(image);
      expect(state.closeSelf).toHaveBeenCalledTimes(1);
    });

    it("stays open when the delete is cancelled", async () => {
      const { toolbar, onDelete } = setup(image, { onDelete: vi.fn().mockResolvedValue(false) });
      toolbar()
        .find((i) => i.id === "delete")!
        .clickHandler();
      await flushPromises();
      expect(onDelete).toHaveBeenCalledWith(image);
      expect(state.closeSelf).not.toHaveBeenCalled();
    });

    it("copies the absolute link and confirms with a toast", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
      const { toolbar } = setup(image);
      toolbar()
        .find((i) => i.id === "copy-link")!
        .clickHandler();
      await flushPromises();
      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/assets/cat.png`);
      expect(state.notifySuccess).toHaveBeenCalledWith("ASSETS_MANAGER.FOLDER.NOTIFY.LINK_COPIED");
    });

    it("downloads through a temporary link", () => {
      const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
      const { toolbar } = setup(image);
      toolbar()
        .find((i) => i.id === "download")!
        .clickHandler();
      const anchor = click.mock.instances[0] as unknown as HTMLAnchorElement;
      expect(anchor.getAttribute("href")).toBe("/assets/cat.png");
      expect(anchor.download).toBe("cat.png");
      click.mockRestore();
    });
  });
});
