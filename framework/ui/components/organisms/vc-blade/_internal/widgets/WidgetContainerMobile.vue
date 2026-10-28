<template>
  <div
    v-show="isAnyVisible"
    class="vc-widget-container-mobile"
  >
    <div
      ref="containerRef"
      class="vc-widget-container-mobile__content"
    >
      <WidgetItem
        v-for="widget in visibleItems"
        :key="widget.id"
        :widget="widget"
        :editing="editing"
        :data-item-key="widget.id"
      />

      <button
        type="button"
        data-more-button
        class="vc-widget-container-mobile__more"
        :class="{ 'vc-widget-container-mobile__more--active': showOverflow }"
        :aria-label="moreLabel"
        :aria-expanded="showOverflow"
        aria-haspopup="dialog"
        @click="showOverflow = true"
      >
        <VcIcon icon="lucide-chevron-up" />
        <span
          v-if="moreDot && !editing"
          class="vc-widget-container-mobile__more-dot"
          :class="`vc-widget-container-mobile__more-dot--${moreDot}`"
          aria-hidden="true"
        />
      </button>
    </div>

    <VcSidebar
      :model-value="showOverflow"
      position="bottom"
      size="sm"
      draggable
      drag-handle
      force-mount
      :close-button="false"
      :inset="false"
      :close-on-overlay="!editing"
      @update:model-value="onSheetToggle"
    >
      <!-- Stays mounted while editing: a component widget loads data and subscribes once per mount -->
      <div
        v-show="!editing"
        class="vc-widget-container-mobile__sheet-list"
      >
        <WidgetItem
          v-for="item in sheetItems"
          :key="item.id"
          :widget="item"
          :editing="editing"
          horizontal
          :data-widget-id="item.id"
          @click="showOverflow = false"
        />
      </div>

      <div
        v-if="editing"
        class="vc-widget-container-mobile__edit"
      >
        <div class="vc-widget-container-mobile__title">
          {{ t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.ON_BLADE", { max: WIDGET_STRIP_MAX }) }}
        </div>
        <div
          ref="stripEl"
          class="vc-widget-container-mobile__list"
          data-widget-list="strip"
          @keydown="onStripKeydown"
        >
          <div
            v-for="widget in strip"
            :key="widget.id"
            class="vc-widget-container-mobile__row"
            :data-widget-id="widget.id"
          >
            <button
              type="button"
              class="vc-widget-container-mobile__grip"
              :aria-label="t('COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.REORDER', { title: titleOf(widget) })"
            >
              <VcIcon
                icon="lucide-grip-vertical"
                size="s"
              />
            </button>
            <span class="vc-widget-container-mobile__row-label">
              <VcIcon
                v-if="iconOf(widget)"
                :icon="iconOf(widget)"
                size="s"
              />
              <span class="vc-widget-container-mobile__row-title">{{ titleOf(widget) }}</span>
            </span>
            <button
              type="button"
              class="vc-widget-container-mobile__edit-btn vc-widget-container-mobile__edit-btn--remove"
              :aria-label="t('COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.REMOVE', { title: titleOf(widget) })"
              @click="moveToOverflow(widget.id)"
            >
              <span class="vc-widget-container-mobile__edit-btn-icon">
                <VcIcon
                  icon="lucide-minus"
                  size="xs"
                />
              </span>
            </button>
          </div>
        </div>

        <div class="vc-widget-container-mobile__title">
          {{ t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.NOT_ON_BLADE") }}
        </div>
        <div
          ref="overflowEl"
          class="vc-widget-container-mobile__list"
          data-widget-list="overflow"
          @keydown="onOverflowKeydown"
        >
          <div
            v-for="widget in overflow"
            :key="widget.id"
            class="vc-widget-container-mobile__row"
            :data-widget-id="widget.id"
          >
            <button
              type="button"
              class="vc-widget-container-mobile__grip"
              :aria-label="t('COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.REORDER', { title: titleOf(widget) })"
            >
              <VcIcon
                icon="lucide-grip-vertical"
                size="s"
              />
            </button>
            <span class="vc-widget-container-mobile__row-label">
              <VcIcon
                v-if="iconOf(widget)"
                :icon="iconOf(widget)"
                size="s"
              />
              <span class="vc-widget-container-mobile__row-title">{{ titleOf(widget) }}</span>
            </span>
            <button
              type="button"
              class="vc-widget-container-mobile__edit-btn vc-widget-container-mobile__edit-btn--add"
              :disabled="!canAddToStrip"
              :aria-label="t('COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.ADD', { title: titleOf(widget) })"
              @click="moveToStrip(widget.id)"
            >
              <span class="vc-widget-container-mobile__edit-btn-icon">
                <VcIcon
                  icon="lucide-plus"
                  size="xs"
                />
              </span>
            </button>
          </div>
        </div>
        <div
          v-if="!overflow.length"
          class="vc-widget-container-mobile__empty"
        >
          {{ t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.ALL_ON_BLADE") }}
        </div>
        <div
          v-else-if="!canAddToStrip"
          class="vc-widget-container-mobile__empty"
        >
          {{ t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.STRIP_FULL", { max: WIDGET_STRIP_MAX }) }}
        </div>
      </div>

      <template
        v-if="editing || canCustomize"
        #footer
      >
        <div class="vc-widget-container-mobile__footer">
          <template v-if="editing">
            <button
              type="button"
              class="vc-widget-container-mobile__link"
              @click="resetLayout"
            >
              {{ t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.RESET") }}
            </button>
            <button
              type="button"
              class="vc-widget-container-mobile__done"
              @click="finishEdit"
            >
              {{ t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.DONE") }}
            </button>
          </template>
          <button
            v-else
            type="button"
            class="vc-widget-container-mobile__link"
            @click="startEdit"
          >
            {{ t("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.CUSTOMIZE") }}
          </button>
        </div>
      </template>
    </VcSidebar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAdaptiveItems } from "@ui/composables/useAdaptiveItems";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcSidebar } from "@ui/components/organisms/vc-sidebar";
import type { IWidget } from "@core/services/widget-service";
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

const containerRef = ref<HTMLElement | null>(null);
const showOverflow = ref(false);
const isAnyVisible = computed(() => props.widgets.length > 0);
// An unnamed blade would share one storage key, so it cannot be customized
const canCustomize = computed(() => !!props.bladeName);

const titleOf = (widget: IWidget) => resolveTitle(widget) || widget.trigger?.title || "";
const iconOf = (widget: IWidget) => widget.headless?.icon ?? widget.trigger?.icon;

// The bar and the sheet list keep the committed layout while editing, the edit lists show the draft.
// A component widget then keeps one mounted instance across an edit session, so its trigger stays live.
const frozen = ref<{ strip: string[]; overflow: string[] } | null>(null);
const byIds = (ids: string[]) => ids.flatMap((id) => props.widgets.find((w) => w.id === id) ?? []);
const barStrip = computed(() => (editing.value && frozen.value ? byIds(frozen.value.strip) : strip.value));
const barOverflow = computed(() => (editing.value && frozen.value ? byIds(frozen.value.overflow) : overflow.value));

const { visibleItems, hiddenItems } = useAdaptiveItems<IWidget>({
  containerRef,
  items: barStrip,
  getItemKey: (item: IWidget) => item.id ?? "",
  moreButtonWidth: 70,
  initialItemWidth: 80,
});

const sheetItems = computed(() => [...hiddenItems.value, ...sortAlertsFirst(barOverflow.value)]);

const hiddenAlerts = computed(() => [...hiddenItems.value, ...barOverflow.value].flatMap(resolveAlerts));
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
  if (!canCustomize.value) return;
  frozen.value = { strip: strip.value.map((w) => w.id), overflow: overflow.value.map((w) => w.id) };
  beginEdit();
}

function finishEdit() {
  commit();
  showOverflow.value = false;
}

function onSheetToggle(open: boolean) {
  showOverflow.value = open;
  if (!open && editing.value) commit();
}

const stripEl = ref<HTMLElement>();
const overflowEl = ref<HTMLElement>();
const { onStripKeydown, onOverflowKeydown, moveToStrip, moveToOverflow } = useWidgetEditReorder({
  layout,
  stripEl,
  overflowEl,
  stripAxis: "vertical",
  handle: ".vc-widget-container-mobile__grip",
  focusSelector: ".vc-widget-container-mobile__grip",
  controlSelector: ".vc-widget-container-mobile__edit-btn",
});
</script>

<style lang="scss">
:root {
  --blade-toolbar-widgets-bg-color-mobile: var(--additional-50);
  --blade-toolbar-widgets-mobile-height: 80px;
}

.vc-widget-container-mobile {
  @apply tw-fixed tw-bottom-0 tw-start-0 tw-end-0 tw-w-full tw-z-[var(--z-layout-widget)];
  height: var(--blade-toolbar-widgets-mobile-height);
  background-color: var(--blade-toolbar-widgets-bg-color-mobile);

  &__content {
    @apply tw-flex tw-flex-row tw-items-center tw-gap-1 tw-px-[22px] tw-w-full tw-overflow-hidden;
    height: var(--blade-toolbar-widgets-mobile-height);
  }

  &__more {
    @apply tw-relative tw-flex tw-items-center tw-justify-center tw-px-2 tw-h-full tw-cursor-pointer tw-ms-auto;
    color: var(--blade-toolbar-icon-color);
    outline: none;

    &:focus-visible {
      outline: 2px solid var(--primary-500);
      outline-offset: -2px;
    }

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

  &__sheet-list {
    @apply tw-flex tw-flex-col tw-gap-2 tw-p-4;
  }

  &__edit {
    @apply tw-flex tw-flex-col tw-pb-2;
  }

  &__title {
    @apply tw-px-4 tw-pt-3 tw-pb-1 tw-text-xs tw-font-medium;
    color: var(--neutrals-500);
  }

  &__list {
    @apply tw-flex tw-flex-col;
  }

  &__row {
    @apply tw-flex tw-items-center tw-gap-2 tw-px-2;
  }

  &__grip {
    @apply tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-shrink-0 tw-cursor-grab;
    color: var(--neutrals-500);
    touch-action: none;

    &:focus-visible {
      outline: 2px solid var(--primary-500);
      outline-offset: 1px;
    }
  }

  &__row-label {
    @apply tw-flex tw-flex-1 tw-items-center tw-gap-2 tw-min-w-0 tw-text-sm;
    color: var(--neutrals-800);
  }

  &__row-title {
    @apply tw-truncate;
  }

  // 32px hit area around a 24px visual circle
  &__edit-btn {
    @apply tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-shrink-0 tw-cursor-pointer;

    &-icon {
      @apply tw-flex tw-items-center tw-justify-center tw-w-6 tw-h-6 tw-rounded-full;
      color: var(--additional-50);
      background-color: var(--neutrals-600);
    }

    &--remove:hover .vc-widget-container-mobile__edit-btn-icon {
      background-color: var(--danger-500);
    }

    &--add .vc-widget-container-mobile__edit-btn-icon {
      background-color: var(--primary-500);
    }

    &--add:disabled {
      @apply tw-cursor-not-allowed;

      .vc-widget-container-mobile__edit-btn-icon {
        background-color: var(--neutrals-300);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--primary-500);
      outline-offset: 1px;
    }
  }

  &__empty {
    @apply tw-px-4 tw-py-2 tw-text-xs;
    color: var(--neutrals-500);
  }

  &__footer {
    @apply tw-flex tw-items-center tw-justify-between tw-gap-2 tw-px-4 tw-py-3;
    border-block-start: 1px solid var(--neutrals-200);
  }

  &__link {
    @apply tw-inline-flex tw-items-center tw-min-h-8 tw-text-sm tw-cursor-pointer;
    color: var(--primary-600);
  }

  &__done {
    @apply tw-text-sm tw-font-medium tw-px-4 tw-py-1 tw-rounded tw-cursor-pointer tw-ms-auto;
    color: var(--additional-50);
    background-color: var(--primary-500);
  }
}
</style>
