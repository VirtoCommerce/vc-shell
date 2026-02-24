<template>
  <div
    class="app-hub-content"
    :class="{ 'app-hub-content--mobile': mobile }"
  >
    <div class="app-hub-content__search">
      <VcInput
        v-model="searchQuery"
        clearable
        size="small"
        :placeholder="$t('COMPONENTS.ORGANISMS.VC_APP.INTERNAL.APP_HUB.SEARCH_PLACEHOLDER')"
      >
        <template #prepend-inner>
          <VcIcon
            icon="lucide-search"
            size="s"
          />
        </template>
      </VcInput>
    </div>

    <div
      class="app-hub-content__sections"
      :class="{ 'app-hub-content__sections--single': !showApplications, 'app-hub-content__sections--mobile': mobile }"
    >
      <section
        v-if="showApplications"
        class="app-hub-content__section app-hub-content__section--apps"
      >
        <header class="app-hub-content__section-header">
          <span class="app-hub-content__section-title">
            {{ $t("COMPONENTS.ORGANISMS.VC_APP.INTERNAL.APP_HUB.APPLICATIONS") }}
          </span>
        </header>

        <VcScrollableContainer
          ref="appsScrollContainerRef"
          class="app-hub-content__scroll"
        >
          <slot
            name="applications"
            :apps-list="filteredApps"
            :switch-app="handleSwitchApp"
          >
            <div
              v-if="filteredApps.length"
              class="app-hub-content__apps-list app-hub-content__apps-list--tiles"
            >
              <button
                v-for="app in visibleApps"
                :key="app.id || app.title"
                type="button"
                :data-test-id="getAppTestId(app)"
                class="app-hub-content__item app-hub-content__item--app app-hub-content__item--app-tile"
                :class="{ 'app-hub-content__item--active': isAppActive(app) }"
                @click="handleSwitchApp(app)"
              >
                <img
                  v-if="app.iconUrl"
                  :src="app.iconUrl"
                  :alt="app.title || app.id || 'app icon'"
                  class="app-hub-content__item-icon app-hub-content__item-icon--tile"
                />
                <VcIcon
                  v-else
                  icon="lucide-grid-2x2"
                  size="m"
                  class="app-hub-content__item-icon app-hub-content__item-icon--fallback app-hub-content__item-icon--tile"
                />

                <div class="app-hub-content__item-content app-hub-content__item-content--center">
                  <div
                    class="app-hub-content__item-title app-hub-content__item-title--app app-hub-content__item-title--center"
                  >
                    {{ app.title || app.id }}
                  </div>
                </div>
              </button>
            </div>
            <div
              v-else
              class="app-hub-content__empty"
            >
              {{ $t("COMPONENTS.ORGANISMS.VC_APP.INTERNAL.APP_HUB.NO_APPLICATIONS") }}
            </div>
          </slot>
        </VcScrollableContainer>
      </section>

      <section class="app-hub-content__section app-hub-content__section--widgets">
        <div class="app-hub-content__widgets-inner">
          <!-- Active widget content (inline) -->
          <template v-if="!mobile && isAnyWidgetVisible && currentWidget?.component">
            <header class="app-hub-content__section-header app-hub-content__section-header--back">
              <button
                class="app-hub-content__back-button"
                @click="hideAllWidgets"
              >
                <VcIcon
                  icon="lucide-arrow-left"
                  size="xs"
                />
                <span class="app-hub-content__back-title">{{ getWidgetTitle(currentWidget) }}</span>
              </button>
            </header>
            <VcScrollableContainer class="app-hub-content__widget-inline-body">
              <AppBarWidgetContent />
            </VcScrollableContainer>
          </template>

          <!-- Widget list (default) -->
          <template v-else>
            <header class="app-hub-content__section-header">
              <span class="app-hub-content__section-title">
                {{ $t("COMPONENTS.ORGANISMS.VC_APP.INTERNAL.APP_HUB.WIDGETS") }}
              </span>
            </header>

            <VcScrollableContainer
              ref="widgetsScrollContainerRef"
              class="app-hub-content__scroll"
            >
              <div
                v-if="filteredWidgets.length"
                class="app-hub-content__list"
              >
                <button
                  v-for="widget in visibleWidgets"
                  :key="widget.id"
                  type="button"
                  :data-widget-id="widget.id"
                  class="app-hub-content__item app-hub-content__item--widget"
                  :class="{ 'app-hub-content__item--active': isWidgetActive(widget.id) }"
                  @click="handleWidgetClick(widget)"
                >
                  <div class="app-hub-content__widget-icon-wrap">
                    <VcIcon
                      :icon="widget.icon || 'lucide-layout-grid'"
                      size="s"
                      class="app-hub-content__item-icon app-hub-content__item-icon--fallback"
                    />
                    <span
                      v-if="isBadgeActive(widget)"
                      class="app-hub-content__widget-badge"
                    />
                  </div>

                  <div class="app-hub-content__item-content">
                    <div class="app-hub-content__item-title">
                      {{ getWidgetTitle(widget) }}
                    </div>
                  </div>
                </button>
              </div>

              <div
                v-else
                class="app-hub-content__empty"
              >
                {{ $t("COMPONENTS.ORGANISMS.VC_APP.INTERNAL.APP_HUB.NO_WIDGETS") }}
              </div>
            </VcScrollableContainer>
          </template>
        </div>
      </section>
    </div>

    <Transition name="app-hub-content-flyout">
      <div
        v-if="mobile && isAnyWidgetVisible && currentWidget?.component"
        class="app-hub-content__flyout app-hub-content__flyout--mobile"
      >
        <div class="app-hub-content__flyout-header">
          <span class="app-hub-content__flyout-title">{{ getWidgetTitle(currentWidget) }}</span>
          <VcButton
            icon="material-close"
            text
            @click="hideAllWidgets"
          />
        </div>
        <div class="app-hub-content__flyout-body">
          <AppBarWidgetContent mobile />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, useSlots, watch } from "vue";
import type { AppDescriptor } from "@core/api/platform";
import type { AppBarWidget } from "@core/services";
import { useAppBarWidget } from "@core/composables";
import { hasUnreadNotifications } from "@core/composables/useNotifications";
import { VcButton, VcIcon, VcInput, VcScrollableContainer } from "@ui/components";
import { useAppHub } from "@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppHub";
import { useAppBarWidgets } from "@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarWidgets";
import AppBarWidgetContent from "@ui/components/organisms/vc-app/_internal/app-bar/components/AppBarWidgetContent.vue";

interface Props {
  appsList: AppDescriptor[];
  showApplications?: boolean;
  mobile?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showApplications: true,
  mobile: false,
});

const emit = defineEmits<{
  (e: "switch-app", app: AppDescriptor): void;
}>();

defineSlots<{
  applications?: (props: { appsList: AppDescriptor[]; switchApp: (app: AppDescriptor) => void }) => unknown;
}>();

const slots = useSlots();
const hasCustomApplicationsSlot = computed(() => typeof slots.applications === "function");
const appsScrollContainerRef = ref<InstanceType<typeof VcScrollableContainer> | null>(null);
const widgetsScrollContainerRef = ref<InstanceType<typeof VcScrollableContainer> | null>(null);

const { items } = useAppBarWidget();
const { currentWidget, hideAllWidgets, isAnyWidgetVisible, toggleWidget, showWidget } = useAppBarWidgets();

const PROGRESSIVE_RENDER_THRESHOLD = 120;
const INITIAL_RENDER_BATCH_SIZE = 120;
const RENDER_BATCH_SIZE = 80;
const LOAD_MORE_TRIGGER_OFFSET = 120;

const { searchQuery, filteredApps, filteredWidgets, getWidgetTitle } = useAppHub({
  appsList: toRef(props, "appsList"),
  widgets: items,
  showApplications: toRef(props, "showApplications"),
  mobile: toRef(props, "mobile"),
});

const appsRenderLimit = ref(INITIAL_RENDER_BATCH_SIZE);
const widgetsRenderLimit = ref(INITIAL_RENDER_BATCH_SIZE);

const shouldProgressiveRenderApps = computed(() => {
  return !hasCustomApplicationsSlot.value && filteredApps.value.length > PROGRESSIVE_RENDER_THRESHOLD;
});

const shouldProgressiveRenderWidgets = computed(() => {
  return filteredWidgets.value.length > PROGRESSIVE_RENDER_THRESHOLD;
});

const visibleApps = computed(() => {
  if (!shouldProgressiveRenderApps.value) {
    return filteredApps.value;
  }

  return filteredApps.value.slice(0, appsRenderLimit.value);
});

const visibleWidgets = computed(() => {
  if (!shouldProgressiveRenderWidgets.value) {
    return filteredWidgets.value;
  }

  return filteredWidgets.value.slice(0, widgetsRenderLimit.value);
});

watch(
  () => items.value.map((item) => item.id),
  () => {
    if (isAnyWidgetVisible.value && !currentWidget.value) {
      hideAllWidgets();
    }
  },
);

watch(
  [() => filteredApps.value.length, shouldProgressiveRenderApps],
  ([length, progressive]) => {
    appsRenderLimit.value = progressive ? Math.min(length, INITIAL_RENDER_BATCH_SIZE) : length;
    nextTick(() => refreshScrollState(appsScrollContainerRef.value));
  },
  { immediate: true },
);

watch(
  [() => filteredWidgets.value.length, shouldProgressiveRenderWidgets],
  ([length, progressive]) => {
    widgetsRenderLimit.value = progressive ? Math.min(length, INITIAL_RENDER_BATCH_SIZE) : length;
    nextTick(() => refreshScrollState(widgetsScrollContainerRef.value));
  },
  { immediate: true },
);

watch(
  () => resolveScrollViewport(appsScrollContainerRef.value),
  (viewport, previousViewport) => {
    previousViewport?.removeEventListener("scroll", handleAppsScroll);
    viewport?.addEventListener("scroll", handleAppsScroll, { passive: true });
  },
  { immediate: true },
);

watch(
  () => resolveScrollViewport(widgetsScrollContainerRef.value),
  (viewport, previousViewport) => {
    previousViewport?.removeEventListener("scroll", handleWidgetsScroll);
    viewport?.addEventListener("scroll", handleWidgetsScroll, { passive: true });
  },
  { immediate: true },
);

onMounted(() => {
  if (!props.mobile && hasUnreadNotifications.value) {
    showWidget("notifications");
  }
});

onBeforeUnmount(() => {
  resolveScrollViewport(appsScrollContainerRef.value)?.removeEventListener("scroll", handleAppsScroll);
  resolveScrollViewport(widgetsScrollContainerRef.value)?.removeEventListener("scroll", handleWidgetsScroll);
});

function isAppActive(app: AppDescriptor): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const currentPath = normalizePath(window.location.pathname);
  const appPath = normalizePath(app.relativeUrl ?? "");

  if (!appPath) {
    return false;
  }

  if (appPath === "/") {
    return currentPath === "/";
  }

  return currentPath.startsWith(appPath);
}

function normalizePath(path: string): string {
  if (!path) {
    return "";
  }

  const normalized = path.replace(/\/+$/, "");
  return normalized || "/";
}

function handleSwitchApp(app: AppDescriptor): void {
  hideAllWidgets();
  emit("switch-app", app);
}

function getAppTestId(app: AppDescriptor): string {
  const rawValue = (app.id || app.title || "unknown").toString().trim().toLowerCase();
  const sanitized = rawValue.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `app-hub-app-${sanitized || "unknown"}`;
}

function handleAppsScroll(): void {
  if (!shouldProgressiveRenderApps.value) {
    return;
  }

  maybeExtendRenderLimit({
    container: appsScrollContainerRef.value,
    totalItems: filteredApps.value.length,
    renderLimit: appsRenderLimit,
  });
}

function handleWidgetsScroll(): void {
  if (!shouldProgressiveRenderWidgets.value) {
    return;
  }

  maybeExtendRenderLimit({
    container: widgetsScrollContainerRef.value,
    totalItems: filteredWidgets.value.length,
    renderLimit: widgetsRenderLimit,
  });
}

function handleWidgetClick(widget: AppBarWidget): void {
  if (widget.component) {
    toggleWidget(widget.id);
  }

  widget.onClick?.();
}

function maybeExtendRenderLimit(params: {
  container: InstanceType<typeof VcScrollableContainer> | null;
  totalItems: number;
  renderLimit: { value: number };
}): void {
  const viewport = resolveScrollViewport(params.container);
  if (!viewport || params.renderLimit.value >= params.totalItems) {
    return;
  }

  const remainingSpace = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

  if (remainingSpace > LOAD_MORE_TRIGGER_OFFSET) {
    return;
  }

  params.renderLimit.value = Math.min(params.renderLimit.value + RENDER_BATCH_SIZE, params.totalItems);
  nextTick(() => refreshScrollState(params.container));
}

function resolveScrollViewport(container: InstanceType<typeof VcScrollableContainer> | null): HTMLElement | null {
  if (!container) {
    return null;
  }

  const exposedContainer = container as unknown as {
    viewportRef?: {
      value: HTMLElement | null;
    };
  };

  return exposedContainer.viewportRef?.value ?? null;
}

function refreshScrollState(container: InstanceType<typeof VcScrollableContainer> | null): void {
  if (!container) {
    return;
  }

  const exposedContainer = container as unknown as {
    updateScrollState?: () => void;
  };

  exposedContainer.updateScrollState?.();
}

function isWidgetActive(id: string): boolean {
  return currentWidget.value?.id === id;
}

function isBadgeActive(widget: AppBarWidget): boolean {
  if (widget.badge === undefined) {
    return false;
  }

  if (typeof widget.badge === "function") {
    return widget.badge();
  }

  return !!widget.badge;
}
</script>

<style lang="scss">
:root {
  --app-hub-panel-width: 580px;
  --app-hub-search-padding: 12px;
  --app-hub-divider-color: var(--neutrals-200);
  --app-hub-item-bg-hover: var(--secondary-100);
  --app-hub-item-bg-active: var(--secondary-200);
  --app-hub-item-title: var(--neutrals-950);
  --app-hub-item-subtitle: var(--neutrals-500);
  --app-hub-item-icon: var(--neutrals-500);
  --app-hub-item-icon-active: var(--primary-500);
}

// The parent .vc-dropdown-panel__content is flex:1 + overflow:hidden but NOT
// a flex container, so percentage/flex heights inside it don't resolve.
// Make it a flex container so .app-hub-content can use flex:1 + min-height:0
// to receive the bounded height from floating-ui's maxHeight.
.vc-dropdown-panel__content:has(> .app-hub-content) {
  display: flex;
  flex-direction: column;
}

.app-hub-content {
  @apply tw-relative tw-flex tw-flex-col tw-overflow-hidden;
  width: var(--app-hub-panel-width);
  max-width: calc(100vw - 32px);
  // 0 1 auto = content-sized (panel shrinks to fit apps), but can shrink
  // below content when viewport is short (enables scroll via min-height:0).
  flex: 0 1 auto;
  min-height: 0;

  &--mobile {
    @apply tw-w-full tw-max-w-full tw-h-auto;
  }

  &__search {
    @apply tw-p-[var(--app-hub-search-padding)] tw-border-b tw-border-solid;
    border-color: var(--app-hub-divider-color);
  }

  &__sections {
    @apply tw-grid tw-gap-0 tw-min-h-0;
    flex: 0 1 auto;
    grid-template-columns: minmax(0, 1fr) 220px;

    &--single {
      grid-template-columns: minmax(0, 1fr);
    }

    &--mobile {
      @apply tw-flex tw-flex-col tw-min-h-0 tw-max-h-none;

      .app-hub-content__section--apps,
      .app-hub-content__section--widgets {
        min-height: 0;
      }

      .app-hub-content__section--widgets .app-hub-content__scroll {
        max-height: 220px;
      }

      .app-hub-content__section--apps .app-hub-content__scroll {
        max-height: 260px;
      }
    }
  }

  &__section {
    @apply tw-flex tw-flex-col tw-min-h-0 tw-overflow-hidden;

    &--apps {
      @apply tw-border-r tw-border-solid;
      border-color: var(--app-hub-divider-color);
    }

    &--widgets {
      @apply tw-bg-[var(--app-bar-background)] tw-relative;
    }
  }

  // Absolutely positioned inner wrapper — removes the widgets column
  // from the grid row's intrinsic height calculation so only the apps
  // column drives the panel height. Content scrolls within.
  &__widgets-inner {
    @apply tw-absolute tw-inset-0 tw-flex tw-flex-col tw-overflow-hidden;
  }

  &__section-header {
    @apply tw-flex tw-items-center tw-justify-between tw-gap-2 tw-px-3 tw-pt-3 tw-pb-2;

    &--back {
      @apply tw-px-2 tw-pt-2 tw-pb-1;
    }
  }

  &__section-title {
    @apply tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide;
    color: var(--app-hub-item-subtitle);
  }

  &__scroll {
    @apply tw-flex-1 tw-min-h-0;

    .vc-scrollable-container {
      @apply tw-h-full;
    }

    .vc-scrollable-container__viewport {
      @apply tw-px-2 tw-pb-2;
    }
  }

  &__view-mode {
    @apply tw-shrink-0;
  }

  &__apps-list {
    @apply tw-flex tw-flex-col tw-gap-0.5;

    &--tiles {
      @apply tw-grid tw-gap-1.5;
      grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
    }
  }

  &__list {
    @apply tw-flex tw-flex-col tw-gap-0.5;
  }

  &__item {
    @apply tw-w-full tw-flex tw-items-center tw-gap-1.5 tw-rounded-md tw-px-1.5 tw-py-1.5 tw-text-left tw-transition-colors tw-duration-150;

    &:hover {
      background: var(--app-hub-item-bg-hover);
    }

    &--active {
      background: var(--app-hub-item-bg-active);

      .app-hub-content__item-icon--fallback {
        color: var(--app-hub-item-icon-active);
      }
    }

    &--widget {
      @apply tw-py-1.5;
    }

    &--app-tile {
      @apply tw-flex-col tw-items-center tw-justify-start tw-gap-1.5 tw-px-1.5 tw-py-2;
      min-height: 82px;
    }
  }

  &__item-icon {
    @apply tw-w-4 tw-h-4 tw-shrink-0 tw-rounded;

    &--tile {
      @apply tw-w-7 tw-h-7;
    }

    &--fallback {
      color: var(--app-hub-item-icon);
    }
  }

  &__item-content {
    @apply tw-min-w-0 tw-flex tw-flex-col;

    &--center {
      @apply tw-items-center tw-text-center tw-w-full;
    }
  }

  &__item-title {
    @apply tw-text-xs tw-leading-4 tw-truncate;
    color: var(--app-hub-item-title);

    &--app {
      @apply tw-whitespace-normal tw-break-words;
      overflow: visible;
      text-overflow: clip;
    }

    &--center {
      @apply tw-max-w-full tw-text-center;
    }
  }

  &__item-subtitle {
    @apply tw-text-[10px] tw-leading-4 tw-whitespace-normal tw-break-words;
    overflow: visible;
    text-overflow: clip;
    color: var(--app-hub-item-subtitle);
  }

  &__empty {
    @apply tw-text-sm tw-px-2 tw-py-3;
    color: var(--app-hub-item-subtitle);
  }

  &__widget-icon-wrap {
    @apply tw-relative tw-shrink-0 tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center;
  }

  &__widget-badge {
    @apply tw-absolute -tw-right-[2px] -tw-top-[2px] tw-w-[6px] tw-h-[6px] tw-rounded-full;
    background-color: var(--danger-500);
  }

  &__back-button {
    @apply tw-flex tw-items-center tw-gap-1.5 tw-px-1.5 tw-py-1 tw-rounded-md tw-text-xs tw-font-medium tw-cursor-pointer tw-transition-colors tw-duration-150;
    color: var(--app-hub-item-title);

    &:hover {
      background: var(--app-hub-item-bg-hover);
    }
  }

  &__back-title {
    @apply tw-truncate;
  }

  &__widget-inline-body {
    @apply tw-flex tw-flex-col tw-flex-1 tw-min-h-0 tw-overflow-hidden;
  }

  &__flyout {
    @apply tw-mx-2 tw-mb-2 tw-w-auto tw-max-h-none tw-flex tw-flex-col tw-rounded-md tw-border tw-border-solid tw-bg-[var(--app-bar-background)] tw-shadow-md;
    border-color: var(--app-hub-divider-color);
  }

  &__flyout-header {
    @apply tw-flex tw-items-center tw-justify-between tw-gap-2 tw-px-3 tw-py-2 tw-border-b tw-border-solid;
    border-color: var(--app-hub-divider-color);
  }

  &__flyout-title {
    @apply tw-text-sm tw-font-medium tw-truncate;
    color: var(--app-hub-item-title);
  }

  &__flyout-body {
    @apply tw-overflow-auto tw-min-h-0;
  }
}

.app-hub-content-flyout-enter-active,
.app-hub-content-flyout-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.app-hub-content-flyout-enter-from,
.app-hub-content-flyout-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
