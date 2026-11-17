import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { AssetsFolderManager } from "@modules/assets-manager/components/assets-folder-manager";
import { AssetsDetails } from "@modules/assets/components/assets-details";
import { defineComponent, markRaw, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { PlatformPermissions } from "@core/constants/permissions";
import { VcPopupContainer } from "@shell/_internal/popup";
import { withMobileView } from "../../../../../.storybook/decorators";
import { ChildBlade, createChildSlot, provideStoryBlade } from "../../../../../.storybook/blade-story";
import {
  jsonResponse,
  useSharedPopupContainer,
  useStoryFetch,
  useStoryUser,
  type FetchHandler,
} from "../../../../../.storybook/story-mocks";
import type { IAssetInfoItem } from "@modules/assets/components/assets-details";
import type { AssetsFolderManagerOptions, BlobEntry, IAssetsFolderAction } from "./types";

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

// Answers only for folders of its own tree, so stories with different trees can share one page.
function createAssetsHandler(tree: Tree): FetchHandler {
  const removeFrom = (url: string) => {
    for (const key of Object.keys(tree)) {
      if (key === url || key.startsWith(`${url}/`)) delete tree[key];
      else tree[key] = tree[key].filter((e) => e.url !== url);
    }
  };
  const owns = (url: string | null) =>
    !!url && Object.keys(tree).some((key) => url === key || url.startsWith(`${key}/`));

  return (url, init) => {
    if (!url.pathname.startsWith("/api/assets")) return undefined;
    const method = (init?.method ?? "GET").toUpperCase();
    const params = url.searchParams;

    if (url.pathname === "/api/assets/folder" && method === "POST") {
      const { name, parentUrl } = JSON.parse(String(init?.body));
      if (!owns(parentUrl)) return undefined;
      const entry = folder(parentUrl, name);
      tree[parentUrl] = [...(tree[parentUrl] ?? []), entry];
      tree[entry.url] = [];
      return jsonResponse({});
    }

    if (method === "GET") {
      const folderUrl = params.get("folderUrl");
      if (!owns(folderUrl)) return undefined;
      const list = tree[folderUrl ?? ""];
      if (!list) return jsonResponse({}, 404);
      const keyword = params.get("keyword")?.toLowerCase();
      return jsonResponse({ results: keyword ? list.filter((e) => e.name.toLowerCase().includes(keyword)) : list });
    }

    if (method === "POST") {
      const folderUrl = params.get("folderUrl") ?? "";
      if (!owns(folderUrl)) return undefined;
      const body = init?.body;
      const uploaded = body instanceof FormData ? (body.get("file") as File) : undefined;
      const name = uploaded?.name ?? params.get("name") ?? "download";
      const entry = file(folderUrl, name, uploaded?.size ?? 1_000, 0);
      const rest = (tree[folderUrl] ?? []).filter(
        (e) => e.name !== name || params.get("forceFileOverwrite") !== "true",
      );
      tree[folderUrl] = [...rest, entry];
      return jsonResponse({});
    }

    if (method === "DELETE") {
      const urls = params.getAll("urls");
      if (!urls.some(owns)) return undefined;
      urls.forEach(removeFrom);
      return jsonResponse({});
    }

    return jsonResponse({}, 405);
  };
}

// The blade reads the stored view once, when it mounts. Stories on a docs page mount together,
// so they take turns: each writes its view and mounts its blade before the next one does.
const VIEW_KEY = "VC_ASSETS_FOLDER_MANAGER_VIEW";
let mountQueue: Promise<void> = Promise.resolve();

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

const IDS = { parent: "assets-folder-manager", child: "assets-details" };

function renderBlade(config: StoryConfig, height: string) {
  const dataset = config.dataset ?? "catalog";
  const rootUrl = config.rootUrl ?? (dataset === "many" ? "/archive" : dataset === "empty" ? "/empty" : "/catalog");

  return defineComponent({
    components: { AssetsFolderManager, ChildBlade, VcPopupContainer },
    setup() {
      const slot = createChildSlot(IDS);
      provideStoryBlade(
        "AssetsFolderManager",
        {
          rootUrl,
          title: config.title,
          folderActions: config.folderActions,
          entryInfo: config.entryInfo,
          beforeDelete: config.beforeDelete,
        },
        slot,
      );

      useStoryFetch(createAssetsHandler(datasets[dataset]()));
      // Permissions come from the loaded user, so the blade mounts once it is in.
      const userReady = useStoryUser(config.permissions ?? [CREATE, DELETE]);
      const ownsPopups = useSharedPopupContainer();

      const ready = ref(false);
      let storedView: string | null = null;
      const stop = watch(userReady, (loaded) => {
        if (!loaded) return;
        stop();
        mountQueue = mountQueue.then(async () => {
          storedView = localStorage.getItem(VIEW_KEY);
          localStorage.setItem(VIEW_KEY, config.view ?? "table");
          ready.value = true;
          await nextTick();
        });
      });
      onBeforeUnmount(() => {
        if (storedView === null) localStorage.removeItem(VIEW_KEY);
        else localStorage.setItem(VIEW_KEY, storedView);
      });

      return { ready, child: slot.child, ownsPopups, height, details: markRaw(AssetsDetails), detailsId: IDS.child };
    },
    // On mobile the open child covers its parent, as in the shell.
    template: `
      <div :style="{ display: 'flex', height, width: '100%' }">
        <AssetsFolderManager
          v-if="ready"
          v-show="!(child && $isMobile.value)"
        />
        <ChildBlade
          v-if="child"
          :key="child.key"
          :event="child"
          :component="details"
          :id="detailsId"
        />
      </div>
      <VcPopupContainer v-if="ownsPopups" />
    `,
  });
}

// On a docs page the stories sit one under another, so each gets a fixed height instead of the viewport.
const render = (
  _args: unknown,
  { parameters, viewMode }: { parameters: Record<string, unknown>; viewMode?: string },
) => ({
  components: {
    Story: markRaw(
      renderBlade((parameters.assetsFolder as StoryConfig) ?? {}, viewMode === "docs" ? "660px" : "100vh"),
    ),
  },
  template: "<Story />",
});

// ── Meta ─────────────────────────────────────────────────────────────────────

/**
 * Storage folder browser blade. Reads `rootUrl`, `title` and `folderActions` from the blade options,
 * lists one folder at a time and offers upload, upload from URL, new folder and delete.
 * Every story serves the platform assets API from an in-memory tree, so uploads, deletes and
 * new folders can be tried in place. The tree resets when the story is re-rendered.
 */
// The docs page shows the stories that share one signed-in user; permission and mobile variants stay
// in the sidebar and in the story tests (both change app-wide state).
const meta = {
  title: "Modules/AssetsFolderManager",
  component: AssetsFolderManager,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
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
  tags: ["!autodocs"],
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
  tags: ["!autodocs"],
  parameters: { assetsFolder: { dataset: "empty", title: "Uploads" } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "This folder is empty");
  },
};

/** 65 files across several pages of 20. */
export const ManyFiles: Story = {
  tags: ["!autodocs"],
  parameters: { assetsFolder: { dataset: "many", title: "Scans" } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "scan-001.pdf");
  },
};

/** No create or delete permission: no upload, new folder or delete controls, no selection column. */
export const ReadOnly: Story = {
  tags: ["!autodocs"],
  parameters: { assetsFolder: { title: "Catalog files", permissions: [] } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "images");
    await expect(within(canvasElement).queryByText(/new folder/i)).toBeNull();
    await expect(within(canvasElement).queryByText(/^delete$/i)).toBeNull();
  },
};

/** Create without delete: upload and new folder are offered, delete is not. */
export const CreateOnly: Story = {
  tags: ["!autodocs"],
  parameters: { assetsFolder: { title: "Catalog files", permissions: [CREATE] } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "images");
    await expect(within(canvasElement).queryByText(/^delete$/i)).toBeNull();
  },
};

/** `folderActions` add a per-folder row action; the handler gets the folder and a `reload` callback. */
export const WithFolderActions: Story = {
  tags: ["!autodocs"],
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
  tags: ["!autodocs"],
  parameters: { assetsFolder: {} },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "images");
  },
};

/** Mobile layout. */
export const Mobile: Story = {
  tags: ["!autodocs"],
  decorators: [withMobileView],
  parameters: { assetsFolder: { title: "Catalog files" } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "images");
  },
};

/** Search narrows the current folder by name through the API keyword filter. */
export const Search: Story = {
  tags: ["!autodocs"],
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
  tags: ["!autodocs"],
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
  tags: ["!autodocs"],
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
  tags: ["!autodocs"],
  decorators: [withMobileView],
  parameters: { assetsFolder: { title: "Catalog files", view: "grid" } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "logo.png");
  },
};
