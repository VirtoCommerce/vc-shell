import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, computed, provide, h } from "vue";
import { VcBlade } from "@ui/components/organisms/vc-blade";
import { ToolbarServiceKey, WidgetServiceKey } from "@framework/injection-keys";
import { VcInput } from "@ui/components/molecules/vc-input";
import { VcSelect } from "@ui/components/molecules/vc-select";
import { VcCard } from "@ui/components/atoms/vc-card";
import { VcTextarea } from "@ui/components/molecules/vc-textarea";
import { createToolbarService } from "@core/services/toolbar-service";
import { createWidgetService } from "@core/services/widget-service";
import { BladeStackKey, BladeMessagingKey, BladeDescriptorKey, BladeBannersKey } from "@core/blade-navigation/types";
import type { BladeDescriptor, IBladeBanner } from "@core/blade-navigation/types";
import type { IBladeToolbar } from "@core/types";
import { hotkey } from "@core/composables/useKeyboardShortcuts";
import { withVcApp, withMobileView } from "../../../../../.storybook/decorators";

// ── Mock blade injection context ─────────────────────────────────────────────

/**
 * Provides the blade injection context that VcBlade reads via `useBlade()`.
 *
 * VcBlade derives its state from the navigation stack, NOT from props:
 * - `closable` = `descriptor.parentId !== undefined` (a child blade is closable;
 *   omit `parentId` — pass `{ parentId: undefined }` — for a non-closable workspace root).
 * - `expanded` = the blade is the active (rightmost) one → pass `{ active: true }`.
 */
function provideMockBladeContext(overrides: Partial<BladeDescriptor> = {}, opts: { active?: boolean } = {}) {
  const descriptor = computed<BladeDescriptor>(() => ({
    id: "story-blade",
    name: "StoryBlade",
    visible: true,
    // Has a parent → closable by default (matches a typical detail blade).
    parentId: "parent-blade",
    ...overrides,
  }));

  provide(ToolbarServiceKey, createToolbarService());
  provide(WidgetServiceKey, createWidgetService());

  // Minimal BladeStack mock for useBlade. `expanded` is derived from whether this
  // blade is the active one, so point activeBlade at our descriptor when requested.
  provide(BladeStackKey, {
    blades: ref([]),
    activeBlade: ref(opts.active ? { id: descriptor.value.id } : null),
    openWorkspace: async () => {},
    openBlade: async () => {},
    closeBlade: async () => false,
    closeChildren: async () => {},
    replaceCurrentBlade: async () => {},
    coverCurrentBlade: async () => {},
    registerBeforeClose: () => {},
    unregisterBeforeClose: () => {},
    setBladeError: () => {},
    clearBladeError: () => {},
    setBladeTitle: () => {},
    _restoreStack: () => {},
  } as any);

  provide(BladeMessagingKey, {
    callParent: async () => undefined,
    onParentCall: () => () => {},
  } as any);

  // Provide banners ref for BladeStatusBanners
  const banners = ref<IBladeBanner[]>([]);
  provide(BladeBannersKey, banners);

  provide(BladeDescriptorKey, descriptor);

  return { banners };
}

// ── Toolbar items factory ────────────────────────────────────────────────────

function createToolbarItems(count = 3): IBladeToolbar[] {
  const configs = [
    { id: "save", icon: "lucide-save", title: "Save" },
    { id: "delete", icon: "lucide-trash-2", title: "Delete" },
    { id: "refresh", icon: "lucide-refresh-cw", title: "Refresh" },
    { id: "copy", icon: "lucide-copy", title: "Copy" },
    { id: "paste", icon: "lucide-clipboard-paste", title: "Paste" },
    { id: "undo", icon: "lucide-undo-2", title: "Undo" },
    { id: "redo", icon: "lucide-redo-2", title: "Redo" },
    { id: "export", icon: "lucide-file-output", title: "Export" },
    { id: "import", icon: "lucide-file-input", title: "Import" },
    { id: "settings", icon: "lucide-settings", title: "Settings" },
  ];

  return configs.slice(0, count).map((config) => ({
    ...config,
    clickHandler: () => {
      console.log(`[Toolbar] ${config.title} clicked`);
    },
  }));
}

// ── Meta ─────────────────────────────────────────────────────────────────────

/**
 * `VcBlade` is the primary container for content in the VC Shell admin panel.
 * Blades are stacked panels (inspired by Azure Portal) that support headers,
 * toolbars with adaptive overflow, widget containers, error/unsaved-changes
 * banners, and responsive mobile/desktop layouts.
 */
const meta = {
  title: "Navigation/VcBlade",
  component: VcBlade,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The primary container for content in the VC Shell admin panel. Blades are stacked panels (inspired by Azure Portal) " +
          "that support headers with icon and title, toolbars with adaptive overflow into a 'More' dropdown, widget containers, " +
          "error and unsaved-changes banners, loading skeleton states, and responsive mobile/desktop layouts.",
      },
    },
  },
  decorators: [withVcApp],
  argTypes: {
    title: {
      description: "Blade title displayed in the header",
      control: "text",
      table: { category: "Header" },
    },
    subtitle: {
      description: "Subtitle displayed below the title",
      control: "text",
      table: { category: "Header" },
    },
    icon: {
      description: "Icon displayed next to the title",
      control: "text",
      table: { category: "Header" },
    },
    width: {
      description: "Blade width — number (px) or string (%, vw, etc.)",
      control: "text",
      table: { category: "Layout" },
    },
    modified: {
      description: "Shows unsaved changes indicator and banner when true",
      control: "boolean",
      table: { category: "State" },
    },
    loading: {
      description: "Shows skeleton placeholders for all blade zones while data is loading",
      control: "boolean",
      table: { category: "State" },
    },
    toolbarItems: {
      description: "Array of toolbar button definitions",
      control: "object",
      table: { category: "Toolbar" },
    },
  },
} satisfies Meta<typeof VcBlade>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    title: "Products",
    subtitle: "Manage your catalog",
    icon: "lucide-box",
    width: 500,
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      // Child blade (has a parent) → the close button is shown.
      provideMockBladeContext();
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">This is the default blade content area.</p>
          <p class="tw-text-xs tw-text-gray-400 tw-mt-2">Use the controls panel to adjust blade properties.</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const WithToolbar: Story = {
  args: {
    title: "Order Details",
    subtitle: "ORD-12345",
    icon: "lucide-file-text",
    width: 500,
    toolbarItems: createToolbarItems(3),
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext();
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <div class="tw-space-y-3">
            <div class="tw-flex tw-justify-between tw-text-sm">
              <span class="tw-text-gray-500">Status:</span>
              <span class="tw-font-semibold tw-text-green-600">Processing</span>
            </div>
            <div class="tw-flex tw-justify-between tw-text-sm">
              <span class="tw-text-gray-500">Total:</span>
              <span class="tw-font-semibold">$149.99</span>
            </div>
            <div class="tw-flex tw-justify-between tw-text-sm">
              <span class="tw-text-gray-500">Customer:</span>
              <span>Alice Johnson</span>
            </div>
          </div>
        </div>
      </VcBlade>
    `,
  }),
};

export const Modified: Story = {
  args: {
    title: "Edit Product",
    subtitle: "SKU-98765",
    icon: "lucide-pencil",
    width: 500,
    modified: true,
    toolbarItems: createToolbarItems(2),
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext();
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">The blade header shows a yellow dot indicating unsaved changes.</p>
          <p class="tw-text-sm tw-text-gray-600 tw-mt-2">The yellow banner below the toolbar confirms modifications.</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const WithError: Story = {
  args: {
    title: "Failed Blade",
    icon: "lucide-triangle-alert",
    width: 500,
    toolbarItems: createToolbarItems(1),
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext({
        error: new Error("Failed to load product catalog. Server returned 500."),
      });
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">The red error banner appears when the blade instance has an error.</p>
          <p class="tw-text-sm tw-text-gray-600 tw-mt-2">Click "See details" to open the error popup.</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const WithActions: Story = {
  args: {
    title: "Products",
    subtitle: "12 items",
    icon: "lucide-box",
    width: 500,
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext();
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <template #actions>
          <button class="tw-text-xs tw-text-blue-600 tw-border tw-border-blue-600 tw-rounded tw-px-2 tw-py-1 tw-bg-transparent hover:tw-bg-blue-50">
            + Add Product
          </button>
        </template>
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">The #actions slot renders custom content in the blade header, next to the title.</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const Expanded: Story = {
  args: {
    title: "Full Width Blade",
    subtitle: "Expanded to fill space",
    icon: "lucide-maximize",
    toolbarItems: createToolbarItems(3),
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      // Active (rightmost) blade → expanded, filling the available width.
      provideMockBladeContext({}, { active: true });
      return { args };
    },
    template: `
      <div style="width: 100%; height: 400px; display: flex;">
        <VcBlade v-bind="args">
          <div class="tw-p-6">
            <p class="tw-text-sm tw-text-gray-600">This blade is the active one in the stack, so it expands to fill the available width.</p>
          </div>
        </VcBlade>
      </div>
    `,
  }),
};

export const NotClosable: Story = {
  args: {
    title: "Dashboard",
    subtitle: "Home workspace",
    icon: "lucide-house",
    width: 500,
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      // Workspace root (no parent) → not closable, so no close button is rendered.
      provideMockBladeContext({ parentId: undefined });
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">This blade is a workspace root (no parent), so it has no close button.</p>
          <p class="tw-text-sm tw-text-gray-600 tw-mt-2">Closability is derived from stack position, not a prop.</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const Mobile: Story = {
  args: {
    title: "Mobile Blade",
    subtitle: "Responsive layout",
    icon: "lucide-smartphone",
    toolbarItems: createToolbarItems(4),
  },
  decorators: [withMobileView],
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext();
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">In mobile mode, the toolbar appears as a floating pill at the bottom.</p>
          <p class="tw-text-sm tw-text-gray-600 tw-mt-2">When there's only one blade, the header is hidden.</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const CustomWidth: Story = {
  render: () => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext();
      return {};
    },
    template: `
      <div style="display: flex; gap: 2px; height: 300px; width: 100%;">
        <VcBlade
          title="Narrow (300px)"
          icon="lucide-minimize"
          :width="300"
        >
          <div class="tw-p-4 tw-text-xs tw-text-gray-600">width: 300 (number → pixels)</div>
        </VcBlade>

        <VcBlade
          title="Wide (60%)"
          icon="lucide-maximize-2"
          width="60%"
        >
          <div class="tw-p-4 tw-text-xs tw-text-gray-600">width: "60%" (string → CSS value)</div>
        </VcBlade>
      </div>
    `,
  }),
};

export const Loading: Story = {
  args: {
    title: "Products",
    subtitle: "Manage your catalog",
    icon: "lucide-box",
    width: 500,
    loading: true,
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext();
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">This content is hidden while loading=true.</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const LoadingToggle: Story = {
  args: {
    title: "Order Details",
    subtitle: "ORD-12345",
    icon: "lucide-file-text",
    width: 500,
    toolbarItems: createToolbarItems(3),
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext();
      const loading = ref(true);
      const toggle = () => {
        loading.value = !loading.value;
      };
      return { args, loading, toggle };
    },
    template: `
      <div>
        <button
          class="tw-mb-4 tw-px-3 tw-py-1.5 tw-text-sm tw-rounded tw-border tw-cursor-pointer"
          :class="loading ? 'tw-bg-blue-600 tw-text-white tw-border-blue-600' : 'tw-bg-white tw-text-gray-700 tw-border-gray-300'"
          @click="toggle"
        >
          {{ loading ? 'Loading...' : 'Loaded — click to reload' }}
        </button>
        <VcBlade v-bind="args" :loading="loading">
          <div class="tw-p-6">
            <div class="tw-space-y-3">
              <div class="tw-flex tw-justify-between tw-text-sm">
                <span class="tw-text-gray-500">Status:</span>
                <span class="tw-font-semibold tw-text-green-600">Processing</span>
              </div>
              <div class="tw-flex tw-justify-between tw-text-sm">
                <span class="tw-text-gray-500">Total:</span>
                <span class="tw-font-semibold">$149.99</span>
              </div>
              <div class="tw-flex tw-justify-between tw-text-sm">
                <span class="tw-text-gray-500">Customer:</span>
                <span>Alice Johnson</span>
              </div>
            </div>
          </div>
        </VcBlade>
      </div>
    `,
  }),
};

export const ToolbarOverflow: Story = {
  args: {
    title: "Many Actions",
    subtitle: "Toolbar overflow demo",
    icon: "lucide-wrench",
    width: 400,
    toolbarItems: createToolbarItems(10),
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext();
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">With 10 toolbar items in a 400px blade, items that don't fit are moved to a "More" dropdown.</p>
          <p class="tw-text-sm tw-text-gray-600 tw-mt-2">This uses the useAdaptiveItems composable with ResizeObserver.</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const CustomBanners: Story = {
  args: {
    title: "Product Details",
    subtitle: "SKU-12345",
    icon: "lucide-box",
    width: 500,
    toolbarItems: createToolbarItems(2),
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      const { banners } = provideMockBladeContext();
      banners.value = [
        {
          id: "info-1",
          variant: "info",
          message: "This record is in read-only mode",
          icon: "lucide-lock",
          dismissible: false,
        },
        {
          id: "success-1",
          variant: "success",
          message: "Import completed successfully (42 items)",
          dismissible: true,
        },
      ];
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">Custom banners added programmatically via useBlade().addBanner().</p>
          <p class="tw-text-sm tw-text-gray-600 tw-mt-2">Banners are sorted by priority: danger > warning > info > success.</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const AllBannerVariants: Story = {
  args: {
    title: "Banner Showcase",
    icon: "lucide-palette",
    width: 500,
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      const { banners } = provideMockBladeContext();
      banners.value = [
        {
          id: "success-1",
          variant: "success",
          message: "All changes saved successfully",
          icon: "lucide-circle-check",
          dismissible: true,
        },
        {
          id: "info-1",
          variant: "info",
          message: "Sync in progress — data may be incomplete",
          dismissible: false,
        },
        {
          id: "warning-1",
          variant: "warning",
          message: "License expires in 7 days",
          dismissible: true,
          action: { label: "Renew", handler: () => console.log("Renew clicked") },
        },
        {
          id: "danger-1",
          variant: "danger",
          message: "Payment processing is unavailable",
          dismissible: true,
        },
      ];
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">All four banner variants displayed at once.</p>
          <p class="tw-text-sm tw-text-gray-600 tw-mt-2">Note the priority sort order: danger (top) > warning > info > success (bottom).</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const BannerWithAction: Story = {
  args: {
    title: "Order Details",
    subtitle: "ORD-99887",
    icon: "lucide-file-text",
    width: 500,
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      const { banners } = provideMockBladeContext();
      banners.value = [
        {
          id: "warning-action",
          variant: "warning",
          message: "This order has unresolved disputes",
          dismissible: false,
          action: {
            label: "View disputes",
            handler: () => console.log("View disputes clicked"),
          },
        },
      ];
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">Banners can include action buttons for contextual navigation.</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const ErrorWithCustomBanners: Story = {
  args: {
    title: "Problematic Blade",
    icon: "lucide-triangle-alert",
    width: 500,
    modified: true,
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      const { banners } = provideMockBladeContext({
        error: new Error("Failed to save: network timeout after 30s"),
      });
      banners.value.push({
        id: "info-readonly",
        variant: "info",
        message: "Editing is restricted while sync is in progress",
        dismissible: false,
      });
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">System banners (error + unsaved changes) and custom banners coexist,</p>
          <p class="tw-text-sm tw-text-gray-600 tw-mt-1">all sorted by priority: danger > warning > info.</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const BannerWithRenderFunction: Story = {
  args: {
    title: "Inventory Sync",
    subtitle: "Warehouse A",
    icon: "lucide-warehouse",
    width: 500,
    toolbarItems: createToolbarItems(2),
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      const { banners } = provideMockBladeContext();
      banners.value = [
        {
          id: "render-rich",
          variant: "info",
          dismissible: true,
          render: () =>
            h("span", { style: "font-size: 12px" }, [
              "Last sync from ",
              h("b", "Warehouse A"),
              " completed at ",
              h("span", { style: "font-weight: 600; color: var(--info-700)" }, "14:32"),
              " — ",
              h("span", { style: "opacity: 0.7" }, "42 items updated"),
            ]),
        },
        {
          id: "render-warning",
          variant: "warning",
          dismissible: false,
          render: () =>
            h("span", { style: "font-size: 12px" }, [
              h("span", { style: "font-weight: 600" }, "3 conflicts"),
              " detected during sync. ",
              h(
                "a",
                {
                  href: "#",
                  onClick: (e: Event) => {
                    e.preventDefault();
                    console.log("Resolve clicked");
                  },
                  style: "color: var(--warning-700); text-decoration: underline; cursor: pointer",
                },
                "Resolve now",
              ),
            ]),
        },
        {
          id: "render-badge",
          variant: "success",
          dismissible: true,
          render: () =>
            h("span", { style: "font-size: 12px; display: flex; align-items: center; gap: 6px" }, [
              "Import completed",
              h(
                "span",
                {
                  style:
                    "background: var(--success-200); color: var(--success-800); padding: 1px 6px; border-radius: 9999px; font-size: 11px; font-weight: 600",
                },
                "42 items",
              ),
            ]),
        },
      ];
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">Banners using render() functions for rich custom content:</p>
          <ul class="tw-text-sm tw-text-gray-600 tw-mt-2 tw-list-disc tw-pl-5 tw-space-y-1">
            <li>Formatted text with bold and colored spans</li>
            <li>Inline clickable links</li>
            <li>Badge-style pill elements</li>
          </ul>
        </div>
      </VcBlade>
    `,
  }),
};

/**
 * Composite skeleton story showing a realistic blade with multiple form fields
 * in their skeleton state during loading.
 */
export const SkeletonWithRealContent: Story = {
  args: {
    loading: true,
    title: "Product Details",
    toolbarItems: [],
  },
  render: (args) => ({
    components: { VcBlade, VcInput, VcSelect, VcCard, VcTextarea },
    setup() {
      provideMockBladeContext();
      return { args };
    },
    template: `
      <div style="height: 600px; display: flex;">
        <VcBlade v-bind="args">
          <div style="display: flex; flex-direction: column; gap: 16px; padding: 20px;">
            <VcInput label="Product Name" placeholder="Enter name" />
            <VcSelect label="Category" />
            <VcCard header="Description">
              <div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
                <VcTextarea label="Short Description" />
                <VcInput label="SKU" />
              </div>
            </VcCard>
          </div>
        </VcBlade>
      </div>
    `,
  }),
};

/**
 * Toolbar item with a keyboard shortcut. The "Save" button declares
 * `shortcut: hotkey.mod.s` -- hover or focus it to see the OS-aware `⌘S`/`Ctrl+S`
 * tooltip, and inspect the button to see `aria-keyshortcuts` set automatically.
 */
export const WithShortcut: Story = {
  args: {
    title: "Order Details",
    subtitle: "ORD-12345",
    icon: "lucide-file-text",
    width: 500,
    toolbarItems: [
      {
        id: "save",
        title: "Save",
        icon: "lucide-save",
        shortcut: hotkey.mod.s,
        clickHandler: () => {
          console.log("[Toolbar] Save clicked");
        },
      },
    ] satisfies IBladeToolbar[],
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext();
      return { args };
    },
    template: `
      <VcBlade v-bind="args">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">The "Save" button declares a keyboard shortcut via <code>shortcut: hotkey.mod.s</code>.</p>
          <p class="tw-text-sm tw-text-gray-600 tw-mt-2">Hover or focus the button to see the tooltip; it also carries <code>aria-keyshortcuts</code>.</p>
        </div>
      </VcBlade>
    `,
  }),
};
