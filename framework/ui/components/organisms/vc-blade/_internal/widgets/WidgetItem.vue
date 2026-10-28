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
    @touchend="onTouchEnd"
    @touchmove.passive="onTouchMove"
    @touchcancel="onTouchEnd"
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
      :anchor="rootEl"
      :show="popoverOpen"
      :focus-on-open="openedByKeyboard"
      :return-focus-to="keyboardTrigger"
      :title="popoverTitle"
      @update:show="setOpen"
      @hover="onPopoverHover"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { IWidget } from "@core/services/widget-service";
import type { IWidgetRenderState } from "./widget-render-state";
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
};
const popoverTitle = computed(() =>
  t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.ALERTS_TITLE", { title: resolveTitle(props.widget) }),
);

const OPEN_DELAY_MS = 300;
const CLOSE_DELAY_MS = 200;
const LONG_PRESS_MS = 500;
const SUPPRESS_WINDOW_MS = 500;
const EMULATED_MOUSE_MS = 1000;
const MOVE_TOLERANCE_PX = 10;

const rootEl = ref<HTMLElement | null>(null);
// Set when the panel was opened from the keyboard: focus moves in and comes back to this element
const keyboardTrigger = ref<HTMLElement | null>(null);
const openedByKeyboard = computed(() => keyboardTrigger.value !== null);
let lastTouchAt = -Infinity;
let touchStart: { x: number; y: number } | null = null;
let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let pressTimer: ReturnType<typeof setTimeout> | undefined;
let suppressTimer: ReturnType<typeof setTimeout> | undefined;
// Set by a long press so the click the browser fires on release is swallowed once
let suppressNextClick = false;

const canOpen = () => !props.editing && alerts.value.length > 0;

function clearTimers() {
  clearTimeout(openTimer);
  clearTimeout(closeTimer);
  clearTimeout(pressTimer);
}

function setOpen(value: boolean, trigger: HTMLElement | null = null) {
  clearTimers();
  const open = value && canOpen();
  if (open && !popoverOpen.value) keyboardTrigger.value = trigger;
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

// Only the widget's own trigger opens the panel, not an input or select inside a component widget
function onKeydown(event: KeyboardEvent) {
  if (event.key !== "ArrowDown" || !canOpen()) return;
  const trigger = rootEl.value?.firstElementChild;
  if (!(trigger instanceof HTMLElement) || event.target !== trigger) return;
  event.preventDefault();
  setOpen(true, trigger);
}

function onTouchStart(event: TouchEvent) {
  lastTouchAt = Date.now();
  clearTimeout(pressTimer);
  clearTimeout(suppressTimer);
  suppressNextClick = false;
  const point = event.touches?.[0];
  touchStart = point ? { x: point.clientX, y: point.clientY } : null;
  if (!canOpen()) return;
  pressTimer = setTimeout(() => {
    suppressNextClick = true;
    setOpen(true);
  }, LONG_PRESS_MS);
}

// Only real movement cancels the long press; the release-click suppression is left alone
function onTouchMove(event: TouchEvent) {
  lastTouchAt = Date.now();
  const point = event.touches?.[0];
  if (!point || !touchStart) return;
  if (Math.hypot(point.clientX - touchStart.x, point.clientY - touchStart.y) > MOVE_TOLERANCE_PX) {
    clearTimeout(pressTimer);
  }
}

function onTouchEnd() {
  lastTouchAt = Date.now();
  clearTimeout(pressTimer);
  // The release click follows at once; if none comes, drop the flag so it cannot eat a later tap
  clearTimeout(suppressTimer);
  if (suppressNextClick) suppressTimer = setTimeout(() => (suppressNextClick = false), SUPPRESS_WINDOW_MS);
}

watch(
  () => [props.editing, alerts.value.length] as const,
  () => {
    if (!canOpen()) setOpen(false);
  },
);

onBeforeUnmount(() => {
  clearTimers();
  clearTimeout(suppressTimer);
});

// Edit mode: swallow clicks and Enter/Space before they reach the widget's own handlers
function onCapture(event: Event) {
  if (suppressNextClick && event.type === "click") {
    suppressNextClick = false;
  } else if (!props.editing) {
    return;
  }
  event.stopPropagation();
  event.preventDefault();
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
