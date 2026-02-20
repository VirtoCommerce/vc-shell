import type { Meta, StoryFn } from "@storybook/vue3-vite";
import { computed, onUnmounted, provide, ref } from "vue";
import { useRoute } from "vue-router";
import VcApp from "@ui/components/organisms/vc-app/vc-app.vue";
import { useMenuService } from "@core/composables";
import type { AppDescriptor } from "@core/api/platform";
import type { MenuItem } from "@core/types";
import { AppRootElementKey, BladeRoutesKey } from "@framework/injection-keys";
import { VcPopupContainer } from "@shared/components";
import {
  VcAppDesktopLayout,
  VcAppMobileLayout,
  provideAppBarState,
  useShellBootstrap,
} from "@ui/components/organisms/vc-app/composition";
import { provideSidebarState } from "@core/composables/useSidebarState";
import { withMobileView } from "../../../../../.storybook/decorators";

/**
 * Build the same localStorage key that useMenuExpanded uses,
 * so we can force the expanded/collapsed state before component setup.
 */
function getMenuExpandedStorageKey(): string {
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const appName = pathSegments[0] || "default";
  return `VC_APP_MENU_EXPANDED_${appName}`;
}

const MOCK_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 30'%3E%3Ctext x='5' y='22' font-family='Arial' font-size='18' font-weight='bold' fill='%23319ED5'%3EVirtoShell%3C/text%3E%3C/svg%3E";

const mockMenuItems: Partial<MenuItem>[] = [
  {
    title: "Dashboard",
    icon: "lucide-layout-dashboard",
    url: "/dashboard",
    priority: 10,
  },
  {
    title: "Products",
    icon: "lucide-package",
    url: "/products",
    priority: 20,
  },
  {
    title: "Orders",
    icon: "lucide-shopping-cart",
    url: "/orders",
    priority: 30,
  },
  {
    title: "Customers",
    icon: "lucide-users",
    url: "/customers",
    priority: 40,
  },
  {
    title: "Marketing",
    icon: "lucide-megaphone",
    priority: 50,
    groupIcon: "lucide-megaphone",
    groupId: "marketing",
    children: [
      {
        title: "Campaigns",
        icon: "lucide-rocket",
        url: "/campaigns",
        priority: 10,
      },
      {
        title: "Discounts",
        icon: "lucide-percent",
        url: "/discounts",
        priority: 20,
      },
    ],
  },
  {
    title: "Settings",
    icon: "lucide-settings",
    url: "/settings",
    priority: 100,
  },
];

/** Common setup for all VcApp stories */
function useStorySetup() {
  const { addMenuItem } = useMenuService();
  mockMenuItems.forEach((item) => addMenuItem(item as MenuItem));
  provide(BladeRoutesKey, []);
  return { logo: MOCK_LOGO };
}

const meta: Meta = {
  title: "organisms/VcApp",
  component: VcApp,
  decorators: [
    // Save/restore localStorage to prevent stories from leaking state
    (story) => {
      const key = getMenuExpandedStorageKey();
      const saved = localStorage.getItem(key);
      return {
        components: { story },
        setup() {
          onUnmounted(() => {
            if (saved !== null) {
              localStorage.setItem(key, saved);
            } else {
              localStorage.removeItem(key);
            }
          });
          return {};
        },
        template: "<story />",
      };
    },
  ],
};

export default meta;

/**
 * The main VcApp component with expanded sidebar.
 * Shows the full shell with sidebar, workspace area, and all framework services.
 */
export const DesktopExpanded: StoryFn = () => {
  // Force expanded state before VcApp setup reads localStorage
  localStorage.setItem(getMenuExpandedStorageKey(), "true");

  return {
    components: { VcApp },
    setup: () => useStorySetup(),
    template: `
      <div style="height: 600px;">
        <VcApp
          :is-ready="true"
          :logo="logo"
          name="John Doe"
          role="Administrator"
          title="VirtoShell"
          version="3.0.0"
        />
      </div>
    `,
  };
};

DesktopExpanded.parameters = {
  layout: "fullscreen",
};

/**
 * VcApp with collapsed (unpinned) sidebar.
 * Hover over the sidebar to see the expand animation.
 */
export const DesktopCollapsed: StoryFn = () => {
  // Force collapsed state before VcApp setup reads localStorage
  localStorage.setItem(getMenuExpandedStorageKey(), "false");

  return {
    components: { VcApp },
    setup: () => useStorySetup(),
    template: `
      <div style="height: 600px;">
        <VcApp
          :is-ready="true"
          :logo="logo"
          name="John Doe"
          role="Administrator"
          title="VirtoShell"
          version="3.0.0"
        />
      </div>
    `,
  };
};

DesktopCollapsed.parameters = {
  layout: "fullscreen",
};

/**
 * VcApp in mobile viewport.
 * Shows top bar layout — click the logo to open the slide-out menu.
 * The mobile layout activates automatically when the viewport is narrow
 * (via VueUse useBreakpoints).
 */
export const Mobile: StoryFn = () => {
  localStorage.setItem(getMenuExpandedStorageKey(), "true");

  return {
    components: { VcApp },
    setup: () => useStorySetup(),
    template: `
      <div style="height: 600px;">
        <VcApp
          :is-ready="true"
          :logo="logo"
          name="John Doe"
          role="Administrator"
          title="VirtoShell"
          version="3.0.0"
        />
      </div>
    `,
  };
};

Mobile.decorators = [withMobileView];
Mobile.parameters = {
  layout: "fullscreen",
  viewport: {
    defaultViewport: "mobile1",
  },
};

/**
 * Composition API scenario:
 * Assemble shell from building blocks instead of using <VcApp /> directly.
 */
export const CustomShellFromParts: StoryFn = () => {
  localStorage.setItem(getMenuExpandedStorageKey(), "true");

  return {
    components: {
      VcAppDesktopLayout,
      VcAppMobileLayout,
      VcPopupContainer,
    },
    setup() {
      const route = useRoute();
      const isEmbedded = route.query.EmbeddedMode === "true";
      const isAuthenticated = ref(true);
      const isAppReady = ref(true);
      const appsList = ref<AppDescriptor[]>([
        { id: "admin", title: "Admin", relativeUrl: "/" },
        { id: "catalog", title: "Catalog", relativeUrl: "/catalog" },
      ]);
      const activeSection = ref("Dashboard");
      const activeApp = ref(appsList.value[0]?.title ?? "Admin");

      // Required providers for custom shell assembly.
      provide(BladeRoutesKey, []);
      const appRootRef = ref<HTMLElement>();
      provide(AppRootElementKey, appRootRef);
      const sidebar = provideSidebarState();
      provideAppBarState();
      const isSidebarPinned = computed(() => sidebar.isPinned.value);
      const isShellMenuOpened = computed(() => sidebar.isMenuOpen.value);

      useShellBootstrap({
        isEmbedded,
        internalRoutes: [],
        dynamicModules: undefined,
      });

      const { addMenuItem } = useMenuService();
      mockMenuItems.forEach((item) => addMenuItem(item as MenuItem));

      const switchApp = (app: AppDescriptor) => {
        activeApp.value = app.title;
      };

      const openRoot = () => {
        activeSection.value = "Dashboard";
      };

      const handleMenuItemClick = (item: MenuItem) => {
        activeSection.value = item.title;
      };

      const toggleShellMenu = () => {
        if (sidebar.isMenuOpen.value) {
          sidebar.closeMenu();
          return;
        }
        sidebar.openMenu();
      };

      return {
        appRootRef,
        isAppReady,
        isAuthenticated,
        sidebar,
        isSidebarPinned,
        isShellMenuOpened,
        appsList,
        activeSection,
        activeApp,
        toggleShellMenu,
        switchApp,
        handleMenuItemClick,
        openRoot,
        logo: MOCK_LOGO,
      };
    },
    template: `
      <div style="height: 600px;">
        <div v-if="!isAppReady" class="tw-h-full tw-flex tw-items-center tw-justify-center">
          Loading shell...
        </div>
        <div
          v-else
          ref="appRootRef"
          class="vc-app"
        >
          <div class="vc-app__main-content">
            <VcAppDesktopLayout
              v-if="$isDesktop.value"
              :logo="logo"
              avatar="https://placehold.co/40x40"
              user-name="John Doe"
              user-role="Administrator"
              title="VirtoShell"
              :apps-list="appsList"
              @logo:click="openRoot"
              @item:click="handleMenuItemClick"
              @switch-app="switchApp"
            >
              <template #app-switcher="{ appsList: customAppsList, switchApp: onSwitchApp }">
                <div class="tw-px-4 tw-py-3 tw-space-y-2 tw-text-xs tw-text-neutrals-700">
                  <p class="tw-font-semibold tw-uppercase tw-tracking-wide">Custom app switcher slot</p>
                  <button
                    v-for="app in customAppsList"
                    :key="app.id"
                    type="button"
                    class="tw-w-full tw-text-left tw-px-3 tw-py-2 tw-rounded tw-bg-neutrals-100 hover:tw-bg-neutrals-200"
                    @click="onSwitchApp(app)"
                  >
                    {{ app.title }}
                  </button>
                </div>
              </template>
            </VcAppDesktopLayout>

            <VcAppMobileLayout
              v-else
              :logo="logo"
              avatar="https://placehold.co/40x40"
              user-name="John Doe"
              user-role="Administrator"
              title="VirtoShell"
              :apps-list="appsList"
              @item:click="handleMenuItemClick"
              @switch-app="switchApp"
            >
              <template #app-switcher="{ appsList: customAppsList, switchApp: onSwitchApp }">
                <div class="tw-px-4 tw-py-3 tw-space-y-2 tw-text-xs tw-text-neutrals-700">
                  <p class="tw-font-semibold tw-uppercase tw-tracking-wide">Custom app switcher slot</p>
                  <button
                    v-for="app in customAppsList"
                    :key="app.id"
                    type="button"
                    class="tw-w-full tw-text-left tw-px-3 tw-py-2 tw-rounded tw-bg-neutrals-100 hover:tw-bg-neutrals-200"
                    @click="onSwitchApp(app)"
                  >
                    {{ app.title }}
                  </button>
                </div>
              </template>
            </VcAppMobileLayout>

            <div v-if="isAuthenticated" class="vc-app__workspace">
              <div class="tw-w-full tw-overflow-auto tw-p-6 tw-space-y-4 tw-text-neutrals-800">
                <div class="tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-4">
                  <div class="tw-space-y-1">
                    <p class="tw-text-xs tw-uppercase tw-tracking-wide tw-text-neutrals-600">
                      Custom shell composition
                    </p>
                    <h2 class="tw-text-2xl tw-font-semibold">{{ activeSection }}</h2>
                    <p class="tw-text-sm tw-text-neutrals-700">
                      Current app: <span class="tw-font-medium">{{ activeApp }}</span>
                    </p>
                  </div>
                  <div class="tw-flex tw-flex-wrap tw-gap-2">
                    <button
                      type="button"
                      class="tw-px-3 tw-py-2 tw-rounded tw-border tw-border-neutrals-300 tw-bg-white hover:tw-bg-neutrals-100"
                      @click="sidebar.togglePin"
                    >
                      {{ isSidebarPinned ? "Unpin sidebar" : "Pin sidebar" }}
                    </button>
                    <button
                      type="button"
                      class="tw-px-3 tw-py-2 tw-rounded tw-bg-primary-500 tw-text-white hover:tw-bg-primary-600"
                      @click="toggleShellMenu"
                    >
                      {{ isShellMenuOpened ? "Close shell menu" : "Open shell menu" }}
                    </button>
                  </div>
                </div>

                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
                  <div class="tw-rounded-lg tw-bg-white tw-border tw-border-neutrals-200 tw-p-4">
                    <p class="tw-text-xs tw-text-neutrals-500">Active menu group</p>
                    <p class="tw-text-lg tw-font-semibold">{{ activeSection }}</p>
                  </div>
                  <div class="tw-rounded-lg tw-bg-white tw-border tw-border-neutrals-200 tw-p-4">
                    <p class="tw-text-xs tw-text-neutrals-500">Sidebar mode</p>
                    <p class="tw-text-lg tw-font-semibold">{{ isSidebarPinned ? "Pinned" : "Collapsible" }}</p>
                  </div>
                  <div class="tw-rounded-lg tw-bg-white tw-border tw-border-neutrals-200 tw-p-4">
                    <p class="tw-text-xs tw-text-neutrals-500">Shell menu</p>
                    <p class="tw-text-lg tw-font-semibold">{{ isShellMenuOpened ? "Opened" : "Closed" }}</p>
                  </div>
                </div>

                <p class="tw-text-sm tw-text-neutrals-700">
                  This workspace is rendered from composition parts and wires required shell providers, emits and slots.
                </p>
              </div>
            </div>

            <VcPopupContainer />
          </div>
        </div>
      </div>
    `,
  };
};

CustomShellFromParts.parameters = {
  layout: "fullscreen",
};

/**
 * Slot customization: accordion-style navigation matching the Figma design.
 * Three nesting levels: section groups → menu items → sub-items.
 * Also customizes sidebar-header and sidebar-footer slots.
 */
export const CustomMenuSlot: StoryFn = () => {
  localStorage.setItem(getMenuExpandedStorageKey(), "true");

  interface CustomMenuItem {
    id: string;
    label: string;
    icon: string;
    children?: CustomMenuItem[];
  }

  interface MenuSection {
    id: string;
    title: string;
    items: CustomMenuItem[];
  }

  return {
    components: { VcApp },
    setup() {
      const { logo } = useStorySetup();

      const menuSections: MenuSection[] = [
        {
          id: "activity",
          title: "Activity",
          items: [
            { id: "new-orders-act", label: "New Orders", icon: "lucide-file-text" },
            { id: "pending-reviews", label: "Pending Reviews", icon: "lucide-message-square" },
            { id: "low-stock", label: "Low Stock Alerts", icon: "lucide-alert-triangle" },
            { id: "returns", label: "Returns & Refunds", icon: "lucide-rotate-ccw" },
          ],
        },
        {
          id: "recent",
          title: "Recent",
          items: [
            { id: "recent-orders", label: "New Orders", icon: "lucide-file-text" },
            { id: "recent-returns", label: "Returns & Refunds", icon: "lucide-rotate-ccw" },
          ],
        },
        {
          id: "dashboard",
          title: "Dashboard",
          items: [
            { id: "whats-new", label: "What's new", icon: "lucide-sparkles" },
            { id: "kpi", label: "Key Performance Indicators", icon: "lucide-bar-chart-3" },
          ],
        },
        {
          id: "marketing",
          title: "Marketing",
          items: [
            { id: "promotions", label: "Promotions", icon: "lucide-megaphone" },
            { id: "dynamic-content", label: "Dynamic content", icon: "lucide-layout-grid" },
          ],
        },
        {
          id: "orders-customers",
          title: "Orders & Customers",
          items: [
            { id: "all-orders", label: "All orders", icon: "lucide-list" },
            {
              id: "new-orders",
              label: "New orders",
              icon: "lucide-file-plus",
              children: [
                { id: "accepted", label: "Accepted", icon: "lucide-check-circle" },
                { id: "declined", label: "Declined", icon: "lucide-x-circle" },
              ],
            },
            { id: "not-paid", label: "Not Paid Orders", icon: "lucide-credit-card" },
            { id: "awaiting", label: "Awaiting Fulfillment", icon: "lucide-truck" },
            { id: "customers", label: "Customers", icon: "lucide-users" },
          ],
        },
      ];

      const expandedSections = ref<Record<string, boolean>>({
        activity: true,
        recent: true,
        dashboard: true,
        marketing: true,
        "orders-customers": true,
      });

      const expandedItems = ref<Record<string, boolean>>({
        "new-orders": true,
      });

      const activeItemId = ref("new-orders");

      const toggleSection = (sectionId: string) => {
        expandedSections.value[sectionId] = !expandedSections.value[sectionId];
      };

      const toggleItem = (itemId: string) => {
        expandedItems.value[itemId] = !expandedItems.value[itemId];
      };

      const selectItem = (item: CustomMenuItem) => {
        activeItemId.value = item.id;
        if (item.children?.length) {
          toggleItem(item.id);
        }
      };

      // Inject scoped styles via JS (template strings don't support <style>)
      const styleId = "custom-menu-slot-styles";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = [
          ".cnav { display: flex; flex-direction: column; }",
          ".cnav__sep { height: 1px; margin: 6px 12px; background: var(--neutrals-200); }",
          ".cnav__hdr { display: flex; align-items: center; justify-content: space-between; padding: 10px 18px 4px; cursor: pointer; user-select: none; width: 100%; background: none; border: none; font: inherit; color: inherit; }",
          ".cnav__hdr-txt { font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: var(--neutrals-400); }",
          ".cnav__chv { color: var(--neutrals-400); transition: transform 0.2s; flex-shrink: 0; }",
          ".cnav__chv--down { transform: rotate(180deg); }",
          ".cnav__grp { display: flex; flex-direction: column; gap: 1px; }",
          ".cnav__row { display: flex; align-items: center; gap: 10px; padding: 7px 14px 7px 26px; margin: 0 6px; border-radius: 6px; cursor: pointer; transition: background 0.15s; color: var(--neutrals-700); font-size: 13px; font-weight: 400; line-height: 1.4; width: calc(100% - 12px); background: none; border: none; font-family: inherit; }",
          ".cnav__row:hover { background: var(--neutrals-100); }",
          ".cnav__row--active { background: var(--secondary-100); }",
          ".cnav__row--active:hover { background: var(--secondary-100); }",
          ".cnav__row--icon-only { justify-content: center; padding: 8px 0; margin: 0 auto; width: 44px; }",
          ".cnav__sub { display: flex; align-items: center; gap: 10px; padding: 6px 14px 6px 44px; margin: 0 6px; border-radius: 6px; cursor: pointer; transition: background 0.15s; color: var(--neutrals-600); font-size: 13px; font-weight: 400; line-height: 1.4; width: calc(100% - 12px); background: none; border: none; font-family: inherit; }",
          ".cnav__sub:hover { background: var(--neutrals-100); }",
          ".cnav__sub--active { background: var(--secondary-100); color: var(--neutrals-700); }",
          ".cnav__lbl { flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
          ".cnav__ico { flex-shrink: 0; }",
          ".cftr { display: flex; flex-direction: column; padding: 0 18px; }",
          ".cftr__user { display: flex; align-items: center; gap: 10px; padding: 8px 0; }",
          ".cftr__avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--neutrals-200); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }",
          ".cftr__avatar img { width: 100%; height: 100%; object-fit: cover; }",
          ".cftr__info { flex: 1; min-width: 0; }",
          ".cftr__name { font-size: 13px; font-weight: 500; color: var(--neutrals-700); line-height: 1.3; }",
          ".cftr__role { font-size: 12px; font-weight: 400; color: var(--neutrals-400); line-height: 1.3; }",
          ".cftr__actions { display: flex; align-items: center; gap: 8px; }",
          ".cftr__action { color: var(--neutrals-500); cursor: pointer; transition: color 0.15s; background: none; border: none; padding: 0; font: inherit; }",
          ".cftr__action:hover { color: var(--neutrals-700); }",
          ".cftr__ver { font-size: 11px; color: var(--neutrals-400); padding: 4px 0 8px; }",
          ".chdr { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; height: 70px; box-sizing: border-box; }",
          ".chdr__logo { height: 28px; }",
          ".chdr__btns { display: flex; align-items: center; gap: 12px; }",
          ".chdr__btn { color: var(--neutrals-500); cursor: pointer; transition: color 0.15s; background: none; border: none; padding: 0; font: inherit; }",
          ".chdr__btn:hover { color: var(--neutrals-700); }",
        ].join("\n");
        document.head.appendChild(style);
      }

      return {
        logo,
        menuSections,
        expandedSections,
        expandedItems,
        activeItemId,
        toggleSection,
        toggleItem,
        selectItem,
      };
    },
    template: `
      <div style="height: 700px;">
        <VcApp
          :is-ready="true"
          :logo="logo"
          name="Evan"
          role="Admin"
          title="VirtoCommerce"
          version="3.897.0"
        >
          <!-- Custom header: logo + notification & search icons -->
          <template #sidebar-header="{ logo: headerLogo, expanded }">
            <div class="chdr" v-if="expanded">
              <img :src="headerLogo" alt="Logo" class="chdr__logo" />
              <div class="chdr__btns">
                <button type="button" class="chdr__btn"><VcIcon icon="lucide-bell" size="s" /></button>
                <button type="button" class="chdr__btn"><VcIcon icon="lucide-search" size="s" /></button>
              </div>
            </div>
          </template>

          <!-- Custom menu: accordion with 3-level nesting -->
          <template #menu="{ expanded }">
            <div class="cnav">
              <template v-for="(section, sIdx) in menuSections" :key="section.id">
                <div v-if="sIdx > 0" class="cnav__sep" />

                <button v-if="expanded" type="button" class="cnav__hdr" @click="toggleSection(section.id)">
                  <span class="cnav__hdr-txt">{{ section.title }}</span>
                  <VcIcon
                    icon="lucide-chevron-up"
                    size="xs"
                    class="cnav__chv"
                    :class="{ 'cnav__chv--down': !expandedSections[section.id] }"
                  />
                </button>

                <div v-if="expandedSections[section.id]" class="cnav__grp">
                  <template v-for="item in section.items" :key="item.id">
                    <button
                      type="button"
                      class="cnav__row"
                      :class="{
                        'cnav__row--active': activeItemId === item.id,
                        'cnav__row--icon-only': !expanded,
                      }"
                      @click="selectItem(item)"
                    >
                      <VcIcon :icon="item.icon" size="s" class="cnav__ico" />
                      <span v-if="expanded" class="cnav__lbl">{{ item.label }}</span>
                      <VcIcon
                        v-if="expanded && item.children?.length"
                        icon="lucide-chevron-up"
                        size="xs"
                        class="cnav__chv"
                        :class="{ 'cnav__chv--down': !expandedItems[item.id] }"
                      />
                    </button>

                    <template v-if="expanded && item.children?.length && expandedItems[item.id]">
                      <button
                        v-for="child in item.children"
                        :key="child.id"
                        type="button"
                        class="cnav__sub"
                        :class="{ 'cnav__sub--active': activeItemId === child.id }"
                        @click="activeItemId = child.id"
                      >
                        <VcIcon :icon="child.icon" size="s" class="cnav__ico" />
                        <span class="cnav__lbl">{{ child.label }}</span>
                      </button>
                    </template>
                  </template>
                </div>
              </template>
            </div>
          </template>

          <!-- Custom footer: avatar, name, role, help/settings, version -->
          <template #sidebar-footer="{ name, role }">
            <div class="cftr">
              <div class="cftr__user">
                <div class="cftr__avatar">
                  <img src="https://i.pravatar.cc/76?u=evan" alt="Avatar" />
                </div>
                <div class="cftr__info">
                  <div class="cftr__name">{{ name || 'Evan' }}</div>
                  <div class="cftr__role">{{ role || 'Admin' }}</div>
                </div>
                <div class="cftr__actions">
                  <button type="button" class="cftr__action"><VcIcon icon="lucide-help-circle" size="s" /></button>
                  <button type="button" class="cftr__action"><VcIcon icon="lucide-settings" size="s" /></button>
                </div>
              </div>
              <div class="cftr__ver">Ver. 3.897.0</div>
            </div>
          </template>
        </VcApp>
      </div>
    `,
  };
};

CustomMenuSlot.parameters = {
  layout: "fullscreen",
};
