import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { AssetsDetails } from "@modules/assets/components/assets-details";
import { computed, defineComponent, markRaw, provide, ref } from "vue";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ToolbarServiceKey, WidgetServiceKey } from "@framework/injection-keys";
import { BladeStackKey, BladeMessagingKey, BladeDescriptorKey, BladeBannersKey } from "@core/blade-navigation/types";
import type { BladeDescriptor, IBladeBanner } from "@core/blade-navigation/types";
import { createToolbarService } from "@core/services/toolbar-service";
import { createWidgetService } from "@core/services/widget-service";
import { PlatformPermissions } from "@core/constants/permissions";
import type { AssetLike } from "@core/composables/useAssetsManager";
import { VcPopupContainer } from "@shell/_internal/popup";
import { withMobileView } from "../../../../../.storybook/decorators";
import { useSharedPopupContainer, useStoryUser } from "../../../../../.storybook/story-mocks";
import type { AssetsDetailsOptions, IAssetInfoItem } from "@modules/assets/components/assets-details/types";

// ── Mock files ───────────────────────────────────────────────────────────────

// A 1200×800 landscape; the name goes into <title> so every url is unique.
const svgUrl = (name: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><title>${name}</title><rect width="1200" height="800" fill="#bfdbfe"/><circle cx="900" cy="220" r="110" fill="#fde68a"/><path d="M0 800 L380 360 L620 620 L820 440 L1200 760 L1200 800 Z" fill="#2563eb"/></svg>`,
  )}`;

const day = (n: number) => new Date(Date.UTC(2026, 9, 30 - n, 15)).toISOString();

const image = (name: string): AssetLike => ({
  name,
  url: svgUrl(name),
  typeId: "Image",
  size: 248_000,
  createdDate: day(30),
  altText: "Blue mountains at sunrise",
  description: "Main banner for the spring campaign.",
});

const doc = (name: string, extra: Partial<AssetLike> = {}): AssetLike => ({
  name,
  url: `/stories/assets-details/${encodeURIComponent(name)}`,
  typeId: "File",
  size: 1_840_000,
  createdDate: day(12),
  description: "",
  ...extra,
});

const storageEntry = (asset: AssetLike): AssetLike => ({ ...asset, modifiedDate: day(1) });

// ── Blade context ────────────────────────────────────────────────────────────

interface StoryConfig {
  options: AssetsDetailsOptions;
  /** Storage mode: the entry served through `assetSource`. */
  storage?: AssetLike;
  permissions?: string[];
}

const DETAILS_ID = "assets-details";

function renderBlade(config: StoryConfig, height: string) {
  return defineComponent({
    components: { AssetsDetails, VcPopupContainer },
    setup() {
      const source = ref<AssetLike | undefined>(config.storage);
      const options: AssetsDetailsOptions = config.storage
        ? { ...config.options, assetSource: computed(() => source.value) }
        : config.options;
      const closed = ref(false);

      provide(ToolbarServiceKey, createToolbarService());
      provide(WidgetServiceKey, createWidgetService());
      provide(BladeStackKey, {
        blades: ref([]),
        activeBlade: computed(() => ({ id: DETAILS_ID })),
        openWorkspace: async () => {},
        openBlade: async () => {},
        closeBlade: async () => {
          closed.value = true;
          return true;
        },
        closeChildren: async () => {},
        replaceCurrentBlade: async () => {},
        coverCurrentBlade: async () => {},
        registerBeforeClose: () => {},
        unregisterBeforeClose: () => {},
        setBladeError: () => {},
        clearBladeError: () => {},
        setBladeTitle: () => {},
        _closeAll: async () => true,
        _restoreStack: () => {},
      } as never);
      provide(BladeMessagingKey, { callParent: async () => undefined, onParentCall: () => () => {} } as never);
      provide(BladeBannersKey, ref<IBladeBanner[]>([]));
      provide(
        BladeDescriptorKey,
        computed<BladeDescriptor>(() => ({
          id: DETAILS_ID,
          name: "AssetsDetails",
          visible: true,
          parentId: "parent-blade",
          options: options as unknown as Record<string, unknown>,
        })),
      );

      // Storage Delete checks `platform:asset:delete` on the loaded user.
      const ready = useStoryUser(config.permissions ?? [DELETE]);
      const ownsPopups = useSharedPopupContainer();

      return { ready, closed, ownsPopups, height };
    },
    template: `
      <div :style="{ display: 'flex', height, width: '100%' }">
        <AssetsDetails v-if="ready && !closed" />
        <p v-if="closed" data-test-id="story-closed" style="margin: 16px;">The blade closed itself.</p>
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
    Story: markRaw(renderBlade(parameters.assetsDetails as StoryConfig, viewMode === "docs" ? "640px" : "100vh")),
  },
  template: "<Story />",
});

const DELETE = PlatformPermissions.AssetDelete;

const flatHandlers: Pick<AssetsDetailsOptions, "assetEditHandler" | "assetRemoveHandler"> = {
  assetEditHandler: () => {},
  assetRemoveHandler: async () => false,
};

const storageHandlers: Pick<AssetsDetailsOptions, "assetRemoveHandler"> = {
  assetRemoveHandler: async () => false,
};

// ── Meta ─────────────────────────────────────────────────────────────────────

/**
 * Details blade for one asset. Flat mode (`asset`) edits name, alt text and description of an
 * entity's asset; storage mode (`assetSource`) shows a file in a storage folder read-only.
 * Both share the header: preview or extension tile, name, chips and the URL row.
 */
// The docs page shows the stories that share one signed-in user; permission and mobile variants stay
// in the sidebar and in the story tests (both change app-wide state).
const meta = {
  title: "Modules/AssetsDetails",
  component: AssetsDetails,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Opened as a blade, not used as a tag:",
          "",
          "```ts",
          'openBlade({ name: "AssetsDetails", options: { asset, assetEditHandler, assetRemoveHandler } });',
          "```",
          "",
          "Pass `assetSource` (a computed entry) instead of `asset` for storage mode. `extraInfo` adds rows.",
        ].join("\n"),
      },
    },
  },
  render,
} satisfies Meta<typeof AssetsDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

const toolbarButton = (canvasElement: HTMLElement, id: string) =>
  waitFor(
    () => {
      const button = canvasElement.querySelector<HTMLElement>(`[data-test-id="${id}"]`);
      if (!button) throw new Error(`no toolbar button ${id}`);
      return button;
    },
    { timeout: 5000 },
  );

const text = (canvasElement: HTMLElement, value: string | RegExp) =>
  within(canvasElement).findAllByText(value, undefined, { timeout: 5000 });

// The blade mounts once the story user is loaded.
const bladeReady = (canvasElement: HTMLElement) =>
  waitFor(
    () => {
      if (!canvasElement.querySelector(".assets-details__header")) throw new Error("blade is not mounted");
    },
    { timeout: 5000 },
  );

/** Flat mode with an image: preview, Metadata form with the locked `.png` suffix, then File. */
export const FlatImage: Story = {
  parameters: { assetsDetails: { options: { asset: image("hero-banner.png"), ...flatHandlers } } },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    await text(canvasElement, "1200 × 800");
    await expect(canvasElement.querySelector('[data-test-id="assets-details-preview"]')).not.toBeNull();
    await expect(within(canvasElement).getByDisplayValue("hero-banner")).toBeInTheDocument();
    await expect(within(canvasElement).getByDisplayValue("Blue mountains at sunrise")).toBeInTheDocument();
  },
};

/** Editing the name enables Save; the extension stays outside the input. */
export const FlatEditName: Story = {
  tags: ["!autodocs"],
  parameters: { assetsDetails: { options: { asset: image("cover.png"), ...flatHandlers } } },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    const save = await toolbarButton(canvasElement, "save");
    await expect(save).toHaveAttribute("aria-disabled", "true");
    const input = within(canvasElement).getByDisplayValue("cover");
    await userEvent.type(input, "-wide");
    await waitFor(() => expect(save).not.toHaveAttribute("aria-disabled"));
  },
};

/** A document: extension tile instead of a preview, no alt text, Download in the toolbar. */
export const FlatDocument: Story = {
  parameters: { assetsDetails: { options: { asset: doc("price-list-2026.pdf"), ...flatHandlers } } },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-test-id="assets-details-tile"]')).toHaveTextContent("PDF"),
    );
    await expect(canvasElement.querySelector('[data-test-id="assets-details-alt"]')).toBeNull();
    await toolbarButton(canvasElement, "download");
  },
};

/** A name without an extension: the tile reads `FILE`, the name input has no suffix. */
export const FlatNoExtension: Story = {
  tags: ["!autodocs"],
  parameters: { assetsDetails: { options: { asset: doc("README"), ...flatHandlers } } },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    const tile = canvasElement.querySelector('[data-test-id="assets-details-tile"]');
    await expect(tile).toHaveTextContent("FILE");
    await expect(within(canvasElement).getByDisplayValue("README")).toBeInTheDocument();
  },
};

/** An asset that is not uploaded yet: no URL row, no Download, a tile instead of a preview. */
export const FlatNoUrl: Story = {
  tags: ["!autodocs"],
  parameters: {
    assetsDetails: { options: { asset: { ...image("draft.png"), url: undefined }, ...flatHandlers } },
  },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    await toolbarButton(canvasElement, "save");
    await expect(canvasElement.querySelector('[data-test-id="assets-details-url"]')).toBeNull();
    await expect(canvasElement.querySelector('[data-test-id="download"]')).toBeNull();
    await expect(canvasElement.querySelector('[data-test-id="assets-details-tile"]')).not.toBeNull();
  },
};

/** `disabled`: inputs are read-only, Save and Delete are disabled, Download still works. */
export const FlatDisabled: Story = {
  tags: ["!autodocs"],
  parameters: {
    assetsDetails: { options: { asset: image("locked.png"), disabled: true, ...flatHandlers } },
  },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    await expect(await toolbarButton(canvasElement, "save")).toHaveAttribute("aria-disabled", "true");
    await expect(await toolbarButton(canvasElement, "delete")).toHaveAttribute("aria-disabled", "true");
    await expect(await toolbarButton(canvasElement, "download")).not.toHaveAttribute("aria-disabled");
    await expect(within(canvasElement).getByDisplayValue("locked")).toBeDisabled();
  },
};

/** `hiddenFields` hides form fields only; the header and File section stay. */
export const FlatHiddenFields: Story = {
  tags: ["!autodocs"],
  parameters: {
    assetsDetails: {
      options: { asset: image("thumbnail.png"), hiddenFields: ["altText", "description"], ...flatHandlers },
    },
  },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    await expect(within(canvasElement).getByDisplayValue("thumbnail")).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-test-id="assets-details-alt"]')).toBeNull();
    await expect(canvasElement.querySelector('[data-test-id="assets-details-description"]')).toBeNull();
    await text(canvasElement, "Type");
  },
};

/** Storage mode with an image: no form, File adds Modified, toolbar has Download, Copy link and Delete. */
export const StorageImage: Story = {
  parameters: {
    assetsDetails: { options: storageHandlers, storage: storageEntry(image("summer-sale.png")) },
  },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    await text(canvasElement, "1200 × 800");
    await text(canvasElement, "Modified");
    await expect(canvasElement.querySelector('[data-test-id="save"]')).toBeNull();
    await toolbarButton(canvasElement, "copy-link");
    await toolbarButton(canvasElement, "delete");
  },
};

/** Storage mode with a document; a relative url is shown resolved against the origin. */
export const StorageDocument: Story = {
  tags: ["!autodocs"],
  parameters: {
    assetsDetails: {
      options: storageHandlers,
      storage: storageEntry(doc("terms.pdf", { contentType: "application/pdf" })),
    },
  },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    const url = canvasElement.querySelector('[data-test-id="assets-details-url"]');
    await waitFor(() => expect(url).toHaveTextContent(`${window.location.origin}/stories/assets-details/terms.pdf`));
    await text(canvasElement, "application/pdf");
  },
};

/** Without `platform:asset:delete` the storage Delete is hidden. */
export const StorageNoDeletePermission: Story = {
  tags: ["!autodocs"],
  parameters: {
    assetsDetails: { options: storageHandlers, storage: storageEntry(doc("audit.csv")), permissions: [] },
  },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    await toolbarButton(canvasElement, "copy-link");
    await expect(canvasElement.querySelector('[data-test-id="delete"]')).toBeNull();
  },
};

const usage = async (): Promise<IAssetInfoItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return [
    { label: "Used on", value: "3 pages" },
    { label: "Shared components", value: "Header banner" },
  ];
};

/** `extraInfo` rows follow the File section; a skeleton shows while they load. */
export const StorageWithExtraInfo: Story = {
  parameters: {
    assetsDetails: {
      options: { ...storageHandlers, extraInfo: usage },
      storage: storageEntry(image("logo.png")),
    },
  },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    await text(canvasElement, "Used on");
    await text(canvasElement, "3 pages");
  },
};

/** A failing `extraInfo` leaves one muted line; the rest of the blade works. */
export const StorageExtraInfoFailed: Story = {
  tags: ["!autodocs"],
  parameters: {
    assetsDetails: {
      options: {
        ...storageHandlers,
        extraInfo: async () => {
          throw new Error("usage service is down");
        },
      },
      storage: storageEntry(image("promo.png")),
    },
  },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    await waitFor(
      () => expect(canvasElement.querySelector('[data-test-id="assets-details-info-failed"]')).not.toBeNull(),
      { timeout: 5000 },
    );
    await text(canvasElement, "Type");
  },
};

/** An image that fails to load falls back to the extension tile, without dimensions. */
export const BrokenImage: Story = {
  tags: ["!autodocs"],
  parameters: {
    assetsDetails: {
      options: storageHandlers,
      storage: storageEntry({ ...image("missing.png"), url: "/stories/assets-details/missing.png" }),
    },
  },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    await waitFor(() => expect(canvasElement.querySelector('[data-test-id="assets-details-tile"]')).not.toBeNull(), {
      timeout: 5000,
    });
    await expect(within(canvasElement).queryByText("Dimensions")).toBeNull();
  },
};

/** A long name and a long url wrap and truncate instead of widening the blade. */
export const LongNames: Story = {
  tags: ["!autodocs"],
  parameters: {
    assetsDetails: {
      options: storageHandlers,
      storage: storageEntry(
        doc("quarterly-report-for-the-board-of-directors-final-version-approved.docx", {
          url: "/stories/assets-details/very/deep/folder/structure/quarterly-report-for-the-board-of-directors-final-version-approved.docx",
        }),
      ),
    },
  },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    const title = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLElement>('[data-test-id="assets-details-title"]');
      if (!el) throw new Error("no title");
      return el;
    });
    const blade = title.closest<HTMLElement>(".vc-blade");
    await expect(blade!.scrollWidth).toBeLessThanOrEqual(blade!.clientWidth);
  },
};

/** Mounted without `asset` or `assetSource` (a reload or deep link), the blade closes itself. */
export const NoOptions: Story = {
  tags: ["!autodocs"],
  parameters: { assetsDetails: { options: {} } },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector('[data-test-id="story-closed"]')).not.toBeNull(), {
      timeout: 5000,
    });
  },
};

/** Phone layout: the blade fills the screen. */
export const Mobile: Story = {
  tags: ["!autodocs"],
  decorators: [withMobileView],
  parameters: { assetsDetails: { options: { asset: image("mobile-banner.png"), ...flatHandlers } } },
  play: async ({ canvasElement }) => {
    await bladeReady(canvasElement);
    await text(canvasElement, "1200 × 800");
  },
};
