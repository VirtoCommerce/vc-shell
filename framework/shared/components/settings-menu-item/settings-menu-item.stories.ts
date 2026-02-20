import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SettingsMenuItem from "@shared/components/settings-menu-item/settings-menu-item.vue";
import { VcDropdownPanel, VcIcon } from "@ui/components";

const meta = {
  title: "Shared/SettingsMenuItem",
  component: SettingsMenuItem,
  decorators: [
    () => ({
      template: `
        <div style="width: 280px; background: var(--additional-50); border: 1px solid var(--neutrals-200); border-radius: 6px; overflow: hidden;">
          <story />
        </div>
      `,
    }),
  ],
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
    icon: "material-palette",
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
    icon: "material-palette",
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
          icon="material-palette"
          title="Theme selector"
          value="Light"
          :show-chevron="true"
        />
        <SettingsMenuItem
          icon="material-language"
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
 * Cascading sub-menu demo — click Theme to see the floating sub-panel
 */
export const CascadingSubMenu: Story = {
  render: () => ({
    components: { SettingsMenuItem, VcDropdownPanel, VcIcon },
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
          ref="menuItemRef"
          icon="material-palette"
          title="Theme selector"
          :value="currentThemeName()"
          :show-chevron="true"
          :is-active="isSubMenuOpen"
          @trigger:click="isSubMenuOpen = !isSubMenuOpen"
        />
        <SettingsMenuItem
          icon="material-language"
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

        <VcDropdownPanel
          v-model:show="isSubMenuOpen"
          :anchor-ref="menuItemRef?.triggerRef ?? null"
          placement="right-start"
          width="180px"
          max-width="260px"
        >
          <div style="padding: 4px;">
            <button
              v-for="theme in themes"
              :key="theme.key"
              type="button"
              style="
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 6px 8px;
                border-radius: 6px;
                font-size: 14px;
                text-align: left;
                background: transparent;
                border: none;
                cursor: pointer;
                transition: background-color 0.15s;
              "
              :style="{ fontWeight: theme.key === selectedTheme ? '500' : '400' }"
              @click="selectedTheme = theme.key; isSubMenuOpen = false"
              @mouseenter="$event.target.style.backgroundColor = 'var(--neutrals-100)'"
              @mouseleave="$event.target.style.backgroundColor = 'transparent'"
            >
              <VcIcon
                v-if="theme.key === selectedTheme"
                icon="fas fa-check"
                size="xs"
                style="color: var(--additional-950); width: 14px; flex-shrink: 0; font-size: 10px;"
              />
              <span v-else style="width: 14px; flex-shrink: 0;" />
              <span>{{ theme.name }}</span>
            </button>
          </div>
        </VcDropdownPanel>
      </div>
    `,
  }),
};
