import { computed, ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, within } from "storybook/test";
import { VcDropdown } from "@ui/components/molecules/vc-dropdown";
import { VcInput } from "@ui/components/molecules/vc-input";
import { VcButton, VcIcon } from "@ui/components/atoms";

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
    icon: "lucide-folder-open",
  },
  {
    id: "duplicate",
    title: "Duplicate",
    description: "Create a copy with the same configuration",
    shortcut: "D",
    icon: "lucide-files",
  },
  {
    id: "archive",
    title: "Archive",
    description: "Hide from active workspace without deleting",
    shortcut: "A",
    icon: "lucide-package",
  },
  {
    id: "delete",
    title: "Delete",
    description: "Permanently remove this project",
    shortcut: "Del",
    danger: true,
    icon: "lucide-trash-2",
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
  title: "Overlay/VcDropdown",
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
    ariaLabel: {
      description: "Accessible name for the panel (required for a named listbox)",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
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
      <div class="tw-min-h-[300px] tw-rounded-xl tw-border tw-border-solid tw-border-neutrals-200 tw-bg-gradient-to-br tw-from-additional-50 tw-to-neutrals-100 tw-p-6">
        <div class="tw-mb-5 tw-flex tw-items-center tw-justify-between">
          <div>
            <p class="tw-text-sm tw-text-neutrals-500">Contextual action menu</p>
            <p class="tw-text-base tw-font-semibold tw-text-neutrals-900">Project: Atlas Backoffice</p>
          </div>
          <span class="tw-rounded-full tw-bg-primary-100 tw-px-3 tw-py-1 tw-text-xs tw-font-medium tw-text-primary-700">
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
                <VcIcon icon="lucide-ellipsis" size="m" />
                Actions
                <VcIcon :icon="isActive ? 'lucide-chevron-up' : 'lucide-chevron-down'" size="m" />
              </span>
            </VcButton>
          </template>

          <template #item="{ item, click }">
            <button
              type="button"
              class="tw-flex tw-w-[320px] tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-bg-transparent tw-px-2 tw-py-1.5 tw-text-start"
              @click="click"
            >
              <div class="tw-flex tw-items-center tw-gap-2">
                <VcIcon :icon="item.icon" size="s" class="tw-shrink-0 tw-text-neutrals-500" />
                <span
                  class="tw-text-sm"
                  :class="item.danger ? 'tw-text-danger-600' : 'tw-text-neutrals-900'"
                >
                  {{ item.title }}
                </span>
              </div>
              <kbd class="tw-rounded tw-border tw-border-solid tw-border-neutrals-200 tw-bg-neutrals-50 tw-px-1.5 tw-py-0.5 tw-font-mono tw-text-[11px] tw-text-neutrals-500">
                {{ item.shortcut }}
              </kbd>
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
      <div class="tw-min-h-[300px] tw-rounded-xl tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50 tw-p-6">
        <p class="tw-mb-1 tw-text-sm tw-text-neutrals-500">Workspace switcher</p>
        <p class="tw-mb-5 tw-text-base tw-font-semibold tw-text-neutrals-900">Current: {{ getTitle(activeWorkspaceId) }}</p>

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
                <VcIcon icon="lucide-layers" size="m" />
                {{ getTitle(activeWorkspaceId) }}
                <VcIcon :icon="isActive ? 'lucide-chevron-up' : 'lucide-chevron-down'" size="m" />
              </span>
            </VcButton>
          </template>

          <template #item="{ item, click }">
            <button
              type="button"
              class="tw-flex tw-w-[280px] tw-items-center tw-justify-between tw-border-0 tw-bg-transparent tw-px-2 tw-py-1.5 tw-text-start"
              @click="click"
            >
              <div>
                <p class="tw-text-sm tw-text-neutrals-900">{{ item.title }}</p>
                <p class="tw-text-xs tw-text-neutrals-500">{{ item.owner }}</p>
              </div>
              <VcIcon
                v-if="item.id === activeWorkspaceId"
                icon="lucide-check"
                size="s"
                class="tw-text-primary-600"
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
    ariaLabel: "Audience segments",
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
      <div class="tw-min-h-[340px] tw-rounded-xl tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50 tw-p-6">
        <p class="tw-mb-1 tw-text-sm tw-text-neutrals-500">Long list + keyboard navigation</p>
        <p class="tw-mb-5 tw-text-sm tw-text-neutrals-700">Use Arrow keys, Enter and Escape.</p>

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
                <VcIcon icon="lucide-list-filter" size="m" />
                Audience segments
                <VcIcon :icon="isActive ? 'lucide-chevron-up' : 'lucide-chevron-down'" size="m" />
              </span>
            </VcButton>
          </template>

          <template #item="{ item }">
            <div class="tw-flex tw-w-[260px] tw-items-center tw-justify-between tw-px-2 tw-py-1.5 tw-text-start">
              <div>
                <p class="tw-text-sm tw-text-neutrals-900">{{ item.title }}</p>
                <p class="tw-text-xs tw-text-neutrals-500">{{ item.description }}</p>
              </div>
              <div
                class="tw-h-2 tw-w-2 tw-rounded-full"
                :class="item.id === activeId ? 'tw-bg-primary-500' : 'tw-bg-neutrals-300'"
              />
            </div>
          </template>
        </VcDropdown>
      </div>
    `,
  }),
};

export const ForceMount: Story = {
  render: (args) => ({
    components: { VcDropdown, VcButton },
    setup() {
      const opened = ref(false);
      const mountedAt = ref(new Date().toLocaleTimeString());
      return { args, opened, mountedAt, workspaceItems };
    },
    template: `
      <div class="tw-min-h-[240px] tw-rounded-xl tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50 tw-p-6">
        <p class="tw-mb-4 tw-text-sm tw-text-neutrals-700">
          Panel content stays mounted while closed. It was created at {{ mountedAt }} and keeps that value across toggles.
        </p>

        <VcDropdown
          v-bind="args"
          force-mount
          :items="workspaceItems"
          :model-value="opened"
          @update:modelValue="opened = $event"
        >
          <template #trigger="{ toggle }">
            <VcButton variant="ghost" @click="toggle">Toggle</VcButton>
          </template>
          <template #item="{ item }">
            <div class="tw-px-2 tw-py-1.5 tw-text-sm">{{ item.title }} ({{ mountedAt }})</div>
          </template>
        </VcDropdown>
      </div>
    `,
  }),
};

const fruits = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Grape", "Mango"];

/**
 * Combobox mode: the field in the trigger keeps the focus and its arrow keys move the active option;
 * Enter or a click takes it. The list is not focusable, and the field names the active option.
 */
export const Combobox: Story = {
  render: (args) => ({
    components: { VcDropdown, VcInput },
    setup() {
      const text = ref("");
      const focused = ref(false);
      const active = ref(0);
      const picked = ref("");
      const items = computed(() => fruits.filter((f) => f.toLowerCase().startsWith(text.value.toLowerCase())));
      const open = computed(() => focused.value && !!text.value && items.value.length > 0);
      const pick = (item: string) => {
        picked.value = item;
        text.value = "";
      };
      const onKeydown = (e: KeyboardEvent) => {
        if (!open.value) return;
        const n = items.value.length;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          active.value = (active.value + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
        } else if (e.key === "Enter") {
          e.preventDefault();
          pick(items.value[active.value]);
        }
      };
      const onText = (v: unknown) => {
        text.value = String(v ?? "");
        active.value = 0;
      };
      return { args, text, focused, active, picked, items, open, pick, onKeydown, onText };
    },
    template: `
      <div class="tw-min-h-[320px] tw-max-w-sm tw-flex tw-flex-col tw-gap-3">
        <VcDropdown
          v-bind="args"
          :model-value="open"
          :items="items"
          role="listbox"
          aria-label="Fruits"
          combobox
          floating
          :teleport="false"
          placement="bottom-start"
          :offset="{ mainAxis: 4 }"
          :auto-focus-panel="false"
          :close-on-escape="false"
          :close-on-click-outside="false"
          :is-item-active="(item) => items.indexOf(item) === active"
          style="--vc-dropdown-trigger-flex: 1 1 auto"
          @item-click="pick"
        >
          <template #trigger="{ panelId, itemId }">
            <VcInput
              class="tw-w-full"
              :model-value="text"
              aria-label="Fruit"
              placeholder="Type a fruit"
              autocomplete="off"
              :input-attrs="{
                role: 'combobox',
                'aria-autocomplete': 'list',
                'aria-expanded': open,
                'aria-controls': open ? panelId : undefined,
                'aria-activedescendant': open ? itemId(active) : undefined,
              }"
              @update:model-value="onText"
              @focus="focused = true"
              @blur="focused = false"
              @keydown="onKeydown"
            />
          </template>
          <template #header>
            <div class="tw-px-2 tw-py-1 tw-text-xs tw-uppercase tw-text-[color:var(--neutrals-500)]">Fruits</div>
          </template>
          <template #item="{ item }">
            <span class="tw-px-1 tw-py-0.5 tw-text-sm">{{ item }}</span>
          </template>
        </VcDropdown>
        <p class="tw-text-sm">Picked: <strong data-testid="picked">{{ picked || "nothing" }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("combobox", { name: "Fruit" });
    await userEvent.click(field);
    await userEvent.type(field, "ap");
    const list = await canvas.findByRole("listbox", { name: "Fruits" });
    await expect(list).not.toHaveAttribute("tabindex", "0");
    await userEvent.keyboard("{ArrowDown}");
    const options = within(list).getAllByRole("option");
    await expect(field).toHaveAttribute("aria-activedescendant", options[1].id);
    await userEvent.click(options[0]);
    await expect(field).toHaveFocus();
    await expect(canvas.getByTestId("picked")).toHaveTextContent("Apple");
  },
};
