import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { computed, defineComponent, markRaw, onBeforeUnmount, provide, ref, shallowRef } from "vue";
import type { PropType } from "vue";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ToolbarServiceKey, WidgetServiceKey } from "@framework/injection-keys";
import { BladeStackKey, BladeMessagingKey, BladeDescriptorKey, BladeBannersKey } from "@core/blade-navigation/types";
import type { BladeDescriptor, BladeOpenEvent, IBladeBanner } from "@core/blade-navigation/types";
import { createToolbarService } from "@core/services/toolbar-service";
import { createWidgetService } from "@core/services/widget-service";
import { useUserManagement } from "@core/composables/useUserManagement";
import { PlatformPermissions } from "@core/constants/permissions";
import { VcPopupContainer } from "@shell/_internal/popup";
import { withMobileView } from "../../../../../.storybook/decorators";
import type { IAssetInfoItem } from "@modules/assets/components/assets-details";
import type { AssetsFolderManagerOptions, BlobEntry, IAssetsFolderAction } from "./types";

// The blade calls the `defineBlade` compile-time macro, which only the app build replaces.
(globalThis as Record<string, unknown>).defineBlade ??= () => undefined;
const { AssetsFolderManager } = await import("@modules/assets-manager/components/assets-folder-manager");
const { AssetsDetails } = await import("@modules/assets/components/assets-details");

// ── In-memory assets API ─────────────────────────────────────────────────────

type Tree = Record<string, BlobEntry[]>;

const CREATE = PlatformPermissions.AssetCreate;
const DELETE = PlatformPermissions.AssetDelete;

// A small landscape thumbnail; the palette is picked from the file name so thumbnails differ.
// The name goes into <title> so every url stays unique: the table keys rows by url.
const PALETTES = [
  ["#bfdbfe", "#fde68a", "#2563eb"],
  ["#fecdd3", "#fef3c7", "#be123c"],
  ["#bbf7d0", "#fef9c3", "#15803d"],
  ["#ddd6fe", "#fde68a", "#6d28d9"],
];
const svgUrl = (name: string) => {
  const [sky, sun, hill] = PALETTES[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PALETTES.length];
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><title>${name}</title><rect width="64" height="64" fill="${sky}"/><circle cx="46" cy="18" r="8" fill="${sun}"/><path d="M0 64 L20 34 L34 50 L46 38 L64 58 L64 64 Z" fill="${hill}"/></svg>`,
  )}`;
};

const day = (n: number) => new Date(Date.UTC(2026, 9, 30 - n)).toISOString();

const folder = (parent: string, name: string): BlobEntry => ({
  type: "folder",
  name,
  url: `${parent}/${name}`,
  modifiedDate: day(3),
});

const file = (parent: string, name: string, size: number, age: number): BlobEntry => ({
  type: "blob",
  name,
  url: /\.(png|jpe?g)$/i.test(name) ? svgUrl(name) : `${parent}/${encodeURIComponent(name)}`,
  size,
  createdDate: day(age + 30),
  modifiedDate: day(age),
});

function catalogTree(): Tree {
  const root = "/catalog";
  const rootFiles = [
    "logo.png",
    "hero.jpg",
    "a b#c.pdf",
    "price-list.xlsx",
    "terms.pdf",
    "manual.pdf",
    "readme.txt",
    "archive.zip",
    ...Array.from({ length: 17 }, (_, i) => `photo-${String(i + 1).padStart(2, "0")}.png`),
  ];
  return {
    [root]: [
      folder(root, "images"),
      folder(root, "documents"),
      ...rootFiles.map((name, i) => file(root, name, 2_048 * (i + 3), i)),
    ],
    [`${root}/images`]: [
      folder(`${root}/images`, "banners"),
      file(`${root}/images`, "cover.png", 48_200, 5),
      file(`${root}/images`, "detail.jpg", 91_300, 6),
    ],
    [`${root}/images/banners`]: [
      file(`${root}/images/banners`, "summer.png", 30_100, 8),
      file(`${root}/images/banners`, "winter.png", 31_400, 9),
    ],
    [`${root}/documents`]: [file(`${root}/documents`, "contract.pdf", 220_000, 12)],
  };
}

function manyFilesTree(): Tree {
  const root = "/archive";
  return {
    [root]: Array.from({ length: 65 }, (_, i) =>
      file(root, `scan-${String(i + 1).padStart(3, "0")}.pdf`, 10_000 + i * 700, i),
    ),
  };
}

const datasets: Record<string, () => Tree> = {
  catalog: catalogTree,
  many: manyFilesTree,
  empty: () => ({ "/empty": [] }),
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function createAssetsFetch(tree: Tree, permissions: string[], realFetch: typeof fetch): typeof fetch {
  const removeFrom = (url: string) => {
    for (const key of Object.keys(tree)) {
      if (key === url || key.startsWith(`${url}/`)) delete tree[key];
      else tree[key] = tree[key].filter((e) => e.url !== url);
    }
  };

  return async (input, init) => {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(raw, window.location.origin);
    const method = (init?.method ?? "GET").toUpperCase();

    if (url.pathname === "/api/platform/security/currentuser") {
      return json({ id: "story-user", userName: "story-user", isAdministrator: false, permissions });
    }
    if (!url.pathname.startsWith("/api/assets")) return realFetch(input, init);

    const params = url.searchParams;

    if (url.pathname === "/api/assets/folder" && method === "POST") {
      const { name, parentUrl } = JSON.parse(String(init?.body));
      const entry = folder(parentUrl, name);
      tree[parentUrl] = [...(tree[parentUrl] ?? []), entry];
      tree[entry.url] = [];
      return json({});
    }

    if (method === "GET") {
      const list = tree[params.get("folderUrl") ?? ""];
      if (!list) return json({}, 404);
      const keyword = params.get("keyword")?.toLowerCase();
      return json({ results: keyword ? list.filter((e) => e.name.toLowerCase().includes(keyword)) : list });
    }

    if (method === "POST") {
      const folderUrl = params.get("folderUrl") ?? "";
      const body = init?.body;
      const uploaded = body instanceof FormData ? (body.get("file") as File) : undefined;
      const name = uploaded?.name ?? params.get("name") ?? "download";
      const entry = file(folderUrl, name, uploaded?.size ?? 1_000, 0);
      const rest = (tree[folderUrl] ?? []).filter(
        (e) => e.name !== name || params.get("forceFileOverwrite") !== "true",
      );
      tree[folderUrl] = [...rest, entry];
      return json({});
    }

    if (method === "DELETE") {
      params.getAll("urls").forEach(removeFrom);
      return json({});
    }

    return json({}, 405);
  };
}

// ── Blade context ────────────────────────────────────────────────────────────

interface StoryConfig {
  dataset?: keyof typeof datasets;
  rootUrl?: string;
  title?: string;
  permissions?: string[];
  folderActions?: IAssetsFolderAction[];
  entryInfo?: AssetsFolderManagerOptions["entryInfo"];
  beforeDelete?: AssetsFolderManagerOptions["beforeDelete"];
  /** Stored view the blade starts in. */
  view?: "table" | "grid";
}

const FOLDER_ID = "assets-folder-manager";
const DETAILS_ID = "assets-details";

// One child blade at most, the way the details blade is used. Opening replaces it, closing unmounts it.
type ChildEvent = BladeOpenEvent & { parentId?: string };

function createChildSlot() {
  const child = shallowRef<ChildEvent & { key: number }>();
  let opened = 0;

  function close(): boolean {
    const current = child.value;
    if (!current) return false;
    child.value = undefined;
    current.onClose?.();
    return true;
  }

  return {
    child,
    open: async (event: ChildEvent) => {
      close();
      child.value = { ...event, key: ++opened };
    },
    close: async (id: string) => (id === DETAILS_ID ? close() : false),
    closeChildren: async (parentId: string) => {
      if (parentId === FOLDER_ID) close();
    },
  };
}

// The details blade gets its own descriptor, toolbar and widgets, as a blade in the real stack would.
const ChildBlade = defineComponent({
  components: { AssetsDetails },
  props: { event: { type: Object as PropType<ChildEvent>, required: true } },
  setup(props) {
    provide(ToolbarServiceKey, createToolbarService());
    provide(WidgetServiceKey, createWidgetService());
    provide(BladeBannersKey, ref<IBladeBanner[]>([]));
    provide(
      BladeDescriptorKey,
      computed<BladeDescriptor>(() => ({
        id: DETAILS_ID,
        name: props.event.name ?? "AssetsDetails",
        visible: true,
        parentId: props.event.parentId,
        options: props.event.options as Record<string, unknown>,
      })),
    );
  },
  template: "<AssetsDetails />",
});

function provideBladeContext(options: AssetsFolderManagerOptions, slot: ReturnType<typeof createChildSlot>) {
  const descriptor = computed<BladeDescriptor>(() => ({
    id: FOLDER_ID,
    name: "AssetsFolderManager",
    visible: true,
    parentId: "parent-blade",
    options: options as unknown as Record<string, unknown>,
  }));

  provide(ToolbarServiceKey, createToolbarService());
  provide(WidgetServiceKey, createWidgetService());
  provide(BladeStackKey, {
    blades: ref([]),
    activeBlade: computed(() => ({ id: slot.child.value ? DETAILS_ID : FOLDER_ID })),
    openWorkspace: async () => {},
    openBlade: slot.open,
    closeBlade: slot.close,
    closeChildren: slot.closeChildren,
    replaceCurrentBlade: async () => {},
    coverCurrentBlade: async () => {},
    registerBeforeClose: () => {},
    unregisterBeforeClose: () => {},
    setBladeError: () => {},
    clearBladeError: () => {},
    setBladeTitle: () => {},
    _restoreStack: () => {},
  } as any);
  provide(BladeMessagingKey, { callParent: async () => undefined, onParentCall: () => () => {} } as any);
  provide(BladeBannersKey, ref<IBladeBanner[]>([]));
  provide(BladeDescriptorKey, descriptor);
}

function renderBlade(config: StoryConfig) {
  const dataset = config.dataset ?? "catalog";
  const rootUrl = config.rootUrl ?? (dataset === "many" ? "/archive" : dataset === "empty" ? "/empty" : "/catalog");

  return defineComponent({
    components: { AssetsFolderManager, ChildBlade, VcPopupContainer },
    setup() {
      const slot = createChildSlot();
      provideBladeContext(
        {
          rootUrl,
          title: config.title,
          folderActions: config.folderActions,
          entryInfo: config.entryInfo,
          beforeDelete: config.beforeDelete,
        },
        slot,
      );

      // The blade reads the stored view once, on setup; every story starts from its own.
      const VIEW_KEY = "VC_ASSETS_FOLDER_MANAGER_VIEW";
      const storedView = localStorage.getItem(VIEW_KEY);
      localStorage.setItem(VIEW_KEY, config.view ?? "table");
      onBeforeUnmount(() => {
        if (storedView === null) localStorage.removeItem(VIEW_KEY);
        else localStorage.setItem(VIEW_KEY, storedView);
      });

      // The mock stays installed only while the story is on screen.
      const realFetch = window.fetch.bind(window);
      window.fetch = createAssetsFetch(datasets[dataset](), config.permissions ?? [CREATE, DELETE], realFetch);
      onBeforeUnmount(() => {
        window.fetch = realFetch;
      });

      // Permissions come from the loaded user, so the blade mounts once it is in.
      const ready = ref(false);
      void useUserManagement()
        .loadUser()
        .finally(() => {
          ready.value = true;
        });

      return { ready, child: slot.child };
    },
    // On mobile the open child covers its parent, as in the shell.
    template: `
      <div style="display: flex; height: 100vh; width: 100%;">
        <AssetsFolderManager
          v-if="ready"
          v-show="!(child && $isMobile.value)"
        />
        <ChildBlade
          v-if="child"
          :key="child.key"
          :event="child"
        />
      </div>
      <VcPopupContainer />
    `,
  });
}

const render = (_args: unknown, { parameters }: { parameters: Record<string, unknown> }) => ({
  components: { Story: markRaw(renderBlade((parameters.assetsFolder as StoryConfig) ?? {})) },
  template: "<Story />",
});

// ── Meta ─────────────────────────────────────────────────────────────────────

/**
 * Storage folder browser blade. Reads `rootUrl`, `title` and `folderActions` from the blade options,
 * lists one folder at a time and offers upload, upload from URL, new folder and delete.
 * Every story serves the platform assets API from an in-memory tree, so uploads, deletes and
 * new folders can be tried in place. The tree resets when the story is re-rendered.
 */
const meta = {
  title: "Modules/AssetsFolderManager",
  component: AssetsFolderManager,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      // Each story swaps window.fetch and shares the user singleton, so it needs its own iframe.
      story: { inline: false, iframeHeight: 660 },
      description: {
        component: [
          "Opened as a blade, not used as a tag:",
          "",
          "```ts",
          'openBlade({ name: "AssetsFolderManager", options: { rootUrl: "/stores/1", title: "Store files" } });',
          "```",
          "",
          "Options: `rootUrl` (required, the folder the blade cannot leave), `title`, `folderActions`.",
          "Needs `platform:asset:create` for upload and new folder, `platform:asset:delete` for delete.",
        ].join("\n"),
      },
    },
  },
  render,
} satisfies Meta<typeof AssetsFolderManager>;

export default meta;
type Story = StoryObj<typeof meta>;

const canvasText = (canvasElement: HTMLElement, text: string | RegExp) =>
  within(canvasElement).findByText(text, undefined, { timeout: 5000 });

/** Root of the catalog tree: two folders first, then files. */
export const Default: Story = {
  parameters: { assetsFolder: { title: "Catalog files" } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "images");
    await canvasText(canvasElement, "documents");
    await canvasText(canvasElement, "a b#c.pdf");
  },
};

/** Opens a folder and then a sub-folder; the breadcrumbs follow and the last crumb is the current folder. */
export const NestedFolder: Story = {
  parameters: { assetsFolder: { title: "Catalog files" } },
  play: async ({ canvasElement }) => {
    await userEvent.click(await canvasText(canvasElement, "images"));
    await userEvent.click(await canvasText(canvasElement, "banners"));
    await canvasText(canvasElement, "summer.png");
    await waitFor(() =>
      expect(canvasElement.querySelector(".assets-folder-manager__breadcrumbs")).toHaveTextContent("banners"),
    );
  },
};

/** A folder with no entries shows the empty state with an upload action. */
export const EmptyFolder: Story = {
  parameters: { assetsFolder: { dataset: "empty", title: "Uploads" } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "This folder is empty");
  },
};

/** 65 files across several pages of 20. */
export const ManyFiles: Story = {
  parameters: { assetsFolder: { dataset: "many", title: "Scans" } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "scan-001.pdf");
  },
};

/** No create or delete permission: no upload, new folder or delete controls, no selection column. */
export const ReadOnly: Story = {
  parameters: { assetsFolder: { title: "Catalog files", permissions: [] } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "images");
    await expect(within(canvasElement).queryByText(/new folder/i)).toBeNull();
    await expect(within(canvasElement).queryByText(/^delete$/i)).toBeNull();
  },
};

/** Create without delete: upload and new folder are offered, delete is not. */
export const CreateOnly: Story = {
  parameters: { assetsFolder: { title: "Catalog files", permissions: [CREATE] } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "images");
    await expect(within(canvasElement).queryByText(/^delete$/i)).toBeNull();
  },
};

/** `folderActions` add a per-folder row action; the handler gets the folder and a `reload` callback. */
export const WithFolderActions: Story = {
  parameters: {
    assetsFolder: {
      title: "Catalog files",
      folderActions: [
        {
          id: "publish-folder",
          title: "Publish folder",
          icon: "lucide-send",
          permission: CREATE,
          clickHandler: async (_folder, { reload }) => {
            await reload();
          },
        },
      ] satisfies IAssetsFolderAction[],
    },
  },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "images");
  },
};

/** Without a title option the blade falls back to the default title. */
export const DefaultTitle: Story = {
  parameters: { assetsFolder: {} },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "images");
  },
};

/** Mobile layout. */
export const Mobile: Story = {
  decorators: [withMobileView],
  parameters: { assetsFolder: { title: "Catalog files" } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "images");
  },
};

/** Search narrows the current folder by name through the API keyword filter. */
export const Search: Story = {
  parameters: { assetsFolder: { title: "Catalog files" } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "manual.pdf");
    const input = within(canvasElement).getByPlaceholderText("Search in this folder");
    await userEvent.type(input, "manual{Enter}");
    await waitFor(() => expect(within(canvasElement).queryByText("archive.zip")).toBeNull(), { timeout: 5000 });
    await canvasText(canvasElement, "manual.pdf");
  },
};

/** The stored view is the grid: folder and file cards with a preview, name, size and date. */
export const GridView: Story = {
  parameters: { assetsFolder: { title: "Catalog files", view: "grid" } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "logo.png");
    await waitFor(() => expect(canvasElement.querySelectorAll(".assets-folder-grid__card")).toHaveLength(20));
  },
};

const detailsBlade = (canvasElement: HTMLElement) =>
  waitFor(
    () => {
      const blade = canvasElement.querySelector<HTMLElement>(".assets-details")?.closest<HTMLElement>(".vc-blade");
      if (!blade) throw new Error("details blade is not open");
      return blade;
    },
    { timeout: 5000 },
  );

/** Clicking a file opens the details blade next to the folder: preview, name, type, size, dimensions, dates, URL. */
export const Details: Story = {
  parameters: { assetsFolder: { title: "Catalog files" } },
  play: async ({ canvasElement }) => {
    await userEvent.click(await canvasText(canvasElement, "logo.png"));
    const blade = within(await detailsBlade(canvasElement));
    await blade.findByText("Dimensions", undefined, { timeout: 5000 });
    await blade.findAllByText("64 × 64", undefined, { timeout: 5000 });
  },
};

// How many storefront pages show each file, as a page builder would report it.
const PAGE_USAGE: Record<string, number> = { "logo.png": 3, "hero.jpg": 1 };
const pagesLabel = (count: number) => `${count} ${count === 1 ? "page" : "pages"}`;

/**
 * `entryInfo` adds rows to the details blade, `beforeDelete` adds a warning to the delete confirmation.
 * Here both report where a file is used, so deleting `logo.png` warns that three pages lose it.
 */
export const WithHooks: Story = {
  parameters: {
    assetsFolder: {
      title: "Catalog files",
      entryInfo: async (entry: BlobEntry): Promise<IAssetInfoItem[]> => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const count = PAGE_USAGE[entry.name] ?? 0;
        return [{ label: "Used on", value: count ? pagesLabel(count) : "Not used" }];
      },
      beforeDelete: (entries: BlobEntry[]) => {
        const used = entries.filter((entry) => PAGE_USAGE[entry.name]);
        if (!used.length) return undefined;
        return used.map((entry) => `${entry.name} is used on ${pagesLabel(PAGE_USAGE[entry.name])}.`).join(" ");
      },
    },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(await canvasText(canvasElement, "logo.png"));
    const blade = within(await detailsBlade(canvasElement));
    await blade.findByText("Used on", undefined, { timeout: 5000 });
    await blade.findByText("3 pages");
    await userEvent.click(await blade.findByText(/^delete$/i));
    await within(document.body).findByText("logo.png is used on 3 pages.", undefined, { timeout: 5000 });
  },
};

/** Dragging files over a folder highlights it; a drop there uploads into that folder instead of the current one. */
export const DropOnFolder: Story = {
  parameters: { assetsFolder: { title: "Catalog files" } },
  play: async ({ canvasElement }) => {
    const name = await canvasText(canvasElement, "documents");
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(["x"], "spec.pdf", { type: "application/pdf" }));
    name.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer }));
    await waitFor(() =>
      expect(
        canvasElement.querySelector('.assets-folder-manager__drop-target[data-folder-url$="/documents"]'),
      ).not.toBeNull(),
    );
  },
};

/** Grid on a phone: two cards per row, the select and menu controls stay visible without hover. */
export const MobileGrid: Story = {
  decorators: [withMobileView],
  parameters: { assetsFolder: { title: "Catalog files", view: "grid" } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "logo.png");
  },
};
