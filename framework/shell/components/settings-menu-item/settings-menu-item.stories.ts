import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SettingsMenuItem from "@shell/components/settings-menu-item/settings-menu-item.vue";
import VcDropdownItem from "@ui/components/molecules/vc-dropdown/_internal/VcDropdownItem.vue";

/**
 * Individual menu item used inside the settings menu with optional icon, value, and chevron.
 * Supports a `submenu` slot that automatically adapts: floating dropdown on desktop, inline accordion on mobile.
 */
const meta = {
  title: "Shared/SettingsMenuItem",
  component: SettingsMenuItem,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template: `
        <div style="width: 280px; background: var(--additional-50); border: 1px solid var(--neutrals-200); border-radius: 6px; overflow: hidden;">
          <story />
        </div>
      `,
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Reusable settings menu item with icon, title, optional current value, and chevron indicator. Supports click/hover triggers and a built-in submenu slot with responsive desktop/mobile behavior.",
      },
    },
  },
} satisfies Meta<typeof SettingsMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic menu item with icon and title
 */
export const Basic: Story = {
  args: {
    icon: "lucide-log-out",
    title: "Log out",
  },
};

/**
 * Menu item with current value and chevron — used for selectors
 */
export const WithValue: Story = {
  args: {
    icon: "lucide-palette",
    title: "Theme",
    value: "Light",
    showChevron: true,
  },
};

/**
 * Menu item with chevron but no value — used for actions that open something
 */
export const WithChevron: Story = {
  args: {
    icon: "lucide-bolt",
    title: "Change password",
    showChevron: true,
  },
};

/**
 * Active state (when sub-menu is open)
 */
export const Active: Story = {
  args: {
    icon: "lucide-palette",
    title: "Theme",
    value: "Light",
    showChevron: true,
    isActive: true,
  },
};

/**
 * Full settings menu simulation with groups and separators
 */
export const FullMenu: Story = {
  render: () => ({
    components: { SettingsMenuItem },
    template: `
      <div style="padding: 4px 0;">
        <SettingsMenuItem
          icon="lucide-palette"
          title="Theme selector"
          value="Light"
          :show-chevron="true"
        />
        <SettingsMenuItem
          icon="lucide-languages"
          title="Language selector"
          value="English"
          :show-chevron="true"
        />
        <div style="margin: 4px 12px; border-top: 1px solid var(--neutrals-200);"></div>
        <SettingsMenuItem
          icon="lucide-key"
          title="Change password"
        />
        <SettingsMenuItem
          icon="lucide-log-out"
          title="Log out"
        />
      </div>
    `,
  }),
};

/**
 * Submenu slot demo — click "Theme" to see the responsive sub-menu.
 * On desktop: floating dropdown panel to the right.
 * On mobile: inline accordion with chevron rotation.
 */
export const SubmenuSlot: Story = {
  render: () => ({
    components: { SettingsMenuItem, VcDropdownItem },
    setup() {
      const selectedTheme = ref("light");
      const themes = [
        { key: "light", name: "Light" },
        { key: "green", name: "Green" },
        { key: "dark", name: "Dark" },
      ];
      const currentThemeName = () => themes.find((t) => t.key === selectedTheme.value)?.name ?? "";
      return { selectedTheme, themes, currentThemeName };
    },
    template: `
      <div style="padding: 4px 0;">
        <SettingsMenuItem
          icon="lucide-palette"
          title="Theme"
          :value="currentThemeName()"
        >
          <template #submenu>
            <VcDropdownItem
              v-for="theme in themes"
              :key="theme.key"
              :title="theme.name"
              :active="theme.key === selectedTheme"
              @click="selectedTheme = theme.key"
            />
          </template>
        </SettingsMenuItem>
        <SettingsMenuItem
          icon="lucide-languages"
          title="Language"
          value="English"
        >
          <template #submenu>
            <VcDropdownItem title="English" :active="true" />
            <VcDropdownItem title="Deutsch" />
            <VcDropdownItem title="Francais" />
          </template>
        </SettingsMenuItem>
        <div style="margin: 4px 12px; border-top: 1px solid var(--neutrals-200);"></div>
        <SettingsMenuItem
          icon="lucide-key"
          title="Change password"
        />
        <SettingsMenuItem
          icon="lucide-log-out"
          title="Log out"
        />
      </div>
    `,
  }),
};

/**
 * Legacy pattern: cascading sub-menu with manual VcDropdownPanel.
 * Prefer the `submenu` slot instead (see SubmenuSlot story).
 * @deprecated Use the submenu slot pattern instead
 */
export const CascadingSubMenu: Story = {
  render: () => ({
    components: { SettingsMenuItem, VcDropdownItem },
    setup() {
      const isSubMenuOpen = ref(false);
      const menuItemRef = ref<InstanceType<typeof SettingsMenuItem> | null>(null);
      const selectedTheme = ref("light");
      const themes = [
        { key: "light", name: "Light" },
        { key: "green", name: "Green" },
        { key: "dark", name: "Dark" },
      ];
      const currentThemeName = () => themes.find((t) => t.key === selectedTheme.value)?.name ?? "";
      return { isSubMenuOpen, menuItemRef, selectedTheme, themes, currentThemeName };
    },
    template: `
      <div style="padding: 4px 0;">
        <SettingsMenuItem
          icon="lucide-palette"
          title="Theme (legacy pattern)"
          :value="currentThemeName()"
          :show-chevron="true"
          :is-active="isSubMenuOpen"
          @trigger:click="isSubMenuOpen = !isSubMenuOpen"
        />
        <SettingsMenuItem
          icon="lucide-key"
          title="Change password"
        />
        <SettingsMenuItem
          icon="lucide-log-out"
          title="Log out"
        />
      </div>
    `,
  }),
};
