<template>
  <div
    ref="rootEl"
    class="vc-widget-item"
    :class="{ 'vc-widget-item--horizontal': horizontal, 'vc-widget-item--editing': editing }"
    @click.capture="onCapture"
    @keydown.capture="onKeydownCapture"
    @click="onClick"
    @mouseenter="onMouseEnter"
    @mouseleave="scheduleClose"
    @keydown="onKeydown"
    @touchstart.passive="onTouchStart"
  >
    <!-- Headless: framework renders VcWidget from config -->
    <template v-if="widget.headless">
      <div
        v-if="resolveLoading(widget)"
        class="vc-widget-item__skeleton"
        :class="{ 'vc-widget-item__skeleton--horizontal': horizontal }"
      >
        <template v-if="horizontal">
          <VcSkeleton
            variant="block"
            width="100%"
            :height="32"
          />
        </template>
        <template v-else>
          <VcSkeleton
            variant="circle"
            :width="18"
            :height="18"
          />
          <VcSkeleton
            variant="block"
            :width="36"
            :height="10"
            class="tw-mt-1"
          />
        </template>
      </div>
      <WidgetScope
        v-else
        :widget-id="widget.id"
        :render-state="renderState"
      >
        <VcWidget
          :class="{ 'tw-w-full': horizontal }"
          :icon="widget.headless.icon"
          :title="resolveTitle(widget)"
          :value="resolveBadge(widget)"
          :disabled="resolveDisabled(widget)"
          :widget-id="widget.id"
          :horizontal="horizontal"
          @click="onHeadlessClick"
        />
      </WidgetScope>
    </template>

    <!-- Component-based: external widgets / legacy -->
    <WidgetScope
      v-else
      :widget-id="widget.id"
      :render-state="renderState"
    >
      <component
        :is="widget.component"
        :class="{ 'tw-w-full': horizontal }"
        v-bind="widget.props || {}"
        :horizontal="horizontal || undefined"
        :widget-id="widget.id"
        v-on="widget.events || {}"
      />
    </WidgetScope>

    <WidgetAlertsPopover
      v-if="alerts.length && !editing"
      :alerts="alerts"
      :content="alertsComponent"
      :anchor="rootEl"
      :show="popoverOpen"
      :focus-on-open="openedByKeyboard"
      :return-focus-to="keyboardTrigger"
      :title="popoverTitle"
      :open-label="openedByTap ? t('COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.OPEN') : undefined"
      @update:show="setOpen"
      @open="openWidget"
      @hover="onPopoverHover"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { IWidget } from "@core/services/widget-service";
import type { IWidgetRenderState } from "@ui/components/atoms/vc-widget/widget-render-state";
import { VcWidget } from "@ui/components/atoms/vc-widget";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import WidgetScope from "./WidgetScope.vue";
import WidgetAlertsPopover from "./WidgetAlertsPopover.vue";
import { useHeadlessWidgetHelpers } from "./useHeadlessWidgetHelpers";
import { resolveAlerts, highestSeverity } from "./widget-alerts";

interface Props {
  widget: IWidget;
  editing: boolean;
  horizontal?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (event: "click"): void }>();

const { resolveBadge, resolveLoading, resolveDisabled, resolveTitle, handleHeadlessClick } = useHeadlessWidgetHelpers();

const { t } = useI18n();
const alerts = computed(() => resolveAlerts(props.widget));
// Component widgets set it through useWidgetTrigger, headless ones in their declaration
const alertsComponent = computed(() => props.widget.trigger?.alertsComponent ?? props.widget.headless?.alertsComponent);
const popoverOpen = ref(false);

// Reads the live widget so a trigger set later by a component widget is picked up
const renderState: IWidgetRenderState = {
  alertSeverity: computed(() => highestSeverity(alerts.value)),
  alertsDescription: computed(() =>
    alerts.value.length
      ? t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.ALERTS_COUNT", { count: alerts.value.length })
      : undefined,
  ),
  alertsOpen: popoverOpen,
  editing: toRef(props, "editing"),
  renderedTitle: ref<string>(),
};
const popoverTitle = computed(() =>
  t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.ALERTS_TITLE", {
    title: resolveTitle(props.widget) || renderState.renderedTitle.value || "",
  }),
);

const OPEN_DELAY_MS = 300;
const CLOSE_DELAY_MS = 200;
const EMULATED_MOUSE_MS = 1000;

const rootEl = ref<HTMLElement | null>(null);
// Set when the panel was opened from the keyboard: focus moves in and comes back to this element
const keyboardTrigger = ref<HTMLElement | null>(null);
const openedByKeyboard = computed(() => keyboardTrigger.value !== null);
// Touch has no hover: a tap opened the panel, so it offers an explicit Open button
const openedByTap = ref(false);
let lastTouchAt = -Infinity;
let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
// Set while the panel's Open button replays the widget's own click
let passNextClick = false;

const canOpen = () => !props.editing && alerts.value.length > 0;

function clearTimers() {
  clearTimeout(openTimer);
  clearTimeout(closeTimer);
}

function setOpen(value: boolean, trigger: HTMLElement | null = null) {
  clearTimers();
  const open = value && canOpen();
  if (open && !popoverOpen.value) {
    keyboardTrigger.value = trigger;
    openedByTap.value = false;
  }
  popoverOpen.value = open;
}

function onMouseEnter() {
  clearTimeout(closeTimer);
  // Touch browsers emulate mouseenter after a tap; a tap must not open the panel
  if (Date.now() - lastTouchAt < EMULATED_MOUSE_MS) return;
  if (!canOpen() || popoverOpen.value) return;
  clearTimeout(openTimer);
  openTimer = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
}

function scheduleClose() {
  clearTimeout(openTimer);
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
}

function onPopoverHover(hovered: boolean) {
  if (hovered) clearTimeout(closeTimer);
  else scheduleClose();
}

// The rendered VcWidget; a component widget may wrap it, so its root is only the fallback
const widgetTrigger = () => {
  const el = rootEl.value?.querySelector(".vc-widget") ?? rootEl.value?.firstElementChild;
  return el instanceof HTMLElement ? el : null;
};

// Only the widget's own trigger opens the panel, not an input or select inside a component widget
function onKeydown(event: KeyboardEvent) {
  if (event.key !== "ArrowDown" || !canOpen()) return;
  const trigger = widgetTrigger();
  if (!trigger || event.target !== trigger) return;
  event.preventDefault();
  setOpen(true, trigger);
}

function onTouchStart() {
  lastTouchAt = Date.now();
}

function openWidget() {
  setOpen(false);
  passNextClick = true;
  widgetTrigger()?.click();
  passNextClick = false;
}

watch(
  () => [props.editing, alerts.value.length] as const,
  () => {
    if (!canOpen()) setOpen(false);
  },
);

onBeforeUnmount(clearTimers);

// Swallows clicks and Enter/Space before they reach the widget's own handlers: all of them in edit
// mode, and the first tap on a widget with alerts, which shows the alerts instead of opening it
function onCapture(event: Event) {
  if (passNextClick) return;
  const firstTap =
    event.type === "click" && Date.now() - lastTouchAt < EMULATED_MOUSE_MS && canOpen() && !popoverOpen.value;
  if (!props.editing && !firstTap) return;
  event.stopPropagation();
  event.preventDefault();
  if (firstTap) {
    setOpen(true);
    openedByTap.value = true;
  }
}

function onKeydownCapture(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === " ") onCapture(event);
}

function onHeadlessClick() {
  handleHeadlessClick(props.widget);
  emit("click");
}

// Component widgets handle their own click; the wrapper only reports it
function onClick() {
  setOpen(false);
  if (!props.widget.headless) emit("click");
}
</script>

<style lang="scss">
.vc-widget-item {
  @apply tw-flex tw-shrink-0;

  &--horizontal {
    @apply tw-w-full;
  }

  &--editing {
    @apply tw-cursor-grab;
  }

  &__skeleton {
    @apply tw-shrink-0 tw-px-2 tw-py-1.5 tw-flex tw-flex-col tw-items-center tw-justify-center;

    &--horizontal {
      @apply tw-w-full tw-p-0;
    }
  }
}
</style>
