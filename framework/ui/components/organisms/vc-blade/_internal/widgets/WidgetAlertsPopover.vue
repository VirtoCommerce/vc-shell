<template>
  <VcPopover
    ref="popoverRef"
    :show="show"
    :anchor-ref="anchor"
    placement="bottom-start"
    role="dialog"
    :aria-label="title"
    @update:show="emit('update:show', $event)"
  >
    <component
      :is="content"
      v-if="content"
      :alerts="alerts"
      :close="close"
    />
    <ul
      v-else
      class="vc-widget-alerts"
    >
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
    <div
      v-if="openLabel"
      class="vc-widget-alerts__footer"
    >
      <button
        type="button"
        class="vc-widget-alerts__open-widget"
        @click="emit('open')"
      >
        {{ openLabel }}
      </button>
    </div>
  </VcPopover>
</template>

<script setup lang="ts">
import { type Component, ref, watch } from "vue";
import type { IWidgetAlert } from "@core/services/widget-service";
import { VcPopover } from "@ui/components/molecules/vc-popover";
import { SEVERITY_DOT_VARIANT } from "@core/types/severity";

interface Props {
  alerts: IWidgetAlert[];
  /** Widget's own popup content (`alertsComponent`); the default rows otherwise */
  content?: Component;
  anchor: HTMLElement | null;
  show: boolean;
  /** Accessible name only; the panel has no visible header, the hovered widget already names it */
  title: string;
  /** Move focus to the first row once the panel is shown (keyboard open) */
  focusOnOpen?: boolean;
  /** Receives focus on close when focus was inside the panel or lost */
  returnFocusTo?: HTMLElement | null;
  /** Shows a button that opens the widget itself (touch, where a tap opened the panel instead) */
  openLabel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: "update:show", value: boolean): void;
  /** Pointer entered or left the panel, so the owner can keep it open while hovered */
  (event: "hover", value: boolean): void;
  /** The Open button was pressed */
  (event: "open"): void;
}>();

function close() {
  emit("update:show", false);
}

function open(alert: IWidgetAlert) {
  alert.onOpen?.();
  close();
}

const FOCUSABLE =
  "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])";

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
    if (el && props.focusOnOpen) el.querySelector<HTMLElement>(FOCUSABLE)?.focus();
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

  &__footer {
    @apply tw-p-2;
    border-block-start: 1px solid var(--neutrals-200);
  }

  &__open-widget {
    @apply tw-w-full tw-min-h-9 tw-rounded tw-border-0 tw-text-sm tw-font-medium tw-cursor-pointer;
    color: var(--additional-50);
    background-color: var(--primary-500);
  }
}
</style>
