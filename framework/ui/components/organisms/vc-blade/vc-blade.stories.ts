import type { Meta, StoryFn, StoryObj } from "@storybook/vue3-vite";
import { ref, computed, provide } from "vue";
import { VcBlade } from "./";
import { BladeInstance, TOOLBAR_SERVICE } from "../../../../injection-keys";
import { WidgetServiceKey } from "../../../../injection-keys";
import { createToolbarService } from "../../../../core/services/toolbar-service";
import { createWidgetService } from "../../../../core/services/widget-service";
import { BladeStackKey, BladeMessagingKey, BladeDescriptorKey } from "../../../../shared/components/blade-navigation/types";
import type { IBladeInstance } from "../../../../shared/components/blade-navigation/types";
import type { IBladeToolbar } from "../../../../core/types";
import { withVcApp, withMobileView } from "../../../../../.storybook/decorators";

// ── Mock blade injection context ─────────────────────────────────────────────

function provideMockBladeContext(overrides: Partial<IBladeInstance> = {}) {
  const bladeInstance = computed<IBladeInstance>(() => ({
    id: "story-blade",
    error: null,
    expandable: true,
    maximized: false,
    navigation: undefined,
    breadcrumbs: undefined,
    param: undefined,
    options: undefined,
    ...overrides,
  }));

  provide(BladeInstance, bladeInstance);
  provide(TOOLBAR_SERVICE, createToolbarService());
  provide(WidgetServiceKey, createWidgetService());

  // Minimal BladeStack mock for useBladeNavigation
  provide(BladeStackKey, {
    blades: ref([]),
    activeBlade: ref(null),
    openBlade: async () => {},
    closeBlade: async () => {},
    closeSelf: async () => {},
    closeChildren: async () => {},
    replaceBlade: async () => {},
  } as any);

  provide(BladeMessagingKey, {
    callParent: async () => undefined,
    onParentCall: () => () => {},
  } as any);

  provide(BladeDescriptorKey, computed(() => ({
    id: "story-blade",
    index: 0,
    parentId: undefined,
  })) as any);
}

// ── Toolbar items factory ────────────────────────────────────────────────────

function createToolbarItems(count = 3): IBladeToolbar[] {
  const configs = [
    { id: "save", icon: "fas fa-save", title: "Save" },
    { id: "delete", icon: "fas fa-trash", title: "Delete" },
    { id: "refresh", icon: "fas fa-sync-alt", title: "Refresh" },
    { id: "copy", icon: "fas fa-copy", title: "Copy" },
    { id: "paste", icon: "fas fa-paste", title: "Paste" },
    { id: "undo", icon: "fas fa-undo", title: "Undo" },
    { id: "redo", icon: "fas fa-redo", title: "Redo" },
    { id: "export", icon: "fas fa-file-export", title: "Export" },
    { id: "import", icon: "fas fa-file-import", title: "Import" },
    { id: "settings", icon: "fas fa-cog", title: "Settings" },
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
  title: "Organisms/VcBlade",
  component: VcBlade,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
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
    closable: {
      description: "Whether the blade shows a close button",
      control: "boolean",
      table: { category: "Behavior" },
    },
    expandable: {
      description: "Whether the blade can be expanded/maximized",
      control: "boolean",
      table: { category: "Behavior" },
    },
    expanded: {
      description: "Whether the blade is currently expanded to fill available space",
      control: "boolean",
      table: { category: "Layout" },
    },
    modified: {
      description: "Shows unsaved changes indicator and banner when true",
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
    icon: "fas fa-box",
    width: 500,
    closable: true,
    expandable: true,
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext();
      return { args };
    },
    template: `
      <VcBlade v-bind="args" @close="() => {}" @expand="() => {}" @collapse="() => {}">
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
    icon: "fas fa-file-alt",
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
      <VcBlade v-bind="args" @close="() => {}">
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
    icon: "fas fa-edit",
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
      <VcBlade v-bind="args" @close="() => {}">
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
    icon: "fas fa-exclamation-triangle",
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
      <VcBlade v-bind="args" @close="() => {}">
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
    icon: "fas fa-box",
    width: 500,
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext();
      return { args };
    },
    template: `
      <VcBlade v-bind="args" @close="() => {}">
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
    icon: "fas fa-expand",
    expanded: true,
    toolbarItems: createToolbarItems(3),
  },
  render: (args) => ({
    components: { VcBlade },
    setup() {
      provideMockBladeContext();
      return { args };
    },
    template: `
      <div style="width: 100%; height: 400px; display: flex;">
        <VcBlade v-bind="args" @close="() => {}" @expand="() => {}" @collapse="() => {}">
          <div class="tw-p-6">
            <p class="tw-text-sm tw-text-gray-600">This blade has expanded=true, filling the available width.</p>
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
    icon: "fas fa-home",
    width: 500,
    closable: false,
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
          <p class="tw-text-sm tw-text-gray-600">This blade has closable=false — no close button in the header.</p>
          <p class="tw-text-sm tw-text-gray-600 tw-mt-2">Workspace blades typically are not closable.</p>
        </div>
      </VcBlade>
    `,
  }),
};

export const Mobile: Story = {
  args: {
    title: "Mobile Blade",
    subtitle: "Responsive layout",
    icon: "fas fa-mobile-alt",
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
      <VcBlade v-bind="args" @close="() => {}">
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
          icon="fas fa-compress"
          :width="300"
          @close="() => {}"
        >
          <div class="tw-p-4 tw-text-xs tw-text-gray-600">width: 300 (number → pixels)</div>
        </VcBlade>

        <VcBlade
          title="Wide (60%)"
          icon="fas fa-expand-arrows-alt"
          width="60%"
          @close="() => {}"
        >
          <div class="tw-p-4 tw-text-xs tw-text-gray-600">width: "60%" (string → CSS value)</div>
        </VcBlade>
      </div>
    `,
  }),
};

export const ToolbarOverflow: Story = {
  args: {
    title: "Many Actions",
    subtitle: "Toolbar overflow demo",
    icon: "fas fa-tools",
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
      <VcBlade v-bind="args" @close="() => {}">
        <div class="tw-p-6">
          <p class="tw-text-sm tw-text-gray-600">With 10 toolbar items in a 400px blade, items that don't fit are moved to a "More" dropdown.</p>
          <p class="tw-text-sm tw-text-gray-600 tw-mt-2">This uses the useAdaptiveItems composable with ResizeObserver.</p>
        </div>
      </VcBlade>
    `,
  }),
};
