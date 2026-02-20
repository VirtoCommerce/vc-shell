import { onUnmounted } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import LanguageSelector from "@shared/components/language-selector/language-selector.vue";
import { useLanguages } from "@core/composables/useLanguages";

const meta = {
  title: "Shared/LanguageSelector",
  component: LanguageSelector,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template: `
        <div class="tw-w-[300px] tw-rounded-lg tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50 tw-p-1">
          <story />
        </div>
      `,
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Settings menu entry for language switching. Uses framework language service and global i18n locale list.",
      },
    },
  },
} satisfies Meta<typeof LanguageSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GermanPreset: Story = {
  render: () => ({
    components: { LanguageSelector },
    setup() {
      const { setLocale } = useLanguages();
      setLocale("de");
      onUnmounted(() => setLocale("en"));
    },
    template: `<LanguageSelector />`,
  }),
};
