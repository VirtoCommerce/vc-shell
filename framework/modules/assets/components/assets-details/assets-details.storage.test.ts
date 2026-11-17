import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { computed, markRaw, ref, unref } from "vue";
import { defineRule } from "vee-validate";
import type { AssetLike } from "@core/composables/useAssetsManager";
import { PlatformPermissions } from "@core/constants/permissions";
import AssetsDetails from "./assets-details.vue";
import type { IAssetInfoItem } from "./types";

// Flat mode renders the name field with `rules="required"`.
defineRule("required", (value: unknown) => (value === undefined || value === null || value === "" ? "required" : true));

vi.hoisted(() => {
  (globalThis as Record<string, unknown>).defineBlade = () => undefined;
});

const state = vi.hoisted(() => ({
  options: undefined as unknown,
  closeSelf: vi.fn(),
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

vi.mock("@core/notifications/notification", () => ({
  notification: { error: state.notifyError, success: state.notifySuccess },
}));

vi.mock("@core/composables/useBlade", () => ({
  useBlade: () => ({ options: ref(state.options), closeSelf: state.closeSelf }),
}));

vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

// jsdom has no CSS.escape (used by VcImage). Stubs are undone after each test.
const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
beforeEach(() => {
  vi.stubGlobal("CSS", { escape: (v: string) => v });
});
afterEach(() => {
  vi.unstubAllGlobals();
  if (clipboardDescriptor) Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
  else Reflect.deleteProperty(navigator, "clipboard");
});

interface ToolbarItem {
  id: string;
  disabled?: unknown;
  permissions?: string | string[];
  clickHandler: () => unknown;
}

const image: AssetLike = { url: "/assets/cat.png", name: "cat.png", typeId: "Image", size: 2048 };

function mountBlade() {
  const wrapper = mount(AssetsDetails, {
    global: {
      stubs: {
        VcBlade: {
          name: "VcBlade",
          template: "<div v-bind='$attrs'><slot /></div>",
          inheritAttrs: false,
          props: ["toolbarItems", "title", "subtitle"],
        },
      },
      mocks: { $t: (key: string) => key },
    },
  });
  const toolbarItem = (id: string) => {
    const items = wrapper.findComponent({ name: "VcBlade" }).props("toolbarItems") as ToolbarItem[];
    return items.find((i) => i.id === id)!;
  };
  const isDisabled = (id: string) => !!unref(toolbarItem(id).disabled);
  return { wrapper, toolbarItem, isDisabled };
}

// Flat mode: plain options, as AssetsManager and vendor-portal pass them.
function setup(options: Record<string, unknown>) {
  state.options = { assetRemoveHandler: vi.fn().mockResolvedValue(undefined), ...options };
  return mountBlade();
}

function findRow(wrapper: VueWrapper, key: string) {
  return wrapper.find(`[data-test-id="assets-details-row-${key}"]`);
}
function findNameInput(wrapper: VueWrapper) {
  const field = wrapper.find('[data-test-id="assets-details-name"] input');
  return field.exists() ? field : undefined;
}

const stored: AssetLike = {
  url: "/assets/cat.png",
  relativeUrl: "/assets/cat.png",
  name: "cat.png",
  size: 2048,
  contentType: "image/png",
  createdDate: "2026-01-02T10:00:00Z",
  modifiedDate: "2026-02-03T11:00:00Z",
};
const storedDoc: AssetLike = { url: "/assets/report.pdf", name: "report.pdf", size: 10 };

// The folder blade passes markRaw options so the live source stays a ref.
function setupStorage(current: AssetLike | undefined, extra: Record<string, unknown> = {}) {
  const source = ref<AssetLike | undefined>(current);
  const assetRemoveHandler = vi.fn().mockResolvedValue(undefined);
  state.options = markRaw({ assetSource: computed(() => source.value), assetRemoveHandler, ...extra });
  return { ...mountBlade(), source, assetRemoveHandler };
}

function findProbe(wrapper: VueWrapper) {
  return wrapper.find("img.tw-hidden");
}
async function loadProbe(wrapper: VueWrapper, width = 640, height = 480) {
  const img = findProbe(wrapper);
  Object.defineProperty(img.element, "naturalWidth", { value: width });
  Object.defineProperty(img.element, "naturalHeight", { value: height });
  await img.trigger("load");
  return img;
}
const toolbarIdsOf = (wrapper: VueWrapper) =>
  (wrapper.findComponent({ name: "VcBlade" }).props("toolbarItems") as ToolbarItem[]).map((i) => i.id);

describe("AssetsDetails (storage mode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.closeSelf.mockResolvedValue(undefined);
  });

  it("renders file rows with an absolute url", async () => {
    const { wrapper } = setupStorage(stored);
    await flushPromises();
    expect(wrapper.find('[data-test-id="assets-details-title"]').text()).toBe("cat.png");
    expect(findRow(wrapper, "type").text()).toContain("image/png");
    expect(findRow(wrapper, "size").text()).toContain("2 KB");
    expect(findRow(wrapper, "created").text()).toContain("2026");
    expect(findRow(wrapper, "modified").text()).toContain("2026");
    expect(wrapper.find('[data-test-id="assets-details-url"]').text()).toContain(
      `${window.location.origin}/assets/cat.png`,
    );
  });

  it("type falls back to the upper-case extension", async () => {
    const { wrapper } = setupStorage(storedDoc);
    await flushPromises();
    expect(findRow(wrapper, "type").text()).toContain("PDF");
  });

  it("shows dimensions only after the image has loaded", async () => {
    const { wrapper } = setupStorage(stored);
    await flushPromises();
    expect(findRow(wrapper, "dimensions").exists()).toBe(false);
    await loadProbe(wrapper);
    expect(findRow(wrapper, "dimensions").text()).toContain("640 × 480");
  });

  it("shows the extension tile and no dimensions when the image fails", async () => {
    const { wrapper } = setupStorage(stored);
    await flushPromises();
    const img = await loadProbe(wrapper);
    await img.trigger("error");
    expect(wrapper.find('[data-test-id="assets-details-preview"]').exists()).toBe(false);
    expect(wrapper.find('[data-test-id="assets-details-tile"]').text()).toContain("PNG");
    expect(findRow(wrapper, "dimensions").exists()).toBe(false);
  });

  it("resets the preview, dimensions and app rows when the same url is overwritten", async () => {
    const extraInfo = vi.fn().mockResolvedValue([{ label: "Used on", value: "3 pages" }]);
    const { wrapper, source } = setupStorage(stored, { extraInfo });
    await flushPromises();
    const img = await loadProbe(wrapper);
    expect(findRow(wrapper, "dimensions").exists()).toBe(true);
    await img.trigger("error");

    let resolve!: (items: IAssetInfoItem[]) => void;
    extraInfo.mockImplementation(() => new Promise<IAssetInfoItem[]>((r) => (resolve = r)));
    const overwritten = { ...stored, modifiedDate: "2026-03-01T09:00:00Z" };
    source.value = overwritten;
    await flushPromises();
    expect(wrapper.find('[data-test-id="assets-details-preview"]').exists()).toBe(true);
    expect(findProbe(wrapper).element).not.toBe(img.element);
    expect(findRow(wrapper, "dimensions").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("3 pages");
    expect(extraInfo.mock.calls).toEqual([[stored], [overwritten]]);
    resolve([]);
    await flushPromises();

    // Same url and date is the same file: nothing is asked again.
    source.value = { ...overwritten };
    await flushPromises();
    expect(extraInfo).toHaveBeenCalledTimes(2);
  });

  it("closes itself when the source becomes undefined", async () => {
    const { source } = setupStorage(stored);
    await flushPromises();
    expect(state.closeSelf).not.toHaveBeenCalled();
    source.value = undefined;
    await flushPromises();
    expect(state.closeSelf).toHaveBeenCalledTimes(1);
  });

  it("closes itself when mounted with an empty source", async () => {
    setupStorage(undefined);
    await flushPromises();
    expect(state.closeSelf).toHaveBeenCalledTimes(1);
  });

  it("storage mode has no form and no Save", async () => {
    const { wrapper } = setupStorage(stored);
    await flushPromises();
    expect(wrapper.find('[data-test-id="assets-details-name"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain("ASSETS.PAGES.DETAILS.SECTIONS.METADATA");
    expect(toolbarIdsOf(wrapper)).toEqual(["download", "copy-link", "delete"]);
  });

  it("drops Download and Copy link without a url", async () => {
    const { wrapper } = setupStorage({ ...stored, url: undefined });
    await flushPromises();
    expect(toolbarIdsOf(wrapper)).toEqual(["delete"]);
  });

  it("storage Delete requires platform:asset:delete", async () => {
    const { toolbarItem } = setupStorage(stored);
    await flushPromises();
    expect(toolbarItem("delete").permissions).toBe(PlatformPermissions.AssetDelete);
  });

  it("disabled disables storage Delete only", async () => {
    const { isDisabled } = setupStorage(stored, { disabled: true });
    await flushPromises();
    expect(isDisabled("delete")).toBe(true);
    expect(isDisabled("download")).toBe(false);
    expect(isDisabled("copy-link")).toBe(false);
  });

  it("Delete passes the live asset and closes unless the handler returns false", async () => {
    const { toolbarItem, assetRemoveHandler, source } = setupStorage(stored);
    await flushPromises();
    const latest = { ...stored, modifiedDate: "2026-04-01T00:00:00Z" };
    source.value = latest;
    await flushPromises();
    await toolbarItem("delete").clickHandler();
    expect(assetRemoveHandler).toHaveBeenCalledWith(latest);
    expect(state.closeSelf).toHaveBeenCalledTimes(1);

    assetRemoveHandler.mockResolvedValue(false);
    await toolbarItem("delete").clickHandler();
    expect(state.closeSelf).toHaveBeenCalledTimes(1);
  });

  it("Copy link writes the absolute url and toasts", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { toolbarItem } = setupStorage(stored);
    await flushPromises();
    await toolbarItem("copy-link").clickHandler();
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/assets/cat.png`);
    expect(state.notifySuccess).toHaveBeenCalledWith("ASSETS.PAGES.DETAILS.NOTIFY.LINK_COPIED");
  });

  it("assetSource wins over asset", async () => {
    const source = ref<AssetLike | undefined>(storedDoc);
    state.options = markRaw({ asset: { ...image }, assetSource: computed(() => source.value) });
    const { wrapper } = mountBlade();
    await flushPromises();
    expect(wrapper.find('[data-test-id="assets-details-title"]').text()).toBe("report.pdf");
    expect(toolbarIdsOf(wrapper)).toEqual(["download", "copy-link", "delete"]);
  });
});

describe("AssetsDetails (extraInfo)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.closeSelf.mockResolvedValue(undefined);
  });

  const loading = (wrapper: VueWrapper) => wrapper.find('[data-test-id="assets-details-info-loading"]');
  const failed = (wrapper: VueWrapper) => wrapper.find('[data-test-id="assets-details-info-failed"]');

  it("renders the rows the hook resolves", async () => {
    const extraInfo = vi.fn().mockResolvedValue([{ label: "Used on", value: "3 pages" }]);
    const { wrapper } = setupStorage(stored, { extraInfo });
    await flushPromises();
    expect(extraInfo).toHaveBeenCalledWith(stored);
    const info = wrapper.find('[data-test-id="assets-details-extra-info"]');
    expect(info.text()).toContain("Used on");
    expect(info.text()).toContain("3 pages");
  });

  it("shows a skeleton while the hook is pending", async () => {
    let resolve!: (items: IAssetInfoItem[]) => void;
    const extraInfo = vi.fn(() => new Promise<IAssetInfoItem[]>((r) => (resolve = r)));
    const { wrapper } = setupStorage(stored, { extraInfo });
    await flushPromises();
    expect(loading(wrapper).exists()).toBe(true);
    resolve([{ label: "Used on", value: "3 pages" }]);
    await flushPromises();
    expect(loading(wrapper).exists()).toBe(false);
    expect(wrapper.text()).toContain("3 pages");
  });

  it("shows one muted line when the hook rejects and keeps the rest", async () => {
    const extraInfo = vi.fn().mockRejectedValue(new Error("nope"));
    const { wrapper } = setupStorage(stored, { extraInfo });
    await flushPromises();
    expect(failed(wrapper).text()).toBe("ASSETS.PAGES.DETAILS.INFO_FAILED");
    expect(findRow(wrapper, "type").exists()).toBe(true);
  });

  it("a synchronous throw ends in the same muted line", async () => {
    const extraInfo = vi.fn(() => {
      throw new Error("sync");
    });
    const { wrapper } = setup({ asset: { ...image }, extraInfo });
    await flushPromises();
    expect(failed(wrapper).text()).toBe("ASSETS.PAGES.DETAILS.INFO_FAILED");
    expect(findNameInput(wrapper)).toBeDefined();
    expect(findRow(wrapper, "type").exists()).toBe(true);
  });

  it("ignores a stale result after the asset changes", async () => {
    const pending: ((items: IAssetInfoItem[]) => void)[] = [];
    const extraInfo = vi.fn(() => new Promise<IAssetInfoItem[]>((r) => pending.push(r)));
    const { wrapper, source } = setupStorage(stored, { extraInfo });
    await flushPromises();
    source.value = storedDoc;
    await flushPromises();
    pending[1]([{ label: "Owner", value: "new" }]);
    pending[0]([{ label: "Owner", value: "old" }]);
    await flushPromises();
    expect(wrapper.text()).toContain("new");
    expect(wrapper.text()).not.toContain("old");
  });

  it("works in flat mode, after the File section", async () => {
    const extraInfo = vi.fn().mockResolvedValue([{ label: "Used on", value: "3 pages" }]);
    const { wrapper } = setup({ asset: { ...image }, extraInfo });
    await flushPromises();
    expect(extraInfo).toHaveBeenCalledWith(expect.objectContaining({ name: "cat.png" }));
    const html = wrapper.html();
    expect(html.indexOf("assets-details-row-type")).toBeLessThan(html.indexOf("assets-details-extra-info"));
    expect(wrapper.find('[data-test-id="assets-details-extra-info"]').text()).toContain("3 pages");
  });

  it("renders nothing extra without the hook", async () => {
    const { wrapper } = setupStorage(stored);
    await flushPromises();
    expect(wrapper.find('[data-test-id="assets-details-extra-info"]').exists()).toBe(false);
  });
});
