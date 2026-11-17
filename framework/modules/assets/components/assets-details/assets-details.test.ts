import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { ref, unref } from "vue";
import { defineRule } from "vee-validate";
import AssetsDetails from "./assets-details.vue";

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

const downloadFile = vi.hoisted(() => vi.fn());
vi.mock("@core/utilities/assets", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@core/utilities/assets")>()),
  downloadFile,
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

const image = {
  url: "/assets/cat.png",
  name: "cat.png",
  typeId: "Image",
  size: 2048,
  createdDate: "2026-01-02T10:00:00Z",
  description: "d",
};
const doc = { url: "/assets/report.pdf", name: "report.pdf", size: 10 };

interface ToolbarItem {
  id: string;
  disabled?: unknown;
  clickHandler: () => unknown;
}

// Selectors live here only.
function findNameComponent(wrapper: VueWrapper) {
  return wrapper
    .findAllComponents({ name: "VcInput" })
    .find((c) => c.find('[data-test-id="assets-details-name"]').exists());
}
function findNameInput(wrapper: VueWrapper) {
  const field = wrapper.find('[data-test-id="assets-details-name"] input');
  return field.exists() ? field : undefined;
}
function findAltInput(wrapper: VueWrapper) {
  const field = wrapper.find('[data-test-id="assets-details-alt"] input');
  return field.exists() ? field : undefined;
}
function findDescription(wrapper: VueWrapper) {
  const field = wrapper.find('[data-test-id="assets-details-description"] textarea');
  return field.exists() ? field : undefined;
}
function findCopyButton(wrapper: VueWrapper) {
  return wrapper.find('[data-test-id="assets-details-copy"]');
}
function findRow(wrapper: VueWrapper, key: string) {
  return wrapper.find(`[data-test-id="assets-details-row-${key}"]`);
}

function setup(options: Record<string, unknown>) {
  const assetEditHandler = (options.assetEditHandler as ReturnType<typeof vi.fn>) ?? vi.fn();
  const assetRemoveHandler =
    (options.assetRemoveHandler as ReturnType<typeof vi.fn>) ?? vi.fn().mockResolvedValue(undefined);
  state.options = { assetEditHandler, assetRemoveHandler, ...options };
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
  const rename = async (value: string) => {
    await findNameInput(wrapper)!.setValue(value);
    await flushPromises();
  };
  return { wrapper, assetEditHandler, assetRemoveHandler, toolbarItem, isDisabled, rename };
}

describe("AssetsDetails (current behaviour)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.closeSelf.mockResolvedValue(undefined);
  });

  it("accepts the vendor-portal option shape", async () => {
    const { wrapper } = setup({ asset: { ...image } });
    await flushPromises();
    expect(findNameInput(wrapper)!.element.value).toBe("cat");
  });

  it("accepts the AssetsManager option shape", async () => {
    const { wrapper } = setup({ asset: { ...image }, disabled: false, hiddenFields: [] });
    await flushPromises();
    expect(findNameInput(wrapper)!.element.value).toBe("cat");
  });

  it("edits a clone, not the source", async () => {
    const source = { ...image };
    const { rename } = setup({ asset: source });
    await flushPromises();
    await rename("cover");
    expect(source.name).toBe("cat.png");
  });

  it("reattaches the extension on save", async () => {
    const { rename, toolbarItem, assetEditHandler } = setup({ asset: { ...image } });
    await flushPromises();
    await rename("cover");
    await toolbarItem("save").clickHandler();
    expect(assetEditHandler).toHaveBeenCalledWith(expect.objectContaining({ name: "cover.png" }));
    expect(state.closeSelf).toHaveBeenCalled();
  });

  it("locks only the last extension", async () => {
    const { wrapper, rename, toolbarItem, assetEditHandler } = setup({ asset: { ...image, name: "my.photo.v2.jpg" } });
    await flushPromises();
    expect(findNameInput(wrapper)!.element.value).toBe("my.photo.v2");
    await rename("cover");
    await toolbarItem("save").clickHandler();
    expect(assetEditHandler).toHaveBeenCalledWith(expect.objectContaining({ name: "cover.jpg" }));
  });

  it("keeps a name without extension", async () => {
    const { wrapper, rename, toolbarItem, assetEditHandler } = setup({ asset: { ...image, name: "README" } });
    await flushPromises();
    expect(findNameInput(wrapper)!.element.value).toBe("README");
    await rename("NOTES");
    await toolbarItem("save").clickHandler();
    expect(assetEditHandler).toHaveBeenCalledWith(expect.objectContaining({ name: "NOTES" }));
  });

  it("shows alt text only for typeId Image", async () => {
    const withImage = setup({ asset: { ...image } });
    await flushPromises();
    expect(findAltInput(withImage.wrapper)).toBeDefined();

    const withDoc = setup({ asset: { ...doc } });
    await flushPromises();
    expect(findAltInput(withDoc.wrapper)).toBeUndefined();

    const noType = setup({ asset: { ...image, typeId: undefined } });
    await flushPromises();
    expect(findAltInput(noType.wrapper)).toBeUndefined();
  });

  it("hides fields listed in hiddenFields", async () => {
    const { wrapper } = setup({ asset: { ...image }, hiddenFields: ["name", "altText", "description"] });
    await flushPromises();
    expect(findNameInput(wrapper)).toBeUndefined();
    expect(findAltInput(wrapper)).toBeUndefined();
    expect(findDescription(wrapper)).toBeUndefined();
  });

  it("disabled makes inputs read-only and disables Save and Delete", async () => {
    // Drive the name through the VcInput emit: a disabled <input> ignores DOM events.
    const editName = async (wrapper: VueWrapper) => {
      findNameComponent(wrapper)!.vm.$emit("update:modelValue", "cover");
      await flushPromises();
    };

    const control = setup({ asset: { ...image }, disabled: false });
    await flushPromises();
    await editName(control.wrapper);
    expect(control.isDisabled("save")).toBe(false);

    const { wrapper, isDisabled } = setup({ asset: { ...image }, disabled: true });
    await flushPromises();
    expect(findNameInput(wrapper)!.attributes("disabled")).toBeDefined();
    expect(findAltInput(wrapper)!.attributes("disabled")).toBeDefined();
    expect(findDescription(wrapper)!.attributes("disabled")).toBeDefined();
    await editName(wrapper);
    expect(isDisabled("save")).toBe(true);
    expect(isDisabled("delete")).toBe(true);
  });

  it("Save is disabled until the form is dirty", async () => {
    const { isDisabled, rename } = setup({ asset: { ...image } });
    await flushPromises();
    expect(isDisabled("save")).toBe(true);
    await rename("cover");
    expect(isDisabled("save")).toBe(false);
  });

  it("Delete awaits the handler then closes", async () => {
    const order: string[] = [];
    const assetRemoveHandler = vi.fn(async () => {
      await Promise.resolve();
      order.push("handler");
    });
    state.closeSelf.mockImplementation(() => order.push("close"));
    const { toolbarItem } = setup({ asset: { ...image }, assetRemoveHandler });
    await flushPromises();
    await toolbarItem("delete").clickHandler();
    expect(assetRemoveHandler).toHaveBeenCalled();
    expect(order).toEqual(["handler", "close"]);
  });

  it("a rejected Save or Delete handler leaves the blade open", async () => {
    const assetEditHandler = vi.fn().mockRejectedValue(new Error("save failed"));
    const assetRemoveHandler = vi.fn().mockRejectedValue(new Error("delete failed"));
    const { toolbarItem, rename } = setup({ asset: { ...image }, assetEditHandler, assetRemoveHandler });
    await flushPromises();
    await rename("cover");
    await expect(toolbarItem("save").clickHandler()).rejects.toThrow("save failed");
    await expect(toolbarItem("delete").clickHandler()).rejects.toThrow("delete failed");
    expect(state.closeSelf).not.toHaveBeenCalled();
  });
});

describe("AssetsDetails (flat mode, V2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.closeSelf.mockResolvedValue(undefined);
  });

  it("keeps the header on the original asset while the name is edited", async () => {
    const { wrapper, rename } = setup({ asset: { ...image } });
    await flushPromises();
    await rename("");
    expect(wrapper.find('[data-test-id="assets-details-title"]').text()).toBe("cat.png");
    expect(wrapper.find('[data-test-id="assets-details-preview"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="assets-details-tile"]').exists()).toBe(false);
  });

  const toolbarIds = (wrapper: VueWrapper) =>
    (wrapper.findComponent({ name: "VcBlade" }).props("toolbarItems") as ToolbarItem[]).map((i) => i.id);

  it("flat toolbar is Save, Download, Delete in that order", async () => {
    const { wrapper } = setup({ asset: { ...image } });
    await flushPromises();
    expect(toolbarIds(wrapper)).toEqual(["save", "download", "delete"]);
  });

  it("Download is absent when the asset has no url", async () => {
    const { wrapper } = setup({ asset: { ...image, url: undefined } });
    await flushPromises();
    expect(toolbarIds(wrapper)).toEqual(["save", "delete"]);
    expect(findCopyButton(wrapper).exists()).toBe(false);
  });

  it("Download keeps the stored name while the name field is cleared", async () => {
    const { toolbarItem, rename } = setup({ asset: { ...image } });
    await flushPromises();
    await rename("");
    toolbarItem("download").clickHandler();
    expect(downloadFile).toHaveBeenCalledWith({ url: `${window.location.origin}/assets/cat.png`, name: "cat.png" });
  });

  it("Download stays enabled when disabled", async () => {
    const { isDisabled } = setup({ asset: { ...image }, disabled: true });
    await flushPromises();
    expect(isDisabled("download")).toBe(false);
  });

  it("copy writes the absolute url and toasts LINK_COPIED", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { wrapper } = setup({ asset: { ...image } });
    await flushPromises();
    await findCopyButton(wrapper).trigger("click");
    await flushPromises();
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/assets/cat.png`);
    expect(state.notifySuccess).toHaveBeenCalledWith("ASSETS.PAGES.DETAILS.NOTIFY.LINK_COPIED");
  });

  it("assetRemoveHandler returning false keeps the blade open", async () => {
    const assetRemoveHandler = vi.fn().mockResolvedValue(false);
    const { toolbarItem } = setup({ asset: { ...image }, assetRemoveHandler });
    await flushPromises();
    await toolbarItem("delete").clickHandler();
    expect(assetRemoveHandler).toHaveBeenCalled();
    expect(state.closeSelf).not.toHaveBeenCalled();
  });

  it("closes itself when mounted with neither asset nor assetSource", async () => {
    setup({});
    await flushPromises();
    expect(state.closeSelf).toHaveBeenCalled();
  });

  it("File section lists type, size and created", async () => {
    const { wrapper } = setup({ asset: { ...image } });
    await flushPromises();
    expect(findRow(wrapper, "type").text()).toContain("PNG");
    expect(findRow(wrapper, "size").text()).toContain("2 KB");
    expect(findRow(wrapper, "created").exists()).toBe(true);
    expect(findRow(wrapper, "dimensions").exists()).toBe(false);
  });
});
