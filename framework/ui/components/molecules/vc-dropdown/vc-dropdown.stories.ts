import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcDropdown } from "./";
import { VcButton, VcIcon } from "../../atoms";

type ActionItem = {
  id: string;
  title: string;
  description: string;
  shortcut: string;
  danger?: boolean;
  icon: string;
};

type WorkspaceItem = {
  id: string;
  title: string;
  owner: string;
};

const actionItems: ActionItem[] = [
  {
    id: "open",
    title: "Open project",
    description: "Navigate to the selected project details",
    shortcut: "O",
    icon: "material-folder_open",
  },
  {
    id: "duplicate",
    title: "Duplicate",
    description: "Create a copy with the same configuration",
    shortcut: "D",
    icon: "material-file_copy",
  },
  {
    id: "archive",
    title: "Archive",
    description: "Hide from active workspace without deleting",
    shortcut: "A",
    icon: "material-inventory_2",
  },
  {
    id: "delete",
    title: "Delete",
    description: "Permanently remove this project",
    shortcut: "Del",
    danger: true,
    icon: "material-delete_outline",
  },
];

const workspaceItems: WorkspaceItem[] = [
  { id: "northwind", title: "Northwind B2B", owner: "Commerce Team" },
  { id: "atlas", title: "Atlas Backoffice", owner: "Platform Team" },
  { id: "horizon", title: "Horizon Storefront", owner: "Growth Team" },
  { id: "spectrum", title: "Spectrum Integrations", owner: "Integration Team" },
];

/**
 * `VcDropdown` is a headless, accessible dropdown primitive for menus and listboxes.
 *
 * It provides:
 * - floating positioning via `@floating-ui`
 * - keyboard navigation (`ArrowUp/ArrowDown`, `Home/End`, `Enter`, `Escape`)
 * - ARIA roles (`menu` and `listbox`)
 * - flexible slot API for fully custom trigger and item rendering
 *
 * Use this component as the base for contextual menus, switchers, and compact option pickers.
 */
const meta = {
  title: "Molecules/VcDropdown",
  component: VcDropdown,
  tags: ["autodocs"],
  args: {
    floating: true,
    placement: "bottom-start",
    role: "menu",
    variant: "default",
    closeOnEscape: true,
    closeOnClickOutside: true,
    closeOnSelect: true,
    maxHeight: 320,
  },
  argTypes: {
    modelValue: {
      control: "boolean",
      table: { category: "Model", type: { summary: "boolean" } },
      description: "Controls opened/closed state (v-model).",
    },
    items: {
      control: "object",
      table: { category: "Data", type: { summary: "T[]" } },
      description: "Items to render in default layout or pass to custom slots.",
    },
    itemText: {
      control: false,
      table: { category: "Data", type: { summary: "(item: T) => string" } },
      description: "Maps item to display text in default item renderer.",
    },
    isItemActive: {
      control: false,
      table: { category: "Data", type: { summary: "(item: T) => boolean" } },
      description: "Marks selected item state (especially useful in listbox mode).",
    },
    placement: {
      control: "select",
      options: ["bottom", "bottom-start", "bottom-end", "top", "top-start", "top-end"],
      table: { category: "Positioning", type: { summary: "Placement" } },
    },
    offset: {
      control: "object",
      table: { category: "Positioning", type: { summary: "{ mainAxis?: number; crossAxis?: number }" } },
    },
    floating: {
      control: "boolean",
      table: { category: "Positioning", type: { summary: "boolean" }, defaultValue: { summary: true } },
    },
    teleport: {
      control: "boolean",
      table: { category: "Positioning", type: { summary: "boolean | undefined" } },
      description: "Force teleport behavior. By default follows `floating`.",
    },
    role: {
      control: "select",
      options: ["menu", "listbox"],
      table: { category: "Accessibility", type: { summary: "'menu' | 'listbox'" } },
    },
    closeOnEscape: {
      control: "boolean",
      table: { category: "Behavior", type: { summary: "boolean" } },
    },
    closeOnClickOutside: {
      control: "boolean",
      table: { category: "Behavior", type: { summary: "boolean" } },
    },
    closeOnSelect: {
      control: "boolean",
      table: { category: "Behavior", type: { summary: "boolean" } },
    },
    variant: {
      control: "select",
      options: ["default", "secondary"],
      table: { category: "Appearance", type: { summary: "'default' | 'secondary'" } },
    },
    maxHeight: {
      control: "text",
      table: { category: "Appearance", type: { summary: "number | string" } },
    },
    open: {
      control: false,
      table: { category: "Events", type: { summary: "() => void" } },
    },
    close: {
      control: false,
      table: { category: "Events", type: { summary: "(reason: 'outside' | 'escape' | 'action') => void" } },
    },
    "item-click": {
      control: false,
      table: { category: "Events", type: { summary: "(item: T) => void" } },
    },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Use `VcDropdown` when you need headless control over trigger and item markup while keeping positioning, focus management, and keyboard interactions consistent across the UI kit.",
      },
    },
  },
} satisfies Meta<typeof VcDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActionMenu: Story = {
  args: {
    items: actionItems,
    placement: "bottom-start",
    variant: "secondary",
    closeOnSelect: true,
  },
  render: (args) => ({
    components: { VcDropdown, VcButton, VcIcon },
    setup() {
      const opened = ref(false);
      const selectedAction = ref("No action selected");

      const onSelect = (item: ActionItem) => {
        selectedAction.value = item.title;
      };

      return {
        args,
        opened,
        selectedAction,
        onSelect,
      };
    },
    template: `
      <div class="tw-min-h-[300px] tw-rounded-xl tw-border tw-border-solid tw-border-[var(--neutrals-200)] tw-bg-gradient-to-br tw-from-[var(--additional-50)] tw-to-[var(--neutrals-100)] tw-p-6">
        <div class="tw-mb-5 tw-flex tw-items-center tw-justify-between">
          <div>
            <p class="tw-text-sm tw-text-[var(--neutrals-500)]">Contextual action menu</p>
            <p class="tw-text-base tw-font-semibold tw-text-[var(--neutrals-900)]">Project: Atlas Backoffice</p>
          </div>
          <span class="tw-rounded-full tw-bg-[var(--primary-100)] tw-px-3 tw-py-1 tw-text-xs tw-font-medium tw-text-[var(--primary-700)]">
            Last action: {{ selectedAction }}
          </span>
        </div>

        <VcDropdown
          v-bind="args"
          :model-value="opened"
          @update:modelValue="opened = $event"
          @item-click="onSelect"
        >
          <template #trigger="{ isActive, toggle }">
            <VcButton variant="secondary" @click="toggle">
              <span class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="material-more_horiz" size="m" />
                Actions
                <VcIcon :icon="isActive ? 'material-expand_less' : 'material-expand_more'" size="m" />
              </span>
            </VcButton>
          </template>

          <template #item="{ item, click }">
            <button
              type="button"
              class="tw-flex tw-w-[360px] tw-items-start tw-justify-between tw-gap-3 tw-border-0 tw-bg-transparent tw-px-4 tw-py-3 tw-text-left hover:tw-bg-[var(--primary-50)]"
              @click="click"
            >
              <div class="tw-flex tw-items-start tw-gap-3">
                <VcIcon :icon="item.icon" size="m" class="tw-mt-0.5 tw-text-[var(--neutrals-500)]" />
                <div>
                  <p
                    class="tw-text-sm tw-font-medium"
                    :class="item.danger ? 'tw-text-[var(--danger-600)]' : 'tw-text-[var(--neutrals-900)]'"
                  >
                    {{ item.title }}
                  </p>
                  <p class="tw-mt-0.5 tw-text-xs tw-text-[var(--neutrals-500)]">
                    {{ item.description }}
                  </p>
                </div>
              </div>
              <span class="tw-rounded tw-bg-[var(--neutrals-100)] tw-px-2 tw-py-0.5 tw-text-[11px] tw-font-medium tw-text-[var(--neutrals-600)]">
                {{ item.shortcut }}
              </span>
            </button>
          </template>
        </VcDropdown>
      </div>
    `,
  }),
};

export const WorkspaceSwitcher: Story = {
  args: {
    items: workspaceItems,
    role: "listbox",
    placement: "bottom-end",
    closeOnSelect: true,
    variant: "default",
  },
  render: (args) => ({
    components: { VcDropdown, VcButton, VcIcon },
    setup() {
      const opened = ref(false);
      const activeWorkspaceId = ref("atlas");

      const getTitle = (id: string) => workspaceItems.find((item) => item.id === id)?.title ?? "Choose workspace";

      const onSelect = (item: WorkspaceItem) => {
        activeWorkspaceId.value = item.id;
      };

      return {
        args,
        opened,
        activeWorkspaceId,
        getTitle,
        onSelect,
      };
    },
    template: `
      <div class="tw-min-h-[300px] tw-rounded-xl tw-border tw-border-solid tw-border-[var(--neutrals-200)] tw-bg-[var(--additional-50)] tw-p-6">
        <p class="tw-mb-1 tw-text-sm tw-text-[var(--neutrals-500)]">Workspace switcher</p>
        <p class="tw-mb-5 tw-text-base tw-font-semibold tw-text-[var(--neutrals-900)]">Current: {{ getTitle(activeWorkspaceId) }}</p>

        <VcDropdown
          v-bind="args"
          :model-value="opened"
          :is-item-active="(item) => item.id === activeWorkspaceId"
          @update:modelValue="opened = $event"
          @item-click="onSelect"
        >
          <template #trigger="{ isActive, toggle }">
            <VcButton variant="outline" @click="toggle">
              <span class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="material-layers" size="m" />
                {{ getTitle(activeWorkspaceId) }}
                <VcIcon :icon="isActive ? 'material-expand_less' : 'material-expand_more'" size="m" />
              </span>
            </VcButton>
          </template>

          <template #item="{ item, click }">
            <button
              type="button"
              class="tw-flex tw-w-[320px] tw-items-center tw-justify-between tw-border-0 tw-bg-transparent tw-px-4 tw-py-3 tw-text-left hover:tw-bg-[var(--primary-50)]"
              @click="click"
            >
              <div>
                <p class="tw-text-sm tw-font-medium tw-text-[var(--neutrals-900)]">{{ item.title }}</p>
                <p class="tw-text-xs tw-text-[var(--neutrals-500)]">{{ item.owner }}</p>
              </div>
              <VcIcon
                v-if="item.id === activeWorkspaceId"
                icon="material-check"
                size="m"
                class="tw-text-[var(--primary-600)]"
              />
            </button>
          </template>
        </VcDropdown>
      </div>
    `,
  }),
};

export const ScrollableList: Story = {
  args: {
    closeOnSelect: false,
    role: "listbox",
    maxHeight: 220,
    items: Array.from({ length: 14 }, (_, index) => ({
      id: `filter-${index + 1}`,
      title: `Segment ${index + 1}`,
      description: `Rule set ${index + 1}`,
    })),
  },
  render: (args) => ({
    components: { VcDropdown, VcButton, VcIcon },
    setup() {
      const opened = ref(true);
      const activeId = ref("filter-3");

      return {
        args,
        opened,
        activeId,
      };
    },
    template: `
      <div class="tw-min-h-[340px] tw-rounded-xl tw-border tw-border-solid tw-border-[var(--neutrals-200)] tw-bg-[var(--additional-50)] tw-p-6">
        <p class="tw-mb-1 tw-text-sm tw-text-[var(--neutrals-500)]">Long list + keyboard navigation</p>
        <p class="tw-mb-5 tw-text-sm tw-text-[var(--neutrals-700)]">Use Arrow keys, Enter and Escape.</p>

        <VcDropdown
          v-bind="args"
          :model-value="opened"
          :is-item-active="(item) => item.id === activeId"
          @update:modelValue="opened = $event"
          @item-click="(item) => activeId = item.id"
        >
          <template #trigger="{ isActive, toggle }">
            <VcButton variant="ghost" @click="toggle">
              <span class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="material-filter_list" size="m" />
                Audience segments
                <VcIcon :icon="isActive ? 'material-expand_less' : 'material-expand_more'" size="m" />
              </span>
            </VcButton>
          </template>

          <template #item="{ item, click }">
            <button
              type="button"
              class="tw-flex tw-w-[300px] tw-items-center tw-justify-between tw-border-0 tw-bg-transparent tw-px-4 tw-py-2.5 tw-text-left hover:tw-bg-[var(--primary-50)]"
              @click="click"
            >
              <div>
                <p class="tw-text-sm tw-text-[var(--neutrals-900)]">{{ item.title }}</p>
                <p class="tw-text-xs tw-text-[var(--neutrals-500)]">{{ item.description }}</p>
              </div>
              <div
                class="tw-h-2.5 tw-w-2.5 tw-rounded-full"
                :class="item.id === activeId ? 'tw-bg-[var(--primary-500)]' : 'tw-bg-[var(--neutrals-300)]'"
              />
            </button>
          </template>
        </VcDropdown>
      </div>
    `,
  }),
};
