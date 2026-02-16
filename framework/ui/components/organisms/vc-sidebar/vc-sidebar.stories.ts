import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcSidebar } from "./";
import { VcButton, VcIcon } from "../../atoms";

/**
 * `VcSidebar` is a modern overlay panel for contextual workflows and settings.
 *
 * Features:
 * - animated transitions (left/right/bottom)
 * - scroll locking for modal mode
 * - keyboard support (`Escape`, focus trap)
 * - return focus to trigger on close
 * - visual variants (`default`, `elevated`, `minimal`)
 * - responsive sizing (`sm`, `md`, `lg`, `full`)
 */
const meta = {
  title: "Organisms/VcSidebar",
  component: VcSidebar,
  tags: ["autodocs"],
  args: {
    position: "right",
    size: "md",
    variant: "elevated",
    title: "Project settings",
    subtitle: "Control visibility, permissions, and publishing",
    closeButton: true,
    showOverlay: true,
    closeOnEscape: true,
    closeOnOverlay: true,
    trapFocus: true,
    lockScroll: true,
    returnFocus: true,
    autoFocus: true,
    inset: true,
  },
  argTypes: {
    position: {
      control: "select",
      options: ["left", "right", "bottom"],
      table: { category: "Layout" },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "full"],
      table: { category: "Layout" },
    },
    variant: {
      control: "select",
      options: ["default", "elevated", "minimal"],
      table: { category: "Appearance" },
    },
    width: {
      control: "text",
      table: { category: "Layout" },
    },
    height: {
      control: "text",
      table: { category: "Layout" },
    },
    inset: {
      control: "boolean",
      table: { category: "Layout" },
    },
    trapFocus: {
      control: "boolean",
      table: { category: "Accessibility" },
    },
    lockScroll: {
      control: "boolean",
      table: { category: "Behavior" },
    },
    returnFocus: {
      control: "boolean",
      table: { category: "Behavior" },
    },
    closeOnEscape: {
      control: "boolean",
      table: { category: "Behavior" },
    },
    closeOnOverlay: {
      control: "boolean",
      table: { category: "Behavior" },
    },
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof VcSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ElevatedPanel: Story = {
  render: (args) => ({
    components: { VcSidebar, VcButton, VcIcon },
    setup() {
      const opened = ref(false);
      const lastCloseReason = ref("-");
      return {
        args,
        opened,
        lastCloseReason,
        onClose: (reason: string) => {
          lastCloseReason.value = reason;
        },
      };
    },
    template: `
      <div class="tw-min-h-screen tw-bg-gradient-to-br tw-from-[var(--additional-50)] tw-to-[var(--neutrals-100)] tw-p-10">
        <div class="tw-mx-auto tw-max-w-5xl tw-rounded-2xl tw-border tw-border-solid tw-border-[var(--neutrals-200)] tw-bg-[var(--additional-50)] tw-p-8">
          <div class="tw-flex tw-items-center tw-justify-between tw-gap-4">
            <div>
              <p class="tw-text-sm tw-text-[var(--neutrals-500)]">Sidebar demo</p>
              <p class="tw-text-2xl tw-font-semibold tw-text-[var(--neutrals-900)]">Workspace shell</p>
            </div>
            <VcButton @click="opened = true">
              <span class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="material-tune" size="m" />
                Open settings
              </span>
            </VcButton>
          </div>

          <p class="tw-mt-3 tw-text-sm tw-text-[var(--neutrals-600)]">
            Last close reason: <span class="tw-font-semibold">{{ lastCloseReason }}</span>
          </p>
        </div>

        <VcSidebar
          v-bind="args"
          :model-value="opened"
          @update:modelValue="opened = $event"
          @close="onClose"
        >
          <template #actions>
            <VcButton variant="ghost" size="sm">Preview</VcButton>
          </template>

          <div class="tw-space-y-6 tw-p-6">
            <section class="tw-space-y-2">
              <p class="tw-text-sm tw-font-semibold tw-text-[var(--neutrals-900)]">Visibility</p>
              <p class="tw-text-sm tw-text-[var(--neutrals-600)]">Public project is visible to all authenticated users.</p>
              <VcButton variant="outline" size="sm">Change visibility</VcButton>
            </section>

            <section class="tw-space-y-2">
              <p class="tw-text-sm tw-font-semibold tw-text-[var(--neutrals-900)]">Publishing</p>
              <p class="tw-text-sm tw-text-[var(--neutrals-600)]">3 unpublished changes are waiting for review.</p>
              <VcButton size="sm">Publish now</VcButton>
            </section>
          </div>

          <template #footer>
            <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-p-4">
              <VcButton variant="outline" @click="opened = false">Cancel</VcButton>
              <VcButton @click="opened = false">Save changes</VcButton>
            </div>
          </template>
        </VcSidebar>
      </div>
    `,
  }),
};

export const LeftMinimal: Story = {
  args: {
    position: "left",
    size: "sm",
    variant: "minimal",
    title: "Filters",
    subtitle: "Refine list content",
  },
  render: (args) => ({
    components: { VcSidebar, VcButton, VcIcon },
    setup() {
      const opened = ref(true);
      return { args, opened };
    },
    template: `
      <div class="tw-min-h-screen tw-bg-[var(--additional-50)] tw-p-10">
        <VcSidebar v-bind="args" :model-value="opened" @update:modelValue="opened = $event">
          <div class="tw-space-y-4 tw-p-5">
            <div class="tw-rounded-lg tw-border tw-border-solid tw-border-[var(--neutrals-200)] tw-p-4">
              <p class="tw-text-sm tw-font-semibold tw-text-[var(--neutrals-900)]">Status</p>
              <p class="tw-mt-1 tw-text-sm tw-text-[var(--neutrals-600)]">Published, Draft, Scheduled</p>
            </div>
            <div class="tw-rounded-lg tw-border tw-border-solid tw-border-[var(--neutrals-200)] tw-p-4">
              <p class="tw-text-sm tw-font-semibold tw-text-[var(--neutrals-900)]">Price range</p>
              <p class="tw-mt-1 tw-text-sm tw-text-[var(--neutrals-600)]">$10 to $350</p>
            </div>
          </div>
          <template #footer>
            <div class="tw-flex tw-items-center tw-justify-between tw-gap-2 tw-p-4">
              <VcButton variant="ghost">Reset</VcButton>
              <VcButton @click="opened = false">Apply</VcButton>
            </div>
          </template>
        </VcSidebar>
      </div>
    `,
  }),
};

export const BottomSheet: Story = {
  args: {
    position: "bottom",
    size: "md",
    variant: "elevated",
    title: "Quick actions",
    subtitle: "Mobile-style action sheet",
    inset: true,
  },
  render: (args) => ({
    components: { VcSidebar, VcButton, VcIcon },
    setup() {
      const opened = ref(false);
      return { args, opened };
    },
    template: `
      <div class="tw-min-h-screen tw-bg-[var(--neutrals-100)] tw-p-10">
        <VcButton @click="opened = true">
          <span class="tw-flex tw-items-center tw-gap-2">
            <VcIcon icon="material-more_horiz" size="m" />
            Open bottom sheet
          </span>
        </VcButton>

        <VcSidebar v-bind="args" :model-value="opened" @update:modelValue="opened = $event">
          <div class="tw-grid tw-grid-cols-1 tw-gap-2 tw-p-4 md:tw-grid-cols-2">
            <button class="tw-rounded-lg tw-border tw-border-solid tw-border-[var(--neutrals-200)] tw-bg-transparent tw-p-4 tw-text-left hover:tw-bg-[var(--primary-50)]">
              <p class="tw-text-sm tw-font-semibold">Duplicate</p>
              <p class="tw-text-xs tw-text-[var(--neutrals-600)]">Create a copy of this entry</p>
            </button>
            <button class="tw-rounded-lg tw-border tw-border-solid tw-border-[var(--neutrals-200)] tw-bg-transparent tw-p-4 tw-text-left hover:tw-bg-[var(--primary-50)]">
              <p class="tw-text-sm tw-font-semibold">Archive</p>
              <p class="tw-text-xs tw-text-[var(--neutrals-600)]">Hide from active lists</p>
            </button>
            <button class="tw-rounded-lg tw-border tw-border-solid tw-border-[var(--neutrals-200)] tw-bg-transparent tw-p-4 tw-text-left hover:tw-bg-[var(--primary-50)]">
              <p class="tw-text-sm tw-font-semibold tw-text-[var(--danger-600)]">Delete</p>
              <p class="tw-text-xs tw-text-[var(--neutrals-600)]">Permanently remove this entry</p>
            </button>
          </div>
        </VcSidebar>
      </div>
    `,
  }),
};
