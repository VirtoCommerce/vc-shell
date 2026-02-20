import { onUnmounted } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ThemeSelector from "@shared/components/theme-selector/theme-selector.vue";
import { useTheme } from "@core/composables/useTheme";

const STORY_THEMES = [{ key: "green" }, { key: "dark" }] as const;

const meta = {
  title: "Shared/ThemeSelector",
  component: ThemeSelector,
  tags: ["autodocs"],
  decorators: [
    () => ({
      setup() {
        const { register, unregister, setTheme } = useTheme();
        register(STORY_THEMES as unknown as { key: string }[]);
        setTheme("green");

        onUnmounted(() => {
          unregister(STORY_THEMES.map((theme) => theme.key));
          setTheme("light");
        });
      },
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
          "Settings menu entry for theme switching. Uses `useTheme()` registry and displays current selected theme with a cascading submenu.",
      },
    },
  },
} satisfies Meta<typeof ThemeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkPreset: Story = {
  render: () => ({
    components: { ThemeSelector },
    setup() {
      const { setTheme } = useTheme();
      setTheme("dark");
      onUnmounted(() => setTheme("light"));
    },
    template: `<ThemeSelector />`,
  }),
};
