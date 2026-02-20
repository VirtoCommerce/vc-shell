import { computed, ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import VcLanguageSelector from "@shared/components/multilanguage-selector/multilanguage-selector.vue";
import usFlag from "@assets/icons/flags/us.svg";
import deFlag from "@assets/icons/flags/de.svg";
import frFlag from "@assets/icons/flags/fr.svg";

const languageOptions = [
  { value: "en-US", label: "English", flag: usFlag },
  { value: "de-DE", label: "Deutsch", flag: deFlag },
  { value: "fr-FR", label: "Français", flag: frFlag },
];

const meta = {
  title: "Shared/VcLanguageSelector",
  component: VcLanguageSelector,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template: `
        <div class="tw-p-6 tw-bg-additional-50 tw-border tw-border-solid tw-border-neutrals-200 tw-rounded-lg tw-inline-flex tw-items-center tw-gap-4">
          <story />
        </div>
      `,
    }),
  ],
  args: {
    options: languageOptions,
    modelValue: "en-US",
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Compact language selector used in details blades (offers/products). Stories mirror the vendor-portal behavior with language switching and disabled state.",
      },
    },
  },
} satisfies Meta<typeof VcLanguageSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: (args) => ({
    components: { VcLanguageSelector },
    setup() {
      const selected = ref(args.modelValue);
      const selectedLabel = computed(() => {
        return languageOptions.find((item) => item.value === selected.value)?.label ?? "Unknown";
      });

      return { args, selected, selectedLabel };
    },
    template: `
      <div class="tw-flex tw-items-center tw-gap-3">
        <VcLanguageSelector
          v-bind="args"
          :model-value="selected"
          @update:model-value="selected = $event"
        />
        <span class="tw-text-sm tw-text-neutrals-700">Current language: {{ selectedLabel }}</span>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    components: { VcLanguageSelector },
    setup() {
      const selected = ref(args.modelValue);
      return { args, selected };
    },
    template: `
      <div class="tw-flex tw-items-center tw-gap-3">
        <VcLanguageSelector
          v-bind="args"
          :model-value="selected"
          @update:model-value="selected = $event"
        />
        <span class="tw-text-sm tw-text-neutrals-500">Readonly mode</span>
      </div>
    `,
  }),
};
