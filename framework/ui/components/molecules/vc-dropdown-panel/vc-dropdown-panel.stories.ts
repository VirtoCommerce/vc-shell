import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, onMounted } from "vue";

import VcDropdownPanel from "./vc-dropdown-panel.vue";

/**
 * `VcDropdownPanel` is a floating dropdown panel positioned relative to an anchor element.
 *
 * Built on `@floating-ui/vue`, it supports:
 * - Configurable placement (top, bottom, left, right and their start/end variants)
 * - Document-level click-outside close
 * - Escape key close
 * - Header with title and close button
 * - Scrollable content area
 * - Optional footer slot
 * - Nested panel support via anchor registry
 *
 * The panel is teleported to the document body for proper z-index stacking.
 */
const meta = {
  title: "Overlay/VcDropdownPanel",
  component: VcDropdownPanel,
  tags: ["autodocs"],
  argTypes: {
    show: {
      description: "Whether the panel is visible (v-model:show)",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Model",
      },
    },
    anchorRef: {
      description: "Anchor HTML element for floating positioning",
      control: false,
      table: {
        type: { summary: "HTMLElement | null" },
        defaultValue: { summary: "null" },
        category: "Data",
      },
    },
    title: {
      description: "Panel header title text. Header is hidden when empty and no #header slot is provided",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '""' },
        category: "Appearance",
      },
    },
    placement: {
      description: "Floating UI placement relative to anchor",
      control: "select",
      options: [
        "top",
        "top-start",
        "top-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "left-start",
        "left-end",
        "right",
        "right-start",
        "right-end",
      ],
      table: {
        type: { summary: "Placement" },
        defaultValue: { summary: '"bottom-start"' },
        category: "Layout",
      },
    },
    width: {
      description: "Panel min-width CSS value",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '"280px"' },
        category: "Layout",
      },
    },
    maxWidth: {
      description: "Panel max-width CSS value",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '"400px"' },
        category: "Layout",
      },
    },
    maxHeight: {
      description: "Max panel height in pixels, clamped by viewport available height",
      control: { type: "number", min: 100, max: 800 },
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "350" },
        category: "Layout",
      },
    },
    contentScrollable: {
      description: "Enable internal content scrolling for the panel body",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "Appearance",
      },
    },
    closeOnClickOutside: {
      description: "Close the panel when clicking outside of it",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "State",
      },
    },
    closeOnEscape: {
      description: "Close the panel when pressing the Escape key",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "State",
      },
    },
    "onUpdate:show": {
      description: "Emitted when panel visibility changes",
      table: { category: "Events" },
    },
    default: {
      description: "Main content area of the panel",
      table: { category: "Slots" },
    },
    header: {
      description: "Custom header content. Receives `close` function as slot prop",
      table: { category: "Slots" },
    },
    footer: {
      description: "Optional footer area, typically for action buttons",
      table: { category: "Slots" },
    },
  },
  args: {
    show: true,
    title: "Panel Title",
    placement: "bottom-start",
    width: "280px",
    maxWidth: "400px",
    maxHeight: 350,
    contentScrollable: true,
    closeOnClickOutside: true,
    closeOnEscape: true,
  },
  parameters: {
    docs: {
      description: {
        component: `
A reusable floating dropdown panel that positions itself relative to an anchor element using Floating UI.

Features:
- Teleported to document body for proper stacking
- Automatic repositioning with flip/shift middleware
- Click-outside and Escape key dismissal
- Header with title and close button (or custom header slot)
- Scrollable content body
- Optional footer slot for action buttons

## Usage

\`\`\`vue
<template>
  <button ref="anchorEl" @click="open = !open">Toggle</button>
  <VcDropdownPanel
    v-model:show="open"
    :anchor-ref="anchorEl"
    title="My Panel"
  >
    <p>Panel content here</p>
  </VcDropdownPanel>
</template>
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof VcDropdownPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const updateShowAction = (...args: unknown[]) => console.log("update:show", ...args);

/**
 * Basic dropdown panel with a title header and text content.
 * Click the button to toggle the panel open/closed.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcDropdownPanel },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const isOpen = ref(false);

      onMounted(() => {
        isOpen.value = true;
      });

      const onUpdateShow = (val: boolean) => {
        isOpen.value = val;
        updateShowAction(val);
      };

      return { args, anchorEl, isOpen, onUpdateShow };
    },
    template: `
      <div class="tw-p-8">
        <button
          ref="anchorEl"
          class="tw-px-4 tw-py-2 tw-bg-[var(--primary-500)] tw-text-white tw-rounded tw-border-none tw-cursor-pointer"
          @click="isOpen = !isOpen"
        >
          Toggle Panel
        </button>
        <VcDropdownPanel
          v-bind="args"
          :show="isOpen"
          :anchor-ref="anchorEl"
          @update:show="onUpdateShow"
        >
          <div class="tw-p-4">
            <p class="tw-m-0 tw-text-sm">This is the panel content area. It supports any content including forms, lists, or custom layouts.</p>
          </div>
        </VcDropdownPanel>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "The default dropdown panel with a title header, text content, and toggle button anchor.",
      },
    },
  },
};

/**
 * Panel without a title header, showing only the content area.
 */
export const NoHeader: Story = {
  args: {
    title: "",
  },
  render: (args) => ({
    components: { VcDropdownPanel },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const isOpen = ref(false);

      onMounted(() => {
        isOpen.value = true;
      });

      const onUpdateShow = (val: boolean) => {
        isOpen.value = val;
        updateShowAction(val);
      };

      return { args, anchorEl, isOpen, onUpdateShow };
    },
    template: `
      <div class="tw-p-8">
        <button
          ref="anchorEl"
          class="tw-px-4 tw-py-2 tw-bg-[var(--primary-500)] tw-text-white tw-rounded tw-border-none tw-cursor-pointer"
          @click="isOpen = !isOpen"
        >
          Toggle Panel
        </button>
        <VcDropdownPanel
          v-bind="args"
          :show="isOpen"
          :anchor-ref="anchorEl"
          @update:show="onUpdateShow"
        >
          <div class="tw-p-4">
            <p class="tw-m-0 tw-text-sm">Panel without a header. The title prop is empty and no #header slot is provided.</p>
          </div>
        </VcDropdownPanel>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "When no title is provided and no #header slot is used, the header section is completely hidden.",
      },
    },
  },
};

/**
 * Panel with a footer slot containing action buttons.
 */
export const WithFooter: Story = {
  render: (args) => ({
    components: { VcDropdownPanel },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const isOpen = ref(false);

      onMounted(() => {
        isOpen.value = true;
      });

      const onUpdateShow = (val: boolean) => {
        isOpen.value = val;
        updateShowAction(val);
      };

      return { args, anchorEl, isOpen, onUpdateShow };
    },
    template: `
      <div class="tw-p-8">
        <button
          ref="anchorEl"
          class="tw-px-4 tw-py-2 tw-bg-[var(--primary-500)] tw-text-white tw-rounded tw-border-none tw-cursor-pointer"
          @click="isOpen = !isOpen"
        >
          Toggle Panel
        </button>
        <VcDropdownPanel
          v-bind="args"
          :show="isOpen"
          :anchor-ref="anchorEl"
          @update:show="onUpdateShow"
        >
          <div class="tw-p-4">
            <p class="tw-m-0 tw-text-sm">Select your preferences below and confirm with the footer buttons.</p>
            <div class="tw-mt-3 tw-flex tw-flex-col tw-gap-2">
              <label class="tw-flex tw-items-center tw-gap-2 tw-text-sm">
                <input type="checkbox" checked /> Option A
              </label>
              <label class="tw-flex tw-items-center tw-gap-2 tw-text-sm">
                <input type="checkbox" /> Option B
              </label>
              <label class="tw-flex tw-items-center tw-gap-2 tw-text-sm">
                <input type="checkbox" /> Option C
              </label>
            </div>
          </div>
          <template #footer>
            <button
              class="tw-px-3 tw-py-1.5 tw-text-sm tw-bg-transparent tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded tw-cursor-pointer"
              @click="isOpen = false"
            >
              Cancel
            </button>
            <button
              class="tw-px-3 tw-py-1.5 tw-text-sm tw-bg-[var(--primary-500)] tw-text-white tw-border-none tw-rounded tw-cursor-pointer"
              @click="isOpen = false"
            >
              Apply
            </button>
          </template>
        </VcDropdownPanel>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "The footer slot is ideal for action buttons like Apply/Cancel. The footer has a subtle background and top border to separate it from content.",
      },
    },
  },
};

/**
 * Panel with scrollable content demonstrating maxHeight constraint.
 */
export const ScrollableContent: Story = {
  args: {
    title: "Long Content",
    maxHeight: 250,
  },
  render: (args) => ({
    components: { VcDropdownPanel },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const isOpen = ref(false);

      onMounted(() => {
        isOpen.value = true;
      });

      const onUpdateShow = (val: boolean) => {
        isOpen.value = val;
        updateShowAction(val);
      };

      const listItems = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

      return { args, anchorEl, isOpen, onUpdateShow, listItems };
    },
    template: `
      <div class="tw-p-8">
        <button
          ref="anchorEl"
          class="tw-px-4 tw-py-2 tw-bg-[var(--primary-500)] tw-text-white tw-rounded tw-border-none tw-cursor-pointer"
          @click="isOpen = !isOpen"
        >
          Toggle Panel
        </button>
        <VcDropdownPanel
          v-bind="args"
          :show="isOpen"
          :anchor-ref="anchorEl"
          @update:show="onUpdateShow"
        >
          <div class="tw-py-1">
            <div
              v-for="item in listItems"
              :key="item"
              class="tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer hover:tw-bg-[var(--neutrals-100)]"
            >
              {{ item }}
            </div>
          </div>
        </VcDropdownPanel>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "When content exceeds `maxHeight`, the content area becomes scrollable while the header and footer remain fixed. The maxHeight is also clamped by the available viewport space via Floating UI.",
      },
    },
  },
};

/**
 * Different placement options demonstrated side by side.
 */
export const Placements: Story = {
  render: () => ({
    components: { VcDropdownPanel },
    setup() {
      const anchors = ref<Record<string, HTMLElement | null>>({});
      const openPanels = ref<Record<string, boolean>>({});

      const placements = ["bottom-start", "bottom-end", "top-start", "right-start"] as const;

      const toggle = (placement: string) => {
        openPanels.value[placement] = !openPanels.value[placement];
      };

      const setAnchor = (el: unknown, placement: string) => {
        anchors.value[placement] = el as HTMLElement;
      };

      return { anchors, openPanels, placements, toggle, setAnchor };
    },
    template: `
      <div class="tw-p-16 tw-flex tw-flex-wrap tw-gap-8">
        <div v-for="placement in placements" :key="placement">
          <button
            :ref="(el) => setAnchor(el, placement)"
            class="tw-px-3 tw-py-1.5 tw-text-xs tw-bg-[var(--primary-500)] tw-text-white tw-rounded tw-border-none tw-cursor-pointer"
            @click="toggle(placement)"
          >
            {{ placement }}
          </button>
          <VcDropdownPanel
            :show="!!openPanels[placement]"
            :anchor-ref="anchors[placement]"
            :placement="placement"
            title=""
            width="180px"
            @update:show="(v) => openPanels[placement] = v"
          >
            <div class="tw-p-3 tw-text-xs">
              Placed: <strong>{{ placement }}</strong>
            </div>
          </VcDropdownPanel>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Floating UI placement controls where the panel appears relative to the anchor. The panel will automatically flip or shift if there is not enough space in the preferred direction.",
      },
    },
  },
};

/**
 * Interactive story demonstrating toggle behavior, click-outside, and Escape key dismissal.
 */
export const Interactive: Story = {
  render: (args) => ({
    components: { VcDropdownPanel },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const isOpen = ref(false);
      const log = ref<string[]>([]);

      const onUpdateShow = (val: boolean) => {
        isOpen.value = val;
        log.value.unshift(`Panel ${val ? "opened" : "closed"} at ${new Date().toLocaleTimeString()}`);
        if (log.value.length > 5) log.value.pop();
        updateShowAction(val);
      };

      return { args, anchorEl, isOpen, onUpdateShow, log };
    },
    template: `
      <div class="tw-p-8">
        <div class="tw-flex tw-gap-4 tw-items-start">
          <div>
            <button
              ref="anchorEl"
              class="tw-px-4 tw-py-2 tw-bg-[var(--primary-500)] tw-text-white tw-rounded tw-border-none tw-cursor-pointer"
              @click="isOpen = !isOpen"
            >
              {{ isOpen ? 'Close' : 'Open' }} Panel
            </button>
            <VcDropdownPanel
              v-bind="args"
              :show="isOpen"
              :anchor-ref="anchorEl"
              title="Interactive Panel"
              @update:show="onUpdateShow"
            >
              <div class="tw-p-4">
                <p class="tw-m-0 tw-text-sm">Try these interactions:</p>
                <ul class="tw-mt-2 tw-mb-0 tw-pl-5 tw-text-sm tw-flex tw-flex-col tw-gap-1">
                  <li>Click outside to close</li>
                  <li>Press Escape to close</li>
                  <li>Click the X button in the header</li>
                </ul>
              </div>
            </VcDropdownPanel>
          </div>
          <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
            <strong>Event log:</strong>
            <div v-for="(entry, i) in log" :key="i" class="tw-mt-1">{{ entry }}</div>
            <div v-if="!log.length" class="tw-mt-1 tw-italic">No events yet</div>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates all close mechanisms: click-outside, Escape key, header close button, and anchor toggle. The event log shows open/close activity.",
      },
    },
  },
};

/**
 * Panel with custom header slot instead of the default title.
 */
export const CustomHeader: Story = {
  args: {
    title: "",
  },
  render: (args) => ({
    components: { VcDropdownPanel },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const isOpen = ref(false);

      onMounted(() => {
        isOpen.value = true;
      });

      const onUpdateShow = (val: boolean) => {
        isOpen.value = val;
        updateShowAction(val);
      };

      return { args, anchorEl, isOpen, onUpdateShow };
    },
    template: `
      <div class="tw-p-8">
        <button
          ref="anchorEl"
          class="tw-px-4 tw-py-2 tw-bg-[var(--primary-500)] tw-text-white tw-rounded tw-border-none tw-cursor-pointer"
          @click="isOpen = !isOpen"
        >
          Toggle Panel
        </button>
        <VcDropdownPanel
          v-bind="args"
          :show="isOpen"
          :anchor-ref="anchorEl"
          @update:show="onUpdateShow"
        >
          <template #header="{ close }">
            <div class="tw-flex tw-items-center tw-justify-between tw-w-full tw-px-4 tw-py-3">
              <div class="tw-flex tw-items-center tw-gap-2">
                <span class="tw-w-2 tw-h-2 tw-rounded-full tw-bg-[var(--success-500)]"></span>
                <span class="tw-font-semibold tw-text-sm">Custom Header</span>
              </div>
              <button
                class="tw-text-xs tw-text-[var(--primary-500)] tw-bg-transparent tw-border-none tw-cursor-pointer tw-underline"
                @click="close"
              >
                Dismiss
              </button>
            </div>
          </template>
          <div class="tw-p-4">
            <p class="tw-m-0 tw-text-sm">The #header slot receives a <code>close</code> function so custom headers can dismiss the panel.</p>
          </div>
        </VcDropdownPanel>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "The `#header` slot replaces the default title + close button. It receives a `close` function as a slot prop for custom dismiss controls.",
      },
    },
  },
};

/**
 * Accessibility features: the panel closes on Escape key and traps focus within.
 */
export const Accessibility: Story = {
  render: (args) => ({
    components: { VcDropdownPanel },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const isOpen = ref(false);

      onMounted(() => {
        isOpen.value = true;
      });

      const onUpdateShow = (val: boolean) => {
        isOpen.value = val;
        updateShowAction(val);
      };

      return { args, anchorEl, isOpen, onUpdateShow };
    },
    template: `
      <div class="tw-p-8">
        <button
          ref="anchorEl"
          class="tw-px-4 tw-py-2 tw-bg-[var(--primary-500)] tw-text-white tw-rounded tw-border-none tw-cursor-pointer"
          @click="isOpen = !isOpen"
        >
          Open Accessible Panel
        </button>
        <VcDropdownPanel
          v-bind="args"
          :show="isOpen"
          :anchor-ref="anchorEl"
          title="Accessible Panel"
          @update:show="onUpdateShow"
        >
          <div class="tw-p-4 tw-flex tw-flex-col tw-gap-3">
            <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm">
              Name
              <input
                type="text"
                class="tw-px-2 tw-py-1 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded tw-text-sm"
                placeholder="Enter name..."
              />
            </label>
            <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm">
              Email
              <input
                type="email"
                class="tw-px-2 tw-py-1 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded tw-text-sm"
                placeholder="Enter email..."
              />
            </label>
            <p class="tw-m-0 tw-text-xs tw-text-[var(--neutrals-400)]">
              Press <kbd class="tw-px-1 tw-py-0.5 tw-bg-[var(--neutrals-100)] tw-rounded tw-text-xs">Esc</kbd> to close this panel.
              The close button has <code>aria-label="Close"</code>.
            </p>
          </div>
        </VcDropdownPanel>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "The panel supports keyboard dismissal via Escape and the close button has an `aria-label=\"Close\"` attribute. Form elements inside the panel are fully keyboard accessible.",
      },
    },
  },
};
