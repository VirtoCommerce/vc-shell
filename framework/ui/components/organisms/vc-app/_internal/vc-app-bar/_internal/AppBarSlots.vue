<template>
  <!-- Desktop version -->
  <template v-if="isDesktop && !isMenuOpen">
    <AppBarContent :expanded="isExpanded">
      <template #navmenu>
        <component
          :is="slots.navmenu"
          v-if="slots.navmenu"
        />
      </template>
      <template #user-dropdown>
        <component
          :is="slots.userDropdown"
          v-if="slots.userDropdown"
        />
      </template>
    </AppBarContent>
  </template>

  <!-- Menu sidebar (both desktop and mobile) -->
  <MenuSidebar
    v-if="isMenuOpen"
    :is-opened="isMenuOpen"
    :expanded="isExpanded"
    @update:is-opened="closeMenu"
  >
    <template #navmenu>
      <component
        :is="slots.navmenu"
        v-if="slots.navmenu"
      />
    </template>
    <template #user-dropdown>
      <component
        :is="slots.userDropdown"
        v-if="slots.userDropdown"
      />
    </template>
    <template #app-switcher>
      <component
        :is="slots.appSwitcher"
        v-if="slots.appSwitcher"
      />
    </template>
    <template #widgets>
      <AppBarWidgetsMenu />
    </template>
    <template #widgets-active-content>
      <AppBarWidgetContent />
    </template>
  </MenuSidebar>
</template>

<script lang="ts" setup>
import { computed, inject, ref, h, defineComponent } from "vue";
import { useAppMenuState } from "../../composables/useAppMenuState";
import { useAppSlots } from "../../../composables/useAppSlots";
import { useAppBarWidgets } from "../composables/useAppBarWidgets";
import AppBarContent from "./AppBarContent.vue";
import MenuSidebar from "./MenuSidebar.vue";
import AppBarWidgetsMenu from "./AppBarWidgetsMenu.vue";

// Create AppBarWidgetContent component inline

const AppBarWidgetContent = defineComponent({
  setup() {
    const { currentWidget, hideAllWidgets, isAnyWidgetVisible } = useAppBarWidgets();
    const isMobile = inject("isMobile", ref(false));

    return () => {
      if (!isAnyWidgetVisible.value || !currentWidget.value?.component) return null;

      return h(
        "div",
        {
          class: [
            "app-bar-widget-content",
            {
              "app-bar-widget-content--mobile": isMobile.value,
            },
          ],
        },
        [
          h(currentWidget.value.component, {
            ...currentWidget.value.props,
            onClose: hideAllWidgets,
          }),
        ],
      );
    };
  },
});

const { state, closeAll } = useAppMenuState();
const slots = useAppSlots();

const isDesktop = inject("isDesktop", ref(true));

const isExpanded = computed(() => state.value.isSidebarExpanded);
const isMenuOpen = computed(() => state.value.isMenuOpen);

const closeMenu = () => {
  closeAll();
};
</script>

<style lang="scss">
.app-bar-slots {
  @apply tw-h-full;
}

.app-bar-widget-content {
  @apply tw-overflow-auto tw-max-h-[250px];
  &--mobile {
    // Mobile specific styles if needed
  }
}
</style>
