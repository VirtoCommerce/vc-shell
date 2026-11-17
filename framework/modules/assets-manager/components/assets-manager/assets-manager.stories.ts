import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { AssetsManager } from "@modules/assets-manager/components/assets-manager";
import { AssetsDetails } from "@modules/assets/components/assets-details";
import { defineComponent, markRaw, ref } from "vue";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { useAssetsManager, type AssetLike } from "@core/composables/useAssetsManager";
import { usePopup } from "@core/composables/usePopup";
import { VcPopupContainer } from "@shell/_internal/popup";
import { withMobileView } from "../../../../../.storybook/decorators";
import { ChildBlade, createChildSlot, provideStoryBlade } from "../../../../../.storybook/blade-story";
import { jsonResponse, useSharedPopupContainer, useStoryFetch } from "../../../../../.storybook/story-mocks";

// ── Mock assets ──────────────────────────────────────────────────────────────

const PALETTES = [
  ["#dbeafe", "#2563eb"],
  ["#dcfce7", "#15803d"],
  ["#fee2e2", "#be123c"],
  ["#ede9fe", "#6d28d9"],
];

// A small landscape; the name goes into <title> so every url is unique.
const svgUrl = (name: string) => {
  const [sky, hill] = PALETTES[name.length % PALETTES.length];
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><title>${name}</title><rect width="64" height="64" fill="${sky}"/><circle cx="46" cy="18" r="8" fill="#fde68a"/><path d="M0 64 L20 34 L34 50 L46 38 L64 58 L64 64 Z" fill="${hill}"/></svg>`,
  )}`;
};

const day = (n: number) => new Date(Date.UTC(2026, 9, 30 - n, 15)).toISOString();

const image = (name: string, sortOrder: number): AssetLike => ({
  name,
  url: svgUrl(name),
  typeId: "Image",
  size: 120_000 + sortOrder * 4_000,
  sortOrder,
  createdDate: day(sortOrder + 2),
  altText: "",
  description: "",
});

const document_ = (name: string, sortOrder: number): AssetLike => ({
  name,
  url: `/stories/assets-manager/${encodeURIComponent(name)}`,
  typeId: "File",
  size: 840_000,
  sortOrder,
  createdDate: day(sortOrder + 5),
  description: "",
});

const productAssets = (): AssetLike[] => [
  image("front.png", 0),
  image("back.png", 1),
  image("detail-stitching.jpg", 2),
  document_("size-chart.pdf", 3),
  document_("care-instructions.docx", 4),
];

const manyAssets = (): AssetLike[] =>
  Array.from({ length: 32 }, (_, i) => image(`photo-${String(i + 1).padStart(2, "0")}.png`, i));

// ── Blade context ────────────────────────────────────────────────────────────

const UPLOAD_PATH = "/catalog/product-1";
const IDS = { parent: "assets-manager", child: "assets-details" };

interface StoryConfig {
  assets?: () => AssetLike[];
  title?: string;
  disabled?: boolean;
  hiddenFields?: string[];
  /** Shows the entity's asset list next to the blade: what the manager writes back to. */
  showEntity?: boolean;
}

function renderBlade(config: StoryConfig, height: string) {
  return defineComponent({
    components: { AssetsManager, ChildBlade, VcPopupContainer },
    setup() {
      // The entity field the manager is bound to, as a product's `productData.assets` would be.
      const entityAssets = ref<AssetLike[]>((config.assets ?? productAssets)());
      const { showConfirmation } = usePopup();
      const manager = useAssetsManager(entityAssets, {
        uploadPath: () => UPLOAD_PATH,
        confirmRemove: () => showConfirmation("Delete the selected assets?"),
      });

      const slot = createChildSlot(IDS);
      provideStoryBlade(
        "AssetsManager",
        {
          manager: markRaw(manager),
          title: config.title,
          disabled: config.disabled,
          hiddenFields: config.hiddenFields,
        },
        slot,
      );

      // `POST /api/assets?folderUrl=…` answers with the uploaded files; the preview is the file itself.
      useStoryFetch((url, init) => {
        if (url.pathname !== "/api/assets" || init?.method !== "POST") return undefined;
        if (url.searchParams.get("folderUrl") !== UPLOAD_PATH) return undefined;
        const file = (init.body as FormData).get("file") as File;
        return jsonResponse([
          { name: file.name, url: URL.createObjectURL(file), size: file.size, typeId: "File", description: "" },
        ]);
      });
      const ownsPopups = useSharedPopupContainer();

      return {
        child: slot.child,
        entityAssets,
        ownsPopups,
        height,
        showEntity: !!config.showEntity,
        details: markRaw(AssetsDetails),
        detailsId: IDS.child,
      };
    },
    // On mobile the open child covers its parent, as in the shell.
    template: `
      <div :style="{ display: 'flex', height, width: '100%' }">
        <AssetsManager v-show="!(child && $isMobile.value)" />
        <ChildBlade
          v-if="child"
          :key="child.key"
          :event="child"
          :component="details"
          :id="detailsId"
        />
        <aside
          v-if="showEntity"
          data-test-id="story-entity"
          style="width: 240px; flex: none; padding: 16px; font-size: 13px; border-left: 1px solid var(--neutrals-200);"
        >
          <strong>productData.assets</strong>
          <ol style="margin: 8px 0 0; padding-left: 20px;">
            <li v-for="asset in entityAssets" :key="asset.url">{{ asset.name }} (sortOrder {{ asset.sortOrder }})</li>
          </ol>
        </aside>
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
      renderBlade((parameters.assetsManager as StoryConfig) ?? {}, viewMode === "docs" ? "560px" : "100vh"),
    ),
  },
  template: "<Story />",
});

// ── Meta ─────────────────────────────────────────────────────────────────────

/**
 * Blade for the asset list of one entity: product images, offer images, attachments.
 * It edits the list through a `useAssetsManager` instance bound to the entity field; the entity
 * is saved by its own blade. Rows open `AssetsDetails` in flat mode.
 * Uploads in these stories are served in memory and keep the picked file as the preview.
 */
// Stories that change app-wide state (mobile) or open popups stay out of the docs page.
const meta = {
  title: "Modules/AssetsManager",
  component: AssetsManager,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Opened as a blade, not used as a tag:",
          "",
          "```ts",
          "const manager = useAssetsManager(productAssets, { uploadPath: () => `/catalog/${id}` });",
          'openBlade({ name: "AssetsManager", options: { manager: markRaw(manager) } });',
          "```",
          "",
          "Options: `manager` (required, wrap in `markRaw`), `title`, `disabled`, `hiddenFields`.",
        ].join("\n"),
      },
    },
  },
  render,
} satisfies Meta<typeof AssetsManager>;

export default meta;
type Story = StoryObj<typeof meta>;

const canvasText = (canvasElement: HTMLElement, text: string | RegExp) =>
  within(canvasElement).findByText(text, undefined, { timeout: 5000 });

const managerBlade = (canvasElement: HTMLElement) =>
  within(canvasElement.querySelector<HTMLElement>('[data-test-id="assets-manager-blade"]')!);

const detailsBlade = (canvasElement: HTMLElement) =>
  waitFor(
    () => {
      const blade = canvasElement.querySelector<HTMLElement>(".assets-details")?.closest<HTMLElement>(".vc-blade");
      if (!blade) throw new Error("details blade is not open");
      return blade;
    },
    { timeout: 5000 },
  );

const pickFiles = async (canvasElement: HTMLElement, files: File[]) => {
  const input = canvasElement.querySelector<HTMLInputElement>('input[name="assets_manager"]')!;
  await userEvent.upload(input, files);
};

/** A product's images and documents, in sort order. */
export const Default: Story = {
  parameters: { assetsManager: {} },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "front.png");
    await canvasText(canvasElement, "size-chart.pdf");
  },
};

/** Clicking a row opens `AssetsDetails` in flat mode: name, alt text and description. */
export const OpenDetails: Story = {
  parameters: { assetsManager: {} },
  play: async ({ canvasElement }) => {
    await userEvent.click(await canvasText(canvasElement, "front.png"));
    const blade = within(await detailsBlade(canvasElement));
    await blade.findByText("Metadata", undefined, { timeout: 5000 });
  },
};

/** No assets yet: the empty state opens the file picker. */
export const Empty: Story = {
  parameters: { assetsManager: { assets: () => [] } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, /drag & drop assets here/i);
  },
};

/** `disabled`: no upload, delete, selection or reorder; details open read-only. */
export const Disabled: Story = {
  parameters: { assetsManager: { disabled: true } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "front.png");
    await expect(managerBlade(canvasElement).queryByText(/^add$/i)).toBeNull();
    await expect(managerBlade(canvasElement).queryByText(/delete selected/i)).toBeNull();
  },
};

/** The entity field next to the blade: uploads and deletes write back to it. */
export const EntityBinding: Story = {
  tags: ["!autodocs"],
  parameters: { assetsManager: { showEntity: true } },
  play: async ({ canvasElement }) => {
    await pickFiles(canvasElement, [new File(["x"], "new-banner.png", { type: "image/png" })]);
    const entity = within(canvasElement.querySelector<HTMLElement>('[data-test-id="story-entity"]')!);
    await entity.findByText(/new-banner\.png \(sortOrder 5\)/, undefined, { timeout: 5000 });
  },
};

/** Upload through the picker; a name already in the list gets a `_1` suffix. */
export const Upload: Story = {
  tags: ["!autodocs"],
  parameters: { assetsManager: {} },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "front.png");
    await pickFiles(canvasElement, [new File(["x"], "front.png", { type: "image/png" })]);
    await canvasText(canvasElement, "front_1.png");
  },
};

/** Select rows and delete them; the confirmation comes from the caller's `confirmRemove`. */
export const DeleteSelected: Story = {
  tags: ["!autodocs"],
  parameters: { assetsManager: {} },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "back.png");
    const checkboxes = managerBlade(canvasElement).getAllByRole("checkbox");
    // The first checkbox selects all rows; the second is the first row.
    await userEvent.click(checkboxes[1]);
    await userEvent.click(managerBlade(canvasElement).getByText(/delete selected/i));
    const popup = within(document.body);
    await userEvent.click(await popup.findByRole("button", { name: /^(yes|confirm|ok)$/i }, { timeout: 5000 }));
    await waitFor(() => expect(within(canvasElement).queryByText("front.png")).toBeNull(), { timeout: 5000 });
  },
};

/** `hiddenFields` reaches the details blade: here alt text and description are hidden. */
export const HiddenFields: Story = {
  tags: ["!autodocs"],
  parameters: { assetsManager: { hiddenFields: ["altText", "description"] } },
  play: async ({ canvasElement }) => {
    await userEvent.click(await canvasText(canvasElement, "front.png"));
    const blade = await detailsBlade(canvasElement);
    await within(blade).findByText("Metadata", undefined, { timeout: 5000 });
    await expect(blade.querySelector('[data-test-id="assets-details-alt"]')).toBeNull();
    await expect(blade.querySelector('[data-test-id="assets-details-description"]')).toBeNull();
  },
};

/** A custom blade title. */
export const CustomTitle: Story = {
  tags: ["!autodocs"],
  parameters: { assetsManager: { title: "Product images" } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "Product images");
  },
};

/** 32 images: the table scrolls inside the blade. */
export const ManyAssets: Story = {
  tags: ["!autodocs"],
  parameters: { assetsManager: { assets: manyAssets } },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "photo-01.png");
  },
};

/** Phone layout: rows become cards, details cover the list. */
export const Mobile: Story = {
  tags: ["!autodocs"],
  decorators: [withMobileView],
  parameters: { assetsManager: {} },
  play: async ({ canvasElement }) => {
    await canvasText(canvasElement, "front.png");
  },
};
