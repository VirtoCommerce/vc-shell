import { defineComponent, onUnmounted } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SettingsMenu from "@shared/components/settings-menu/settings-menu.vue";
import { provideSettingsMenu } from "@core/composables/useSettingsMenu";
import { SettingsMenuItem } from "@shared/components/settings-menu-item";
import { ThemeSelector } from "@shared/components/theme-selector";
import { LanguageSelector } from "@shared/components/language-selector";

const MockActionItem = defineComponent({
  name: "MockActionItem",
  components: { SettingsMenuItem },
  props: {
    title: { type: String, required: true },
    icon: { type: String, required: true },
  },
  template: `
    <SettingsMenuItem
      :title="title"
      :icon="icon"
    />
  `,
});

const BASE_ITEM_IDS = [
  "story-theme-selector",
  "story-language-selector",
  "story-security-action",
  "story-logout-action",
] as const;

function unregisterAllItems() {
  const settingsMenu = provideSettingsMenu();
  BASE_ITEM_IDS.forEach((id) => settingsMenu.unregister(id));
}

function registerGroupedItems() {
  const settingsMenu = provideSettingsMenu();
  unregisterAllItems();

  settingsMenu.register({
    id: "story-theme-selector",
    group: "preferences",
    order: 10,
    component: ThemeSelector,
  });
  settingsMenu.register({
    id: "story-language-selector",
    group: "preferences",
    order: 20,
    component: LanguageSelector,
  });
  settingsMenu.register({
    id: "story-security-action",
    group: "account",
    order: 30,
    component: MockActionItem,
    props: {
      title: "Security audit",
      icon: "lucide-shield-check",
    },
  });
  settingsMenu.register({
    id: "story-logout-action",
    group: "account",
    order: 100,
    component: MockActionItem,
    props: {
      title: "Sign out",
      icon: "lucide-log-out",
    },
  });
}

const meta = {
  title: "Shared/SettingsMenu",
  component: SettingsMenu,
  tags: ["autodocs"],
  decorators: [
    () => ({
      setup() {
        registerGroupedItems();
        onUnmounted(() => unregisterAllItems());
      },
      template: `
        <div class="tw-w-[300px] tw-rounded-lg tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50 tw-py-1">
          <story />
        </div>
      `,
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Settings menu container that groups registered menu items by `group` and sorts by `order`. This story uses the real registration service to mirror shell behavior.",
      },
    },
  },
} satisfies Meta<typeof SettingsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GroupedMenu: Story = {};
