import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref, computed, defineComponent, effectScope, h, unref, watch, type Component } from "vue";
import type { BlobEntry, IAssetsFolderAction } from "./types";
import type { TableAction } from "@ui/components/organisms/vc-data-table/types";
import { PlatformPermissions } from "@core/constants/permissions";
import AssetsFolderManager from "./assets-folder-manager.vue";
import OverwritePopup from "./_internal/overwrite-popup.vue";
import UploadUrlPopup from "./_internal/upload-url-popup.vue";

vi.hoisted(() => {
  (globalThis as Record<string, unknown>).defineBlade = () => undefined;
});

const folder = (name: string): BlobEntry => ({ type: "folder", name, url: `/root/${name}` });
const blob = (name: string): BlobEntry => ({ type: "blob", name, url: `/root/${name}`, size: 10 });

const state = vi.hoisted(() => ({
  currentUrl: null as unknown,
  entries: null as unknown,
  keyword: null as unknown,
  breadcrumbs: null as unknown,
  load: vi.fn(),
  open: vi.fn(),
  goTo: vi.fn(),
  search: vi.fn(),
  createFolder: vi.fn(),
  upload: vi.fn(),
  uploadFromUrl: vi.fn(),
  remove: vi.fn(),
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
  showConfirmation: vi.fn(),
  granted: new Set<string>(),
  folderActions: undefined as unknown,
  beforeDelete: undefined as unknown,
  entryInfo: undefined as unknown,
  openBlade: vi.fn(),
  closeChildren: vi.fn(),
  popups: [] as { options: unknown; open: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> }[],
}));

vi.mock("@core/composables/useBlade", () => ({
  useBlade: () => ({
    options: ref({
      rootUrl: "/root",
      title: "Files",
      folderActions: state.folderActions,
      beforeDelete: state.beforeDelete,
      entryInfo: state.entryInfo,
    }),
    openBlade: state.openBlade,
    closeChildren: state.closeChildren,
  }),
}));

vi.mock("@core/notifications/notification", () => ({
  notification: { error: state.notifyError, success: state.notifySuccess },
}));

vi.mock("@core/composables/usePermissions", () => ({
  usePermissions: () => ({
    hasAccess: (p?: string | string[]) =>
      !p || (Array.isArray(p) ? p.some((x) => state.granted.has(x)) : state.granted.has(p)),
  }),
}));

vi.mock("@core/composables/usePopup", () => ({
  usePopup: (options?: unknown) => {
    const entry = { options, open: vi.fn(), close: vi.fn() };
    state.popups.push(entry);
    return { open: entry.open, close: entry.close, showConfirmation: state.showConfirmation };
  },
}));

vi.mock("./useAssetsFolder", () => ({
  folderUrlOf: (entry: { url: string }) => entry.url,
  useAssetsFolder: () => ({
    currentUrl: state.currentUrl,
    entries: state.entries,
    loading: ref(false),
    keyword: state.keyword,
    breadcrumbs: state.breadcrumbs,
    load: state.load,
    open: state.open,
    goTo: state.goTo,
    search: state.search,
    createFolder: state.createFolder,
    upload: state.upload,
    uploadFromUrl: state.uploadFromUrl,
    remove: state.remove,
  }),
}));

vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key),
  }),
}));

const Table = defineComponent({
  name: "VcDataTable",
  props: [
    "items",
    "pagination",
    "selection",
    "selectionMode",
    "rowActions",
    "emptyState",
    "notFoundState",
    "dataKey",
    "activeItemId",
    "searchValue",
  ],
  emits: ["row-click", "pagination-click", "update:selection"],
  setup(props, { slots }) {
    return () => h("div", { "data-test-id": "table", "data-count": props.items?.length }, slots.default?.());
  },
});

const Grid = defineComponent({
  name: "AssetsFolderGrid",
  props: ["items", "selection", "selectable", "activeUrl", "dropTargetUrl", "actions"],
  emits: ["update:selection", "open", "folder-dragover", "folder-dragleave", "folder-drop"],
  setup(props) {
    return () => h("div", { "data-test-id": "grid", "data-count": props.items?.length });
  },
});

const Pagination = defineComponent({
  name: "VcPagination",
  props: ["pages", "currentPage"],
  emits: ["itemClick"],
  setup() {
    return () => h("nav");
  },
});

const FolderState = defineComponent({
  name: "AssetsFolderState",
  props: ["state"],
  setup() {
    return () => h("div", { "data-test-id": "folder-state" });
  },
});

const SearchInput = defineComponent({
  name: "VcInput",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  setup() {
    return () => h("input");
  },
});

const lastOpenName = () => (state.openBlade.mock.calls.at(-1)![0] as { name: string }).name;

function mountBlade() {
  return mount(AssetsFolderManager, {
    global: {
      stubs: {
        VcBlade: {
          name: "VcBlade",
          template: "<div v-bind='$attrs'><slot /></div>",
          inheritAttrs: false,
          props: ["toolbarItems"],
        },
        VcDataTable: Table,
        VcInput: SearchInput,
        VcBreadcrumbs: {
          props: ["items"],
          template:
            "<div><button v-for='i in items' :key='i.id' :data-crumb='i.id' @click='i.clickHandler(i.id)' /></div>",
        },
        VcColumn: defineComponent({
          name: "VcColumn",
          props: ["id"],
          setup(props, { slots }) {
            return () =>
              h(
                "div",
                { "data-column": props.id },
                (state.entries as { value: BlobEntry[] }).value.map((data) => slots.body?.({ data })),
              );
          },
        }),
        VcIcon: true,
        AssetPreviewCell: true,
        AssetsFolderGrid: Grid,
        AssetsFolderState: FolderState,
        VcPagination: Pagination,
        VcButtonGroup: { template: "<div><slot /></div>" },
        VcButton: { template: "<button v-bind='$attrs'><slot /></button>" },
      },
      directives: { loading: {} },
      mocks: { $t: (key: string) => key },
    },
  });
}

describe("AssetsFolderManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.load.mockResolvedValue(undefined);
    state.open.mockResolvedValue(undefined);
    state.goTo.mockResolvedValue(undefined);
    state.search.mockResolvedValue(undefined);
    state.createFolder.mockResolvedValue(undefined);
    state.uploadFromUrl.mockResolvedValue(undefined);
    state.remove.mockResolvedValue(undefined);
    state.upload.mockResolvedValue({ uploaded: 0, failed: 0, skipped: 0 });
    state.showConfirmation.mockResolvedValue(true);
    state.granted = new Set<string>([PlatformPermissions.AssetCreate, PlatformPermissions.AssetDelete]);
    state.folderActions = undefined;
    state.beforeDelete = undefined;
    state.entryInfo = undefined;
    state.openBlade.mockResolvedValue(undefined);
    state.closeChildren.mockResolvedValue(undefined);
    state.popups = [];
    state.currentUrl = ref("/root");
    state.keyword = ref<string | undefined>(undefined);
    localStorage.clear();
    state.entries = ref<BlobEntry[]>([folder("a"), blob("b.txt")]);
    state.breadcrumbs = computed(() => [
      { url: "/root", name: "Files" },
      { url: "/root/a", name: "a" },
    ]);
  });

  it("renders the blade root and loads the root folder on mount", async () => {
    const wrapper = mountBlade();
    await flushPromises();
    expect(wrapper.find('[data-test-id="assets-folder-manager-blade"]').exists()).toBe(true);
    expect(state.load).toHaveBeenCalledTimes(1);
  });

  it("opens a folder on row click", async () => {
    const wrapper = mountBlade();
    const table = wrapper.findComponent(Table);
    table.vm.$emit("row-click", { data: folder("a") });
    expect(state.open).toHaveBeenCalledTimes(1);
    expect(state.open).toHaveBeenCalledWith(folder("a"));
    expect(state.openBlade).not.toHaveBeenCalled();
  });

  describe("details blade", () => {
    type DetailsOptions = {
      entry: { value: BlobEntry | undefined };
      entryInfo?: unknown;
      onDelete: (e: BlobEntry) => Promise<boolean>;
    };
    const lastOpen = () =>
      state.openBlade.mock.calls.at(-1)![0] as { name: string; options: DetailsOptions; onClose?: () => void };

    it("opens the details of a clicked file and highlights its row", async () => {
      const entryInfo = vi.fn();
      state.entryInfo = entryInfo;
      const wrapper = mountBlade();
      const table = wrapper.findComponent(Table);
      table.vm.$emit("row-click", { data: blob("b.txt") });
      await flushPromises();
      expect(state.open).not.toHaveBeenCalled();
      const event = lastOpen();
      expect(event.name).toBe("AssetsFolderEntryDetails");
      expect(event.options.entry.value).toEqual(blob("b.txt"));
      expect(event.options.entryInfo).toBe(entryInfo);
      expect(table.props("activeItemId")).toBe("/root/b.txt");
    });

    it("feeds the details the fresh entry object and undefined once it is gone", async () => {
      const wrapper = mountBlade();
      wrapper.findComponent(Table).vm.$emit("row-click", { data: blob("b.txt") });
      const { entry } = lastOpen().options;
      const fresh = { ...blob("b.txt"), size: 99 };
      (state.entries as { value: BlobEntry[] }).value = [fresh];
      await flushPromises();
      expect(entry.value).toEqual(fresh);
      (state.entries as { value: BlobEntry[] }).value = [folder("a")];
      await flushPromises();
      expect(entry.value).toBeUndefined();
    });

    it("onDelete runs the folder delete flow for that one entry", async () => {
      const wrapper = mountBlade();
      wrapper.findComponent(Table).vm.$emit("row-click", { data: blob("b.txt") });
      expect(await lastOpen().options.onDelete(blob("b.txt"))).toBe(true);
      expect(state.remove).toHaveBeenCalledWith([blob("b.txt")]);
      state.showConfirmation.mockResolvedValue(false);
      expect(await lastOpen().options.onDelete(blob("b.txt"))).toBe(false);
    });

    it("clears the highlight when the details close, but not when another file replaces them", async () => {
      const wrapper = mountBlade();
      const table = wrapper.findComponent(Table);
      table.vm.$emit("row-click", { data: blob("b.txt") });
      const first = lastOpen();
      table.vm.$emit("row-click", { data: blob("c.txt") });
      first.onClose?.();
      await flushPromises();
      expect(table.props("activeItemId")).toBe("/root/c.txt");
      lastOpen().onClose?.();
      await flushPromises();
      expect(table.props("activeItemId")).toBeUndefined();
    });

    it("gives each details blade its own entry, so switching files asks entryInfo once per file", async () => {
      const entryInfo = vi.fn();
      (state.entries as { value: BlobEntry[] }).value = [blob("b.txt"), blob("c.txt")];
      const wrapper = mountBlade();
      const table = wrapper.findComponent(Table);
      // Stands in for the details blade: it asks the hook whenever its entry url changes.
      const scope = effectScope();
      const follow = (options: DetailsOptions) =>
        scope.run(() =>
          watch(
            () => options.entry.value?.url,
            () => options.entry.value && entryInfo(options.entry.value),
            { immediate: true },
          ),
        );
      table.vm.$emit("row-click", { data: blob("b.txt") });
      const first = lastOpen().options;
      follow(first);
      table.vm.$emit("row-click", { data: blob("c.txt") });
      follow(lastOpen().options);
      await flushPromises();
      scope.stop();
      expect(first.entry.value).toEqual(blob("b.txt"));
      expect(entryInfo.mock.calls).toEqual([[blob("b.txt")], [blob("c.txt")]]);
    });

    it("clears the highlight when the details fail to open", async () => {
      state.openBlade.mockRejectedValueOnce(new Error("no blade"));
      const wrapper = mountBlade();
      const table = wrapper.findComponent(Table);
      table.vm.$emit("row-click", { data: blob("b.txt") });
      await flushPromises();
      expect(table.props("activeItemId")).toBeUndefined();
      expect(state.notifyError).toHaveBeenCalledTimes(1);
    });

    it("keeps the newer highlight when an older open fails", async () => {
      let reject!: (error: Error) => void;
      state.openBlade.mockReturnValueOnce(new Promise((_, r) => (reject = r)));
      const wrapper = mountBlade();
      const table = wrapper.findComponent(Table);
      table.vm.$emit("row-click", { data: blob("b.txt") });
      table.vm.$emit("row-click", { data: blob("c.txt") });
      reject(new Error("replaced"));
      await flushPromises();
      expect(table.props("activeItemId")).toBe("/root/c.txt");
    });

    it("closes the details when navigating by folder, breadcrumb or search", async () => {
      const wrapper = mountBlade();
      wrapper.findComponent(Table).vm.$emit("row-click", { data: folder("a") });
      expect(state.closeChildren).toHaveBeenCalledTimes(1);
      await wrapper.find('[data-crumb="/root"]').trigger("click");
      expect(state.closeChildren).toHaveBeenCalledTimes(2);
      wrapper.findComponent(SearchInput).vm.$emit("update:modelValue", "cat");
      expect(state.closeChildren).toHaveBeenCalledTimes(3);
    });
  });

  it("navigates to a breadcrumb", async () => {
    const wrapper = mountBlade();
    await wrapper.find('[data-crumb="/root"]').trigger("click");
    expect(state.goTo).toHaveBeenCalledWith("/root");
  });

  it("keys table rows by url so selecting one row does not select every row", () => {
    const wrapper = mountBlade();
    expect(wrapper.findComponent(Table).props("dataKey")).toBe("url");
  });

  it("searches with the trimmed text and with undefined once cleared", async () => {
    const wrapper = mountBlade();
    const input = wrapper.findComponent(SearchInput);
    input.vm.$emit("update:modelValue", " cat ");
    expect(state.search).toHaveBeenLastCalledWith("cat");
    input.vm.$emit("update:modelValue", null);
    expect(state.search).toHaveBeenLastCalledWith(undefined);
  });

  it("keeps newer typing when an earlier search resolves, and clears the input on navigation", async () => {
    let resolveSearch!: () => void;
    state.search.mockReturnValue(new Promise<void>((r) => (resolveSearch = r)));
    const wrapper = mountBlade();
    const input = wrapper.findComponent(SearchInput);
    input.vm.$emit("update:modelValue", "cat");
    input.vm.$emit("update:modelValue", "cats");
    await flushPromises();
    resolveSearch();
    await flushPromises();
    expect(input.props("modelValue")).toBe("cats");

    (state.currentUrl as { value: string }).value = "/root/a";
    await flushPromises();
    expect(input.props("modelValue")).toBe("");
  });

  it("paginates client-side by 20 and returns to page 1 when entries change", async () => {
    state.entries = ref<BlobEntry[]>(Array.from({ length: 45 }, (_, i) => blob(`f${i}.txt`)));
    const wrapper = mountBlade();
    const table = wrapper.findComponent(Table);
    expect(table.props("items")).toHaveLength(20);
    expect(table.props("pagination")).toMatchObject({ currentPage: 1, pages: 3, pageSize: 20 });

    table.vm.$emit("pagination-click", 3);
    await flushPromises();
    expect(table.props("items")).toHaveLength(5);
    expect(table.props("pagination")).toMatchObject({ currentPage: 3 });

    (state.entries as { value: BlobEntry[] }).value = Array.from({ length: 45 }, (_, i) => blob(`g${i}.txt`));
    await flushPromises();
    expect(table.props("pagination")).toMatchObject({ currentPage: 1 });
  });

  describe("view toggle", () => {
    const VIEW_KEY = "VC_ASSETS_FOLDER_MANAGER_VIEW";
    const toggle = (wrapper: ReturnType<typeof mountBlade>, view: "table" | "grid") =>
      wrapper.find(`[data-test-id="assets-folder-manager-view-${view}"]`);

    it("starts in the table and marks the pressed button", () => {
      const wrapper = mountBlade();
      expect(wrapper.findComponent(Table).exists()).toBe(true);
      expect(wrapper.findComponent(Grid).exists()).toBe(false);
      expect(toggle(wrapper, "table").attributes("aria-pressed")).toBe("true");
      expect(toggle(wrapper, "grid").attributes("aria-pressed")).toBe("false");
      expect(toggle(wrapper, "grid").attributes("aria-label")).toBe("ASSETS_MANAGER.FOLDER.VIEW.GRID");
    });

    it("switches to the grid with the same page items and selection, and remembers it", async () => {
      const wrapper = mountBlade();
      const picked = [blob("b.txt")];
      wrapper.findComponent(Table).vm.$emit("update:selection", picked);
      await toggle(wrapper, "grid").trigger("click");
      const grid = wrapper.findComponent(Grid);
      expect(wrapper.findComponent(Table).exists()).toBe(false);
      expect(grid.props("items")).toEqual([folder("a"), blob("b.txt")]);
      expect(grid.props("selection")).toEqual(picked);
      expect(grid.props("selectable")).toBe(true);
      expect(toggle(wrapper, "grid").attributes("aria-pressed")).toBe("true");
      expect(localStorage.getItem(VIEW_KEY)).toBe("grid");

      await toggle(wrapper, "table").trigger("click");
      expect(localStorage.getItem(VIEW_KEY)).toBe("table");
      expect(wrapper.findComponent(Table).props("selection")).toEqual(picked);
    });

    it("starts in the grid when the grid was stored", () => {
      localStorage.setItem(VIEW_KEY, "grid");
      expect(mountBlade().findComponent(Grid).exists()).toBe(true);
    });

    it("falls back to the table for a stored garbage value", () => {
      localStorage.setItem(VIEW_KEY, "cards");
      expect(mountBlade().findComponent(Table).exists()).toBe(true);
    });

    it("falls back to the table and still switches when localStorage throws", async () => {
      const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("denied");
      });
      const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("denied");
      });
      try {
        const wrapper = mountBlade();
        expect(wrapper.findComponent(Table).exists()).toBe(true);
        await toggle(wrapper, "grid").trigger("click");
        expect(wrapper.findComponent(Grid).exists()).toBe(true);
      } finally {
        get.mockRestore();
        set.mockRestore();
      }
    });

    it("keeps the page when switching and paginates the grid by 20", async () => {
      state.entries = ref<BlobEntry[]>(Array.from({ length: 45 }, (_, i) => blob(`f${i}.txt`)));
      const wrapper = mountBlade();
      wrapper.findComponent(Table).vm.$emit("pagination-click", 3);
      await toggle(wrapper, "grid").trigger("click");
      expect(wrapper.findComponent(Grid).props("items")).toHaveLength(5);
      const pagination = wrapper.findComponent(Pagination);
      expect(pagination.props()).toMatchObject({ pages: 3, currentPage: 3 });
      pagination.vm.$emit("itemClick", 1);
      await flushPromises();
      expect(wrapper.findComponent(Grid).props("items")).toHaveLength(20);
    });

    it("opens folders and files from the grid and feeds it the highlight and selection", async () => {
      localStorage.setItem(VIEW_KEY, "grid");
      const wrapper = mountBlade();
      const grid = wrapper.findComponent(Grid);
      grid.vm.$emit("open", folder("a"));
      expect(state.open).toHaveBeenCalledWith(folder("a"));
      grid.vm.$emit("open", blob("b.txt"));
      await flushPromises();
      expect(lastOpenName()).toBe("AssetsFolderEntryDetails");
      expect(grid.props("activeUrl")).toBe("/root/b.txt");
      grid.vm.$emit("update:selection", [blob("b.txt")]);
      await flushPromises();
      expect(grid.props("selection")).toEqual([blob("b.txt")]);
    });

    it("hides grid selection and the actions builder follows permissions", () => {
      localStorage.setItem(VIEW_KEY, "grid");
      state.granted = new Set();
      const grid = mountBlade().findComponent(Grid);
      expect(grid.props("selectable")).toBe(false);
      const ids = (grid.props("actions") as (e: BlobEntry) => TableAction[])(blob("b.txt")).map((a) => a.id);
      expect(ids).toEqual(["download", "copy-link"]);
    });

    it("uploads into a folder dropped on in the grid", async () => {
      localStorage.setItem(VIEW_KEY, "grid");
      const wrapper = mountBlade();
      const grid = wrapper.findComponent(Grid);
      const file = new File(["x"], "x.png");
      const over = { preventDefault: vi.fn(), dataTransfer: {} } as unknown as DragEvent;
      grid.vm.$emit("folder-dragover", folder("a"), over);
      await flushPromises();
      expect(over.preventDefault).toHaveBeenCalled();
      expect(grid.props("dropTargetUrl")).toBe("/root/a");
      grid.vm.$emit("folder-drop", folder("a"), { dataTransfer: { files: [file] } } as unknown as DragEvent);
      await flushPromises();
      expect(grid.props("dropTargetUrl")).toBeUndefined();
      expect(state.upload).toHaveBeenCalledTimes(1);
      expect(state.upload.mock.calls[0][2]).toBe("/root/a");
    });

    it("shows the empty state in the grid, and not-found while searching", async () => {
      localStorage.setItem(VIEW_KEY, "grid");
      state.entries = ref<BlobEntry[]>([]);
      const wrapper = mountBlade();
      expect(wrapper.findComponent(Grid).exists()).toBe(false);
      const emptyState = wrapper.findComponent(FolderState).props("state");
      expect(emptyState).toMatchObject({ icon: "lucide-folder-open", title: "ASSETS_MANAGER.FOLDER.EMPTY.TITLE" });
      expect(emptyState.actionLabel).toBe("ASSETS_MANAGER.FOLDER.EMPTY.UPLOAD");
      (state.keyword as { value?: string }).value = "cat";
      await flushPromises();
      expect(wrapper.findComponent(FolderState).props("state")).toMatchObject({
        icon: "lucide-search-x",
        title: "ASSETS_MANAGER.FOLDER.NOT_FOUND",
      });
    });

    it("tells the table about an active search so it can show not-found", async () => {
      const wrapper = mountBlade();
      expect(wrapper.findComponent(Table).props("searchValue")).toBe("");
      (state.keyword as { value?: string }).value = "cat";
      await flushPromises();
      expect(wrapper.findComponent(Table).props("searchValue")).toBe("cat");
    });
  });

  it("reloads from the Refresh toolbar item", async () => {
    const wrapper = mountBlade();
    await flushPromises();
    state.load.mockClear();
    const items = wrapper.findComponent({ name: "VcBlade" }).props("toolbarItems") as {
      id: string;
      clickHandler: () => void;
    }[];
    items.find((i) => i.id === "refresh")!.clickHandler();
    expect(state.load).toHaveBeenCalledTimes(1);
  });

  it("reports a failed request as a notification", async () => {
    state.search.mockRejectedValue(new Error("boom"));
    const wrapper = mountBlade();
    wrapper.findComponent(SearchInput).vm.$emit("update:modelValue", "x");
    await flushPromises();
    expect(state.notifyError).toHaveBeenCalledWith(expect.stringContaining("boom"));
  });

  describe("mutations", () => {
    type ToolbarItem = { id: string; permissions?: string; clickHandler: () => void };
    // VcBlade is stubbed here; apply the same permission filter its toolbar does.
    const toolbarIds = (wrapper: ReturnType<typeof mountBlade>) =>
      (wrapper.findComponent({ name: "VcBlade" }).props("toolbarItems") as ToolbarItem[])
        .filter((i) => !i.permissions || state.granted.has(i.permissions))
        .map((i) => i.id);
    const toolbarItem = (wrapper: ReturnType<typeof mountBlade>, id: string) =>
      (wrapper.findComponent({ name: "VcBlade" }).props("toolbarItems") as ToolbarItem[]).find((i) => i.id === id)!;
    const rowActions = (wrapper: ReturnType<typeof mountBlade>, entry: BlobEntry) =>
      (wrapper.findComponent(Table).props("rowActions") as (item: BlobEntry) => TableAction[])(entry);
    const popupFor = (component: Component) =>
      state.popups.find((p) => (unref(p.options) as { component?: Component } | undefined)?.component === component)!;
    const select = async (wrapper: ReturnType<typeof mountBlade>, items: BlobEntry[]) => {
      wrapper.findComponent(Table).vm.$emit("update:selection", items);
      await flushPromises();
    };
    const drop = (wrapper: ReturnType<typeof mountBlade>, files: File[]) =>
      wrapper.find(".assets-folder-manager").trigger("drop", { dataTransfer: { files } });

    it("shows every toolbar item with full permissions", () => {
      const wrapper = mountBlade();
      expect(toolbarIds(wrapper)).toEqual(["refresh", "new-folder", "upload", "upload-url", "delete"]);
    });

    it("declares toolbar permissions for VcBlade to enforce", () => {
      const wrapper = mountBlade();
      const items = wrapper.findComponent({ name: "VcBlade" }).props("toolbarItems") as ToolbarItem[];
      expect(Object.fromEntries(items.map((i) => [i.id, i.permissions]))).toEqual({
        refresh: undefined,
        "new-folder": PlatformPermissions.AssetCreate,
        upload: PlatformPermissions.AssetCreate,
        "upload-url": PlatformPermissions.AssetCreate,
        delete: PlatformPermissions.AssetDelete,
      });
    });

    it("hides create controls and ignores a drop without platform:asset:create", async () => {
      state.granted = new Set<string>([PlatformPermissions.AssetDelete]);
      const wrapper = mountBlade();
      expect(toolbarIds(wrapper)).toEqual(["refresh", "delete"]);
      await drop(wrapper, [new File(["x"], "a.png")]);
      await flushPromises();
      expect(state.upload).not.toHaveBeenCalled();
    });

    it("hides Delete in the toolbar and the row actions without platform:asset:delete", () => {
      state.granted = new Set<string>([PlatformPermissions.AssetCreate]);
      const wrapper = mountBlade();
      expect(toolbarIds(wrapper)).toEqual(["refresh", "new-folder", "upload", "upload-url"]);
      expect(rowActions(wrapper, blob("b.txt")).map((a) => a.id)).not.toContain("delete");
      expect(rowActions(wrapper, folder("a")).map((a) => a.id)).not.toContain("delete");
    });

    it("prevents the default on every dragover, even without permission", async () => {
      state.granted = new Set();
      const wrapper = mountBlade();
      const event = new Event("dragover", { cancelable: true });
      wrapper.find(".assets-folder-manager").element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it("uploads dropped files into the current folder", async () => {
      const wrapper = mountBlade();
      const file = new File(["x"], "a.png");
      await drop(wrapper, [file]);
      await flushPromises();
      expect(state.upload).toHaveBeenCalledWith([file], expect.any(Function), undefined);
    });

    describe("drop on a folder row", () => {
      const folderEl = (wrapper: ReturnType<typeof mountBlade>) =>
        wrapper.find('[data-column="name"] [data-folder-url="/root/a"]');
      const dragEvent = (type: string, files: File[] = []) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperty(event, "dataTransfer", { value: { files, dropEffect: "" } });
        return event;
      };

      it("uploads into the folder exactly once", async () => {
        const wrapper = mountBlade();
        const file = new File(["x"], "a.png");
        folderEl(wrapper).element.dispatchEvent(dragEvent("drop", [file]));
        await flushPromises();
        expect(state.upload).toHaveBeenCalledTimes(1);
        expect(state.upload).toHaveBeenCalledWith([file], expect.any(Function), "/root/a");
      });

      it("dragover sets the drop target and prevents the default; dragleave and drop clear it", async () => {
        const wrapper = mountBlade();
        const over = dragEvent("dragover");
        folderEl(wrapper).element.dispatchEvent(over);
        await flushPromises();
        expect(over.defaultPrevented).toBe(true);
        expect(folderEl(wrapper).classes()).toContain("assets-folder-manager__drop-target");
        folderEl(wrapper).element.dispatchEvent(dragEvent("dragleave"));
        await flushPromises();
        expect(folderEl(wrapper).classes()).not.toContain("assets-folder-manager__drop-target");
        folderEl(wrapper).element.dispatchEvent(dragEvent("dragover"));
        folderEl(wrapper).element.dispatchEvent(dragEvent("drop", [new File(["x"], "a.png")]));
        await flushPromises();
        expect(folderEl(wrapper).classes()).not.toContain("assets-folder-manager__drop-target");
      });

      it("keeps the drop target on a dragleave that stays inside the blade", async () => {
        const wrapper = mountBlade();
        folderEl(wrapper).element.dispatchEvent(dragEvent("dragover"));
        await flushPromises();
        const leave = dragEvent("dragleave");
        Object.defineProperty(leave, "relatedTarget", { value: wrapper.find(".assets-folder-manager__bar").element });
        folderEl(wrapper).element.dispatchEvent(leave);
        await flushPromises();
        expect(folderEl(wrapper).classes()).toContain("assets-folder-manager__drop-target");
      });

      it("clears the drop target when dragover moves onto a non-folder cell", async () => {
        const wrapper = mountBlade();
        folderEl(wrapper).element.dispatchEvent(dragEvent("dragover"));
        await flushPromises();
        expect(folderEl(wrapper).classes()).toContain("assets-folder-manager__drop-target");
        wrapper.find('[data-column="name"] [title="b.txt"]').element.dispatchEvent(dragEvent("dragover"));
        await flushPromises();
        expect(folderEl(wrapper).classes()).not.toContain("assets-folder-manager__drop-target");
      });

      it("does nothing without platform:asset:create", async () => {
        state.granted = new Set();
        const wrapper = mountBlade();
        const over = dragEvent("dragover");
        folderEl(wrapper).element.dispatchEvent(over);
        folderEl(wrapper).element.dispatchEvent(dragEvent("drop", [new File(["x"], "a.png")]));
        await flushPromises();
        expect(over.defaultPrevented).toBe(true);
        expect(folderEl(wrapper).classes()).not.toContain("assets-folder-manager__drop-target");
        expect(state.upload).not.toHaveBeenCalled();
      });
    });

    it("names the selected files in the delete confirmation", async () => {
      const wrapper = mountBlade();
      await select(wrapper, [blob("a.png"), blob("b.png")]);
      toolbarItem(wrapper, "delete").clickHandler();
      await flushPromises();
      expect(state.showConfirmation).toHaveBeenCalledWith(
        expect.stringMatching(/^ASSETS_MANAGER\.FOLDER\.CONFIRM_DELETE:.*a\.png, b\.png/),
      );
    });

    it("warns about folder contents when a folder is selected", async () => {
      const wrapper = mountBlade();
      await select(wrapper, [folder("a"), blob("b.png")]);
      toolbarItem(wrapper, "delete").clickHandler();
      await flushPromises();
      expect(state.showConfirmation).toHaveBeenCalledWith(
        expect.stringMatching(/^ASSETS_MANAGER\.FOLDER\.CONFIRM_DELETE_FOLDERS:.*a, b\.png/),
      );
    });

    it("shows a count instead of names for more than 3 items", async () => {
      const wrapper = mountBlade();
      await select(wrapper, [blob("1"), blob("2"), blob("3"), blob("4")]);
      toolbarItem(wrapper, "delete").clickHandler();
      await flushPromises();
      const message = state.showConfirmation.mock.calls[0][0] as string;
      expect(message).toContain("ASSETS_MANAGER.FOLDER.ITEMS_COUNT");
      expect(message).toContain('\\"count\\":4');
    });

    it("removes the selection on confirm and clears it", async () => {
      const wrapper = mountBlade();
      const items = [blob("a.png"), blob("b.png")];
      await select(wrapper, items);
      toolbarItem(wrapper, "delete").clickHandler();
      await flushPromises();
      expect(state.remove).toHaveBeenCalledWith(items);
      expect(wrapper.findComponent(Table).props("selection")).toEqual([]);
    });

    it("does not remove anything on cancel", async () => {
      state.showConfirmation.mockResolvedValue(false);
      const wrapper = mountBlade();
      await select(wrapper, [blob("a.png")]);
      toolbarItem(wrapper, "delete").clickHandler();
      await flushPromises();
      expect(state.remove).not.toHaveBeenCalled();
    });

    it("appends the beforeDelete warning to the confirmation and passes the selected entries", async () => {
      const hook = vi.fn().mockResolvedValue("Used on 3 pages");
      state.beforeDelete = hook;
      const wrapper = mountBlade();
      const items = [folder("a"), blob("b.png")];
      await select(wrapper, items);
      toolbarItem(wrapper, "delete").clickHandler();
      await flushPromises();
      expect(hook).toHaveBeenCalledWith(items);
      const [message, popupOptions] = state.showConfirmation.mock.calls[0] as [string, { html?: boolean }];
      expect(popupOptions).toEqual({ html: true });
      expect(message).toMatch(/^<p>[^<]*<\/p><p class="tw-mt-2">[^<]*<\/p>$/);
      expect(message).toContain("ASSETS_MANAGER.FOLDER.CONFIRM_DELETE_FOLDERS");
      expect(message).toContain("Used on 3 pages");
    });

    it("escapes entry names and the hook text in the html confirmation", async () => {
      state.beforeDelete = vi.fn().mockResolvedValue("<b>x</b>");
      const wrapper = mountBlade();
      await select(wrapper, [blob("<img src=x onerror=alert(1)>.png")]);
      toolbarItem(wrapper, "delete").clickHandler();
      await flushPromises();
      const message = state.showConfirmation.mock.calls[0][0] as string;
      expect(message).not.toContain("<img");
      expect(message).not.toContain("<b>");
      expect(message).toContain("&#60;img");
      expect(message).toContain("&#60;b&#62;x");
    });

    it("calls showConfirmation without html when there is no warning", async () => {
      const wrapper = mountBlade();
      await select(wrapper, [blob("a.png")]);
      toolbarItem(wrapper, "delete").clickHandler();
      await flushPromises();
      expect(state.showConfirmation.mock.calls[0]).toHaveLength(1);
    });

    it("reports a throwing beforeDelete and deletes nothing", async () => {
      state.beforeDelete = vi.fn().mockRejectedValue(new Error("boom"));
      const wrapper = mountBlade();
      const result = await (
        wrapper.vm as unknown as { deleteEntries: (e: BlobEntry[]) => Promise<boolean> }
      ).deleteEntries([blob("a.png")]);
      expect(result).toBe(false);
      expect(state.notifyError).toHaveBeenCalled();
      expect(state.showConfirmation).not.toHaveBeenCalled();
      expect(state.remove).not.toHaveBeenCalled();
    });

    it("deleteEntries resolves false on cancel and true on confirm", async () => {
      const wrapper = mountBlade();
      const vm = wrapper.vm as unknown as { deleteEntries: (e: BlobEntry[]) => Promise<boolean> };
      state.showConfirmation.mockResolvedValue(false);
      expect(await vm.deleteEntries([blob("a.png")])).toBe(false);
      expect(state.remove).not.toHaveBeenCalled();
      state.showConfirmation.mockResolvedValue(true);
      expect(await vm.deleteEntries([blob("a.png")])).toBe(true);
      expect(state.remove).toHaveBeenCalledWith([blob("a.png")]);
    });

    it("confirms a row-action Delete the same way", async () => {
      const wrapper = mountBlade();
      rowActions(wrapper, folder("a"))
        .find((a) => a.id === "delete")!
        .clickHandler(folder("a"));
      await flushPromises();
      expect(state.showConfirmation).toHaveBeenCalledWith(
        expect.stringMatching(/^ASSETS_MANAGER\.FOLDER\.CONFIRM_DELETE_FOLDERS:/),
      );
      expect(state.remove).toHaveBeenCalledWith([folder("a")]);
    });

    it("reports partially failed uploads in one toast", async () => {
      state.upload.mockResolvedValue({ uploaded: 2, failed: 1, skipped: 0 });
      const wrapper = mountBlade();
      await drop(wrapper, [new File(["x"], "a"), new File(["x"], "b"), new File(["x"], "c")]);
      await flushPromises();
      expect(state.notifyError).toHaveBeenCalledWith(
        expect.stringMatching(/^ASSETS_MANAGER\.FOLDER\.NOTIFY\.UPLOAD_FAILED:.*"failed":1.*"total":3/),
      );
    });

    it("resolves a name collision from the overwrite popup", async () => {
      let decision: unknown;
      state.upload.mockImplementation(async (_files: File[], resolve: (f: File, n: string) => Promise<unknown>) => {
        decision = await resolve(new File(["x"], "a.png"), "a.png");
        return { uploaded: 1, failed: 0, skipped: 0 };
      });
      const wrapper = mountBlade();
      await drop(wrapper, [new File(["x"], "a.png")]);
      await flushPromises();
      const popup = popupFor(OverwritePopup);
      expect(popup.open).toHaveBeenCalled();
      const options = unref(popup.options) as {
        props: { name: string };
        emits: { onConfirm: (d: unknown) => void };
      };
      expect(options.props.name).toBe("a.png");
      options.emits.onConfirm({ action: "rename", name: "c.png" });
      await flushPromises();
      expect(decision).toEqual({ action: "rename", name: "c.png" });
      expect(popup.close).toHaveBeenCalled();
    });

    it("gives files Download, Copy link and Delete", () => {
      const wrapper = mountBlade();
      expect(rowActions(wrapper, blob("b.txt")).map((a) => a.id)).toEqual(["download", "copy-link", "delete"]);
    });

    it("gives folders Copy link, Delete and the permitted folder actions", async () => {
      const allowed: IAssetsFolderAction = { id: "publish", title: "Publish", clickHandler: vi.fn() };
      const denied: IAssetsFolderAction = {
        id: "secret",
        title: "Secret",
        permission: "secret:perm",
        clickHandler: vi.fn(),
      };
      state.folderActions = [allowed, denied];
      const wrapper = mountBlade();
      const actions = rowActions(wrapper, folder("a"));
      expect(actions.map((a) => a.id)).toEqual(["copy-link", "delete", "publish"]);

      actions.find((a) => a.id === "publish")!.clickHandler(folder("a"));
      await flushPromises();
      expect(allowed.clickHandler).toHaveBeenCalledWith(folder("a"), { reload: state.load });
    });

    it("copies the absolute entry url to the clipboard", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
      const wrapper = mountBlade();
      rowActions(wrapper, blob("b.txt"))
        .find((a) => a.id === "copy-link")!
        .clickHandler(blob("b.txt"));
      await flushPromises();
      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/root/b.txt`);
      expect(state.notifySuccess).toHaveBeenCalledWith("ASSETS_MANAGER.FOLDER.NOTIFY.LINK_COPIED");
    });

    it("downloads a file through a temporary link", async () => {
      const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
      const wrapper = mountBlade();
      rowActions(wrapper, blob("b.txt"))
        .find((a) => a.id === "download")!
        .clickHandler(blob("b.txt"));
      const anchor = click.mock.instances[0] as unknown as HTMLAnchorElement;
      expect(anchor.getAttribute("href")).toBe("/root/b.txt");
      expect(anchor.download).toBe("b.txt");
      click.mockRestore();
    });

    it("queues overlapping uploads so each one's collisions are resolved in turn", async () => {
      const calls: string[] = [];
      state.upload.mockImplementation(async (files: File[], resolve: (f: File, n: string) => Promise<unknown>) => {
        calls.push(`start:${files[0].name}`);
        await resolve(files[0], files[0].name);
        calls.push(`end:${files[0].name}`);
        return { uploaded: 1, failed: 0, skipped: 0 };
      });
      const wrapper = mountBlade();
      const answer = () =>
        (unref(popupFor(OverwritePopup).options) as { emits: { onConfirm: (d: unknown) => void } }).emits.onConfirm({
          action: "overwrite",
        });

      await drop(wrapper, [new File(["x"], "a.png")]);
      await drop(wrapper, [new File(["x"], "b.png")]);
      (unref(popupFor(UploadUrlPopup).options) as { emits: { onConfirm: (u: string) => void } }).emits.onConfirm(
        "https://example.com/c.png",
      );
      await flushPromises();
      expect(calls).toEqual(["start:a.png"]);

      answer();
      await flushPromises();
      expect(calls).toEqual(["start:a.png", "end:a.png", "start:b.png"]);
      expect(state.uploadFromUrl).not.toHaveBeenCalled();

      answer();
      await flushPromises();
      expect(calls).toEqual(["start:a.png", "end:a.png", "start:b.png", "end:b.png"]);
      expect(state.upload).toHaveBeenCalledTimes(2);
      expect(state.uploadFromUrl).toHaveBeenCalledWith("https://example.com/c.png");
    });
  });
});
