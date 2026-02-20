import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { VcPopup } from ".";
import VcButton from "@ui/components/atoms/vc-button/vc-button.vue";
import VcIcon from "@ui/components/atoms/vc-icon/vc-icon.vue";

const meta = {
  title: "Organisms/VcPopup",
  component: VcPopup,
  argTypes: {
    title: {
      description: "The title of the popup. Can be overridden by the header slot.",
      control: "text",
      table: {
        type: { summary: "string" },
        category: "Props",
      },
    },
    closable: {
      description: "Determines if the popup can be closed by clicking the close button or outside.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "Props",
      },
    },
    variant: {
      description: "The variant of the popup, affecting its icon and styling.",
      control: "select",
      options: ["default", "error", "warning", "success", "info"],
      table: {
        type: { summary: "'default' | 'error' | 'warning' | 'success' | 'info'" },
        defaultValue: { summary: "default" },
        category: "Props",
      },
    },
    isMobileFullscreen: {
      description: "If true, the popup will take up the full screen on mobile views.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Props",
      },
    },
    isFullscreen: {
      description: "If true, the popup will take up the full screen on all views.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Props",
      },
    },
    modalWidth: {
      description: "Custom Tailwind CSS class to set the maximum width of the popup modal.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "tw-max-w-md" },
        category: "Props",
      },
    },
    // Events
    onClose: {
      action: "close",
      description: "Emitted when the popup is requested to close (e.g. by clicking the close button or pressing Esc).",
      table: { category: "Events" },
    },
    // Slots
    header: {
      description: "Slot for custom header content. Overrides the `title` prop.",
      table: { category: "Slots" },
    },
    content: {
      description: "Main content slot for the popup.",
      table: { category: "Slots" },
    },
    footer: {
      description: "Slot for custom footer content. Provides a `close` function in its scope.",
      table: { category: "Slots" },
    },
  },
  args: {
    title: "Default Popup Title",
    closable: true,
    variant: "default",
    isMobileFullscreen: false,
    isFullscreen: false,
    modalWidth: "tw-max-w-md",
  },
  parameters: {
    docs: {
      description: {
        component: `
VcPopup is a versatile modal dialog component used to display information, alerts, or forms on top of the main content.
It supports different variants, fullscreen modes, and customization through props and slots.

## Features
- Customizable title and content.
- Support for different visual variants (default, error, warning, success, info).
- Optional fullscreen mode for mobile and desktop.
- Control over closability.
- Custom modal width using Tailwind CSS classes.
- Slots for header, content, and footer customization.

## Usage

\`\`\`vue
<VcPopup
  title="My Popup"
  :closable="true"
  variant="info"
  @close="handleClose"
>
  <template #content>
    <p>This is the content of the popup.</p>
  </template>
  <template #footer="{ close }">
    <VcButton @click="close">Custom Close</VcButton>
  </template>
</VcPopup>
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof VcPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * This is the default VcPopup. It displays with a standard title and content.
 * The visibility is controlled by a local ref \`showPopup\`.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcPopup, VcButton },
    setup() {
      const showPopup = ref(false);
      const openPopup = () => (showPopup.value = true);
      const closePopup = () => {
        showPopup.value = false;
        args.onClose?.();
      };
      return { args, showPopup, openPopup, closePopup };
    },
    template: `
      <div>
        <VcButton @click="openPopup">Open Default Popup</VcButton>
        <VcPopup v-if="showPopup" v-bind="args" @close="closePopup" >
          <template #content>
            <p class="tw-p-4">This is the main content of the default popup. You can put any HTML structure here.</p>
            <p class="tw-p-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </template>
        </VcPopup>
      </div>
    `,
  }),
  args: {
    title: "Default Popup",
  },
  parameters: {
    docs: {
      description: {
        story: "A basic example of VcPopup with a title and simple text content.",
      },
    },
  },
};

/**
 * VcPopup can display different variants. This story shows all available variants side-by-side.
 * Variants include: default, error, warning, success, and info.
 */
export const Variants: Story = {
  render: (args) => ({
    components: { VcPopup, VcButton },
    setup() {
      const variants = ["default", "error", "warning", "success", "info"] as const;
      type Variant = (typeof variants)[number];
      const showPopup = ref<Record<Variant, boolean>>(
        variants.reduce((acc, v) => ({ ...acc, [v]: false }), {} as Record<Variant, boolean>),
      );
      const openPopup = (variant: Variant) => (showPopup.value[variant] = true);
      const closePopup = (variant: Variant) => {
        showPopup.value[variant] = false;
        args.onClose?.();
      };
      return { args, variants, showPopup, openPopup, closePopup };
    },
    template: `
      <div class="tw-flex tw-flex-wrap tw-gap-4">
        <div v-for="variant in variants" :key="variant">
          <VcButton @click="openPopup(variant)">Open {{ variant }} Popup</VcButton>
          <VcPopup
            v-if="showPopup[variant]"
            v-bind="args"
            :title="variant.charAt(0).toUpperCase() + variant.slice(1) + ' Variant Popup'"
            :variant="variant"
            @close="() => closePopup(variant)"
          >
            <template #content>
              <p class="tw-p-4">This is a popup with the <strong>{{ variant }}</strong> variant.</p>
              <p class="tw-p-4">It includes a relevant icon and specific styling if defined.</p>
            </template>
          </VcPopup>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates all available variants of the VcPopup: default, error, warning, success, and info. Each variant might have a distinct icon and color scheme.",
      },
    },
  },
};

/**
 * VcPopup with a custom footer. The footer slot provides access to a \`close\` function.
 */
export const WithFooter: Story = {
  render: (args) => ({
    components: { VcPopup, VcButton },
    setup() {
      const showPopup = ref(false);
      const openPopup = () => (showPopup.value = true);
      const closePopup = () => {
        showPopup.value = false;
        args.onClose?.();
      };
      return { args, showPopup, openPopup, closePopup };
    },
    template: `
      <div>
        <VcButton @click="openPopup">Open Popup with Footer</VcButton>
        <VcPopup v-if="showPopup" v-bind="args" @close="closePopup" >
          <template #content>
            <p class="tw-p-4">This popup has a custom footer section.</p>
          </template>
          <template #footer="{ close }">
            <div class="tw-flex tw-justify-end tw-w-full tw-gap-3">
              <VcButton variant="outline" @click="close">Cancel</VcButton>
              <VcButton color="primary" @click="() => { alert('Confirmed!'); close(); }">Confirm</VcButton>
            </div>
          </template>
        </VcPopup>
      </div>
    `,
  }),
  args: {
    title: "Popup with Custom Footer",
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates how to use the `footer` slot to add custom action buttons or other content to the bottom of the popup. The slot scope provides a `close` function to close the popup.",
      },
    },
  },
};

/**
 * VcPopup in fullscreen mode. The \`isFullscreen\` prop makes the popup cover the entire screen.
 * The \`isMobileFullscreen\` prop can be used for fullscreen behavior only on mobile devices.
 */
export const Fullscreen: Story = {
  render: (args) => ({
    components: { VcPopup, VcButton },
    setup() {
      const showPopup = ref(false);
      const openPopup = () => (showPopup.value = true);
      const closePopup = () => {
        showPopup.value = false;
        args.onClose?.();
      };
      return { args, showPopup, openPopup, closePopup };
    },
    template: `
      <div>
        <VcButton @click="openPopup">Open Fullscreen Popup</VcButton>
        <VcPopup v-if="showPopup" v-bind="args" @close="closePopup" >
          <template #content>
            <div class="tw-p-4 tw-bg-gray-100 tw-h-full tw-w-full tw-flex tw-items-center tw-justify-center">
              <p>This popup is in fullscreen mode.</p>
            </div>
          </template>
        </VcPopup>
      </div>
    `,
  }),
  args: {
    title: "Fullscreen Popup",
    isFullscreen: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the VcPopup in fullscreen mode using the `isFullscreen` prop. For mobile-only fullscreen, use `isMobileFullscreen`.",
      },
    },
  },
};

/**
 * VcPopup with a custom width. The \`modalWidth\` prop accepts Tailwind CSS width classes.
 */
export const CustomWidth: Story = {
  render: (args) => ({
    components: { VcPopup, VcButton },
    setup() {
      const showPopup = ref(false);
      const openPopup = () => (showPopup.value = true);
      const closePopup = () => {
        showPopup.value = false;
        args.onClose?.();
      };
      return { args, showPopup, openPopup, closePopup };
    },
    template: `
      <div>
        <VcButton @click="openPopup">Open Custom Width Popup</VcButton>
        <VcPopup v-if="showPopup" v-bind="args" @close="closePopup" >
          <template #content>
            <p class="tw-p-4">This popup has a custom width defined by the \`modalWidth\` prop.</p>
            <p class="tw-p-4">Current width class: <strong>{{ args.modalWidth }}</strong></p>
          </template>
        </VcPopup>
      </div>
    `,
  }),
  args: {
    title: "Custom Width Popup",
    modalWidth: "tw-max-w-xl", // Example: 'tw-max-w-lg', 'tw-w-1/2'
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates how to set a custom width for the VcPopup using the `modalWidth` prop. Any valid Tailwind CSS max-width or width class can be used.",
      },
    },
  },
};

/**
 * VcPopup with a custom header using the header slot.
 * This overrides the \`title\` prop.
 */
export const CustomHeader: Story = {
  render: (args) => ({
    components: { VcPopup, VcButton, VcIcon },
    setup() {
      const showPopup = ref(false);
      const openPopup = () => (showPopup.value = true);
      const closePopup = () => {
        showPopup.value = false;
        args.onClose?.();
      };
      return { args, showPopup, openPopup, closePopup };
    },
    template: `
      <div>
        <VcButton @click="openPopup">Open Popup with Custom Header</VcButton>
        <VcPopup v-if="showPopup" v-bind="args" @close="closePopup" >
          <template #header>
            <div class="tw-flex tw-items-center tw-gap-2">
              <VcIcon icon="material-settings" class="tw-text-blue-500" />
              <span class="tw-font-bold tw-text-blue-500">Custom Settings Panel</span>
            </div>
          </template>
          <template #content>
            <p class="tw-p-4">This popup uses the <strong>#header</strong> slot for a completely custom header.</p>
          </template>
        </VcPopup>
      </div>
    `,
  }),
  args: {
    // Title prop is not used here as the slot overrides it
    title: "This title will be overridden",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows how to use the `header` slot to provide a fully custom header for the VcPopup. This will replace the default title rendering.",
      },
    },
  },
};
