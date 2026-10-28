<template>
  <div class="vc-widget-container-desktop">
    <div class="vc-widget-container-desktop__content">
      <div
        ref="stripEl"
        class="vc-widget-container-desktop__strip"
        :class="{ 'vc-widget-container-desktop__strip--drop-zone': editing && !strip.length }"
        :data-empty-text="t('COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.STRIP_EMPTY')"
        data-widget-list="strip"
        @keydown="onStripKeydown"
      >
        <div
          v-for="widget in strip"
          :key="widget.id"
          class="vc-widget-container-desktop__item"
          :class="{ 'vc-widget-container-desktop__item--editing': editing }"
          :data-widget-id="widget.id"
        >
          <VcIcon
            v-if="editing"
            icon="lucide-grip-vertical"
            size="xs"
            class="vc-widget-container-desktop__grip vc-widget-container-desktop__grip--corner"
            aria-hidden="true"
          />
          <WidgetItem
            :widget="widget"
            :editing="editing"
          />
          <button
            v-if="editing"
            type="button"
            class="vc-widget-container-desktop__edit-btn vc-widget-container-desktop__edit-btn--remove"
            :aria-label="t('COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.REMOVE', { title: titleOf(widget) })"
            @click="moveToOverflow(widget.id)"
          >
            <VcIcon
              icon="lucide-minus"
              size="xs"
            />
          </button>
        </div>
      </div>

      <VcDropdown
        :model-value="menuOpen"
        floating
        force-mount
        placement="bottom-end"
        variant="secondary"
        :padded="false"
        :close-on-click-outside="!editing"
        @update:model-value="onMenuToggle"
      >
        <template #trigger="{ isActive, toggle }">
          <button
            type="button"
            class="vc-widget-container-desktop__more"
            :class="{ 'vc-widget-container-desktop__more--active': isActive }"
            :aria-label="moreLabel"
            :aria-expanded="isActive"
            aria-haspopup="true"
            @click="toggle"
          >
            <VcIcon icon="lucide-chevron-down" />
            <span
              v-if="moreDot && !editing"
              class="vc-widget-container-desktop__more-dot"
              :class="`vc-widget-container-desktop__more-dot--${moreDot}`"
              aria-hidden="true"
            />
          </button>
        </template>

        <template #items-container>
          <div class="vc-widget-container-desktop__menu">
            <div
              v-if="editing"
              class="vc-widget-container-desktop__menu-title"
            >
              {{ t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.NOT_ON_BLADE") }}
            </div>
            <!-- Stays mounted while empty in edit mode: it is the drop target for hiding a widget -->
            <div
              v-show="editing || overflowItems.length"
              ref="overflowEl"
              class="vc-widget-container-desktop__list"
              :class="{ 'vc-widget-container-desktop__list--drop-zone': editing && !overflowItems.length }"
              :data-empty-text="t('COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.ALL_ON_BLADE')"
              data-widget-list="overflow"
              @keydown="onOverflowKeydown"
            >
              <div
                v-for="widget in overflowItems"
                :key="widget.id"
                class="vc-widget-container-desktop__row"
                :data-widget-id="widget.id"
              >
                <VcIcon
                  v-if="editing"
                  icon="lucide-grip-vertical"
                  size="xs"
                  class="vc-widget-container-desktop__grip"
                  aria-hidden="true"
                />
                <WidgetItem
                  :widget="widget"
                  :editing="editing"
                  horizontal
                  @click="onRowClick"
                />
                <button
                  v-if="editing"
                  type="button"
                  class="vc-widget-container-desktop__edit-btn vc-widget-container-desktop__edit-btn--add"
                  :disabled="!canAddToStrip"
                  :aria-label="t('COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.ADD', { title: titleOf(widget) })"
                  @click="moveToStrip(widget.id)"
                >
                  <VcIcon
                    icon="lucide-plus"
                    size="xs"
                  />
                </button>
              </div>
            </div>
            <div
              v-if="editing && !canAddToStrip && overflowItems.length"
              class="vc-widget-container-desktop__empty"
            >
              {{ t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.STRIP_FULL", { max: WIDGET_STRIP_MAX }) }}
            </div>

            <div
              v-if="editing || canCustomize"
              class="vc-widget-container-desktop__footer"
              :class="{ 'vc-widget-container-desktop__footer--alone': !editing && !overflowItems.length }"
            >
              <template v-if="editing">
                <button
                  type="button"
                  class="vc-widget-container-desktop__link"
                  @click="reset"
                >
                  {{ t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.RESET") }}
                </button>
                <button
                  type="button"
                  class="vc-widget-container-desktop__done"
                  @click="finishEdit"
                >
                  {{ t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.DONE") }}
                </button>
              </template>
              <button
                v-else
                type="button"
                class="vc-widget-container-desktop__link"
                @click="startEdit"
              >
                {{ t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.CUSTOMIZE") }}
              </button>
            </div>
          </div>
        </template>
      </VcDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { IWidget } from "@core/services/widget-service";
import { VcDropdown } from "@ui/components/molecules/vc-dropdown";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import WidgetItem from "./WidgetItem.vue";
import { useWidgetLayout, WIDGET_STRIP_MAX } from "./useWidgetLayout";
import { useWidgetEditReorder } from "./useWidgetEditReorder";
import { useHeadlessWidgetHelpers } from "./useHeadlessWidgetHelpers";
import { resolveAlerts, highestSeverity, sortAlertsFirst, SEVERITY_DOT_VARIANT } from "./widget-alerts";

interface Props {
  widgets: IWidget[];
  bladeId: string;
  bladeName?: string;
}

const props = withDefaults(defineProps<Props>(), { bladeName: "" });
const { t } = useI18n();
const { resolveTitle } = useHeadlessWidgetHelpers();

const layout = useWidgetLayout(
  () => props.bladeName,
  () => props.widgets,
);
const { strip, overflow, editing, canAddToStrip, startEdit: beginEdit, commit, reset: resetLayout } = layout;

const menuOpen = ref(false);
// An unnamed blade would share one storage key, so it cannot be customized
const canCustomize = computed(() => !!props.bladeName);

const titleOf = (widget: IWidget) => resolveTitle(widget);

// Edit mode keeps the draft order so list indices stay meaningful
const overflowItems = computed(() => (editing.value ? overflow.value : sortAlertsFirst(overflow.value)));

const hiddenAlerts = computed(() => overflow.value.flatMap(resolveAlerts));
const moreDot = computed(() => {
  const severity = highestSeverity(hiddenAlerts.value);
  return severity ? SEVERITY_DOT_VARIANT[severity] : undefined;
});
const moreLabel = computed(() =>
  hiddenAlerts.value.length && !editing.value
    ? t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.MORE_WIDGETS_ALERTS", { count: hiddenAlerts.value.length })
    : t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.MORE_WIDGETS"),
);

function startEdit() {
  if (canCustomize.value) beginEdit();
}

function finishEdit() {
  commit();
  menuOpen.value = false;
}

function reset() {
  resetLayout();
}

function onMenuToggle(open: boolean) {
  menuOpen.value = open;
  if (!open && editing.value) commit();
}

function onRowClick() {
  if (!editing.value) menuOpen.value = false;
}

// ── Drag and keyboard reorder ───────────────────────────────────────────────

const stripEl = ref<HTMLElement>();
const overflowEl = ref<HTMLElement>();
const { onStripKeydown, onOverflowKeydown, moveToStrip, moveToOverflow } = useWidgetEditReorder({
  layout,
  stripEl,
  overflowEl,
  stripAxis: "horizontal",
  controlSelector: ".vc-widget-container-desktop__edit-btn",
});
</script>

<style lang="scss">
:root {
  --blade-toolbar-widgets-bg-color: var(--neutrals-100);
  --blade-toolbar-widgets-bg-hover-color: var(--neutrals-200);
}

.vc-widget-container-desktop {
  @apply tw-relative tw-flex tw-select-none tw-shrink-0;
  width: fit-content;
  background-color: var(--blade-toolbar-widgets-bg-color);

  &__content {
    @apply tw-flex tw-flex-row tw-items-stretch tw-gap-1;
  }

  &__strip {
    @apply tw-flex tw-flex-row tw-gap-1;

    // Every widget hidden while customizing: keep a place to drop one back
    &--drop-zone {
      @apply tw-items-center tw-justify-center tw-m-1 tw-px-3 tw-rounded tw-text-xs tw-whitespace-nowrap;
      color: var(--neutrals-500);
      border: 1px dashed var(--neutrals-400);

      &:empty::before {
        content: attr(data-empty-text);
      }
    }
  }

  &__item {
    @apply tw-relative tw-flex tw-shrink-0;

    // Dashed tile marks the widget as draggable while customizing
    &--editing {
      @apply tw-rounded;
      outline: 1px dashed var(--neutrals-400);
      outline-offset: -2px;
    }
  }

  &__grip {
    @apply tw-shrink-0 tw-ms-2;
    color: var(--neutrals-400);

    &--corner {
      @apply tw-absolute tw-ms-0 tw-pointer-events-none;
      inset-block-start: 4px;
      inset-inline-start: 2px;
      z-index: var(--z-local-above);
    }
  }

  &__edit-btn {
    @apply tw-absolute tw-flex tw-items-center tw-justify-center tw-w-4 tw-h-4 tw-rounded-full tw-cursor-pointer;
    inset-block-start: 2px;
    inset-inline-end: 2px;
    z-index: var(--z-local-above);
    color: var(--additional-50);
    background-color: var(--neutrals-600);

    &--remove {
      background-color: var(--danger-500);

      &:hover {
        background-color: var(--danger-600);
      }
    }

    &--add {
      position: static;
      @apply tw-shrink-0 tw-w-5 tw-h-5 tw-me-2;
      background-color: var(--primary-500);

      &:hover:not(:disabled) {
        background-color: var(--primary-600);
      }

      &:disabled {
        @apply tw-cursor-not-allowed;
        color: var(--neutrals-400);
        background-color: var(--neutrals-200);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--primary-500);
      outline-offset: 1px;
    }
  }

  &__menu {
    @apply tw-flex tw-flex-col tw-min-w-[12rem];
  }

  &__menu-title {
    @apply tw-px-3 tw-pt-2 tw-pb-1 tw-text-xs tw-font-medium;
    color: var(--neutrals-500);
  }

  &__list {
    @apply tw-flex tw-flex-col tw-py-1;

    // Empty overflow while customizing: a visible place to drop a widget
    &--drop-zone {
      @apply tw-mx-3 tw-my-1 tw-py-3 tw-px-2 tw-rounded tw-text-xs tw-text-center;
      color: var(--neutrals-500);
      border: 1px dashed var(--neutrals-300);

      &:empty::before {
        content: attr(data-empty-text);
      }
    }
  }

  &__row {
    @apply tw-flex tw-items-center;

    // The widget takes the free width, so the +/- button stays inside the row
    > .vc-widget-item {
      @apply tw-flex-1 tw-min-w-0;
    }

    &:hover {
      background-color: var(--neutrals-100);
    }

    // Suppress widget's own hover, the row provides hover feedback
    --widget-bg-hover-color: transparent;
    --widget-bg-color: transparent;
    --widget-icon-hover-color: var(--widget-icon-color);
    --widget-title-hover-color: var(--widget-title-color);
    --widget-border-radius: 0;

    .vc-widget--horizontal {
      @apply tw-px-2 tw-py-[6px] tw-gap-2;

      .vc-widget__icon-container {
        @apply tw-flex tw-items-center tw-justify-center;
      }

      .vc-widget__icon {
        font-size: 14px;
      }

      .vc-widget__content {
        @apply tw-ms-0;
      }

      .vc-widget__title {
        @apply tw-mt-0 tw-text-xs tw-font-normal;
      }
    }
  }

  &__empty {
    @apply tw-px-3 tw-py-2 tw-text-xs;
    color: var(--neutrals-500);
  }

  &__footer {
    @apply tw-flex tw-items-center tw-justify-between tw-gap-2 tw-px-3 tw-py-2;
    border-block-start: 1px solid var(--neutrals-200);

    // Nothing above it: no separator
    &--alone {
      border-block-start: 0;
    }
  }

  &__link {
    @apply tw-text-xs tw-cursor-pointer;
    color: var(--primary-600);

    &:hover {
      text-decoration: underline;
    }
  }

  &__done {
    @apply tw-text-xs tw-font-medium tw-px-3 tw-py-1 tw-rounded tw-cursor-pointer tw-ms-auto;
    color: var(--additional-50);
    background-color: var(--primary-500);

    &:hover {
      background-color: var(--primary-600);
    }
  }

  &__more {
    @apply tw-relative tw-flex tw-items-center tw-justify-center tw-px-2 tw-h-full tw-cursor-pointer;
    color: var(--blade-toolbar-icon-color);

    &:hover,
    &--active {
      color: var(--blade-toolbar-icon-hover-color);
      background-color: var(--blade-toolbar-widgets-bg-hover-color);
    }
  }

  &__more-dot {
    @apply tw-absolute tw-w-2 tw-h-2 tw-rounded-full;
    inset-block-start: 6px;
    inset-inline-end: 4px;

    &--danger {
      background-color: var(--danger-500);
    }

    &--warning {
      background-color: var(--warning-500);
    }

    &--info {
      background-color: var(--info-500);
    }
  }
}
</style>
