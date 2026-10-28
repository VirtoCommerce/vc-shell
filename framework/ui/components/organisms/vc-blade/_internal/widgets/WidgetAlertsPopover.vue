<template>
  <VcPopover
    ref="popoverRef"
    :show="show"
    :anchor-ref="anchor"
    :title="title"
    placement="bottom-start"
    role="dialog"
    :aria-label="title"
    @update:show="emit('update:show', $event)"
  >
    <ul class="vc-widget-alerts">
      <li
        v-for="alert in alerts"
        :key="alert.id"
        class="vc-widget-alerts__row"
      >
        <button
          type="button"
          class="vc-widget-alerts__open"
          @click="open(alert)"
        >
          <span
            class="vc-widget-alerts__dot"
            :class="`vc-widget-alerts__dot--${SEVERITY_DOT_VARIANT[alert.severity]}`"
          />
          <span class="vc-widget-alerts__body">
            <span class="vc-widget-alerts__text">{{ alert.text }}</span>
            <span
              v-if="alert.meta"
              class="vc-widget-alerts__meta"
              >{{ alert.meta }}</span
            >
          </span>
        </button>
        <button
          v-if="alert.action"
          type="button"
          class="vc-widget-alerts__action"
          @click.stop="alert.action.run()"
        >
          {{ alert.action.label }}
        </button>
      </li>
    </ul>
  </VcPopover>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import type { IWidgetAlert } from "@core/services/widget-service";
import { VcPopover } from "@ui/components/molecules/vc-popover";
import { SEVERITY_DOT_VARIANT } from "./widget-alerts";

interface Props {
  alerts: IWidgetAlert[];
  anchor: HTMLElement | null;
  show: boolean;
  title: string;
  /** Move focus to the first row once the panel is shown (keyboard open) */
  focusOnOpen?: boolean;
  /** Receives focus on close when focus was inside the panel or lost */
  returnFocusTo?: HTMLElement | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: "update:show", value: boolean): void;
  /** Pointer entered or left the panel, so the owner can keep it open while hovered */
  (event: "hover", value: boolean): void;
}>();

const SEEN_DELAY_MS = 300;
let seenTimers: ReturnType<typeof setTimeout>[] = [];
// Alerts shown for the delay; their onSeen runs on close so the open panel keeps its rows
const seen = new Set<IWidgetAlert>();

function clearSeenTimers() {
  seenTimers.forEach(clearTimeout);
  seenTimers = [];
}

function flushSeen() {
  clearSeenTimers();
  const alerts = [...seen];
  seen.clear();
  for (const alert of alerts) alert.onSeen?.();
}

// A pass-through hover must not clear alerts: only a panel open for the delay counts
watch(
  [() => props.show, () => props.alerts],
  ([shown]) => {
    if (!shown) {
      flushSeen();
      return;
    }
    const shownNow = props.alerts;
    seenTimers.push(setTimeout(() => shownNow.forEach((alert) => seen.add(alert)), SEEN_DELAY_MS));
  },
  { immediate: true },
);

onBeforeUnmount(flushSeen);

function open(alert: IWidgetAlert) {
  alert.onOpen?.();
  emit("update:show", false);
}

const popoverRef = ref<{ panelEl: HTMLElement | null } | null>(null);

// The panel is teleported, so listen on its own root rather than on this component's DOM
const onEnter = () => emit("hover", true);
const onLeave = () => emit("hover", false);

watch(
  () => popoverRef.value?.panelEl ?? null,
  (el, prev) => {
    prev?.removeEventListener("mouseenter", onEnter);
    prev?.removeEventListener("mouseleave", onLeave);
    el?.addEventListener("mouseenter", onEnter);
    el?.addEventListener("mouseleave", onLeave);
    if (el && props.focusOnOpen) el.querySelector<HTMLElement>(".vc-widget-alerts__open")?.focus();
  },
  { flush: "post" },
);

// Panel is still mounted while the leave transition runs, so focus can be read before it goes
watch(
  () => props.show,
  (shown, was) => {
    if (shown || !was || !props.returnFocusTo) return;
    const active = document.activeElement;
    const panel = popoverRef.value?.panelEl;
    if (active === document.body || (panel && active && panel.contains(active))) props.returnFocusTo.focus();
  },
);
</script>

<style lang="scss">
.vc-widget-alerts {
  @apply tw-m-0 tw-p-0 tw-list-none tw-flex tw-flex-col;

  &__row {
    @apply tw-flex tw-items-start tw-gap-2 tw-pe-2;

    &:hover,
    &:focus-within {
      background-color: var(--secondary-100);
    }
  }

  &__open {
    @apply tw-flex tw-min-w-0 tw-flex-1 tw-items-start tw-gap-2 tw-border-0 tw-bg-transparent tw-px-3 tw-py-2 tw-text-start tw-cursor-pointer;
  }

  &__dot {
    @apply tw-mt-1.5 tw-size-2 tw-shrink-0 tw-rounded-full;
    background-color: var(--badge-background-color-info);

    &--danger {
      background-color: var(--badge-background-color-danger);
    }

    &--warning {
      background-color: var(--badge-background-color-warning);
    }

    &--info {
      background-color: var(--badge-background-color-info);
    }
  }

  &__body {
    @apply tw-flex tw-min-w-0 tw-flex-1 tw-flex-col;
  }

  &__text {
    @apply tw-text-sm;
    color: var(--secondary-950);
  }

  &__meta {
    @apply tw-text-xs;
    color: var(--neutrals-500);
  }

  &__action {
    @apply tw-shrink-0 tw-rounded tw-border-0 tw-bg-transparent tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-cursor-pointer;
    color: var(--primary-500);

    &:hover {
      background-color: var(--secondary-100);
    }
  }
}
</style>
