<!-- The Filters panel: a popover on desktop; `touch` is the phone sheet with Clear / Done, the views as chips and a "Show N results" footer -->
<template>
  <div
    class="vc-search-bar__panel vc-search-bar__fit"
    :class="{ 'vc-search-bar__panel--touch': touch }"
  >
    <div
      v-if="!touch"
      class="vc-search-bar__panel-head"
    >
      <span class="vc-search-bar__panel-title">
        {{ $t(`${K}FILTERS`) }}
        <span
          v-if="active"
          class="vc-search-bar__panel-active"
          >{{ $t(`${K}PANEL.ACTIVE`, { count: active }) }}</span
        >
      </span>
      <VcButton
        ref="closeBtn"
        class="vc-search-bar__panel-close"
        variant="ghost"
        size="2xs"
        icon="lucide-x"
        :aria-label="$t('COMPONENTS.CONTROLS.CLOSE')"
        @click="emit('close')"
      />
    </div>
    <template v-else>
      <div class="vc-search-bar__sheet-head">
        <VcButton
          class="vc-search-bar__sheet-clear"
          variant="ghost"
          :disabled="!active"
          @click="clearAll"
        >
          {{ $t(`${PH}CLEAR`) }}
        </VcButton>
        <span class="vc-search-bar__sheet-title">
          {{ $t(`${K}FILTERS`) }}
          <span
            v-if="active"
            class="vc-search-bar__sheet-count"
            >{{ active }}</span
          >
        </span>
        <VcButton
          ref="closeBtn"
          class="vc-search-bar__sheet-done"
          variant="ghost"
          @click="emit('close')"
        >
          {{ $t(`${PH}DONE`) }}
        </VcButton>
      </div>
      <div class="vc-search-bar__sheet-views">
        <div
          :id="viewsLabelId"
          class="vc-search-bar__panel-section"
        >
          {{ $t(`${PH}VIEW`) }}
        </div>
        <div
          class="vc-search-bar__view-chips"
          role="group"
          :aria-labelledby="viewsLabelId"
        >
          <VcButton
            v-for="v in views.all.value"
            :key="v.id"
            class="vc-search-bar__view-chip"
            :class="{ 'vc-search-bar__view-chip--current': v.id === views.current.value.id }"
            :variant="v.id === views.current.value.id ? 'primary' : 'secondary'"
            :icon="v.id === views.current.value.id ? 'lucide-check' : undefined"
            :aria-pressed="v.id === views.current.value.id"
            @click="views.select(v.id)"
          >
            {{ v.name }}<template v-if="v.id === views.current.value.id && views.modified.value">*</template>
          </VcButton>
        </div>
        <div ref="unsaved">
          <UnsavedViewRow
            :views="views"
            touch
          />
        </div>
      </div>
    </template>

    <div class="vc-search-bar__panel-body">
      <template v-if="toggles.length">
        <div class="vc-search-bar__panel-section">{{ $t(`${K}PANEL.TOGGLES`) }}</div>
        <div
          v-for="f in toggles"
          :key="f.id"
          class="vc-search-bar__toggle"
        >
          <VcSwitch
            :model-value="isSet(f.id)"
            :aria-label="f.label"
            @update:model-value="setToggle(f.id, $event)"
          />
          <span
            class="vc-search-bar__toggle-label"
            aria-hidden="true"
            @click="setToggle(f.id, !isSet(f.id))"
            >{{ f.label }}</span
          >
          <span
            v-if="toggleCount(f.id) !== undefined"
            class="vc-search-bar__toggle-count"
            >{{ toggleCount(f.id) }}</span
          >
        </div>
      </template>
      <FieldAccordion
        v-if="others.length"
        :fields="others"
        :state="state"
        :counts="counts"
        :initially-open="firstOpen"
        @set="(id, v) => emit('set', id, v)"
        @clear-field="emit('clear-field', $event)"
      />
    </div>

    <template v-if="!touch">
      <div
        ref="unsaved"
        class="vc-search-bar__panel-unsaved"
      >
        <UnsavedViewRow :views="views" />
      </div>
      <div class="vc-search-bar__panel-foot">
        <span class="vc-search-bar__panel-status">
          <template v-if="resultCount !== undefined">
            <strong>{{ resultCount }}</strong> {{ $t(`${K}PANEL.RESULTS`, resultCount) }}
          </template>
          <template v-else>{{ $t(`${K}PANEL.APPLIED`) }}</template>
        </span>
        <VcButton
          class="vc-search-bar__panel-clear"
          variant="outline"
          size="sm"
          :disabled="!active"
          @click="clearAll"
        >
          {{ $t(`${K}PANEL.CLEAR`) }}
        </VcButton>
      </div>
    </template>
    <div
      v-else
      class="vc-search-bar__sheet-foot"
    >
      <VcButton
        class="vc-search-bar__sheet-show"
        @click="emit('close')"
      >
        <template v-if="resultCount === undefined">{{ $t(`${PH}SHOW_ANY`) }}</template>
        <template v-else-if="resultCount === 0">{{ $t(`${PH}NO_MATCH`) }}</template>
        <template v-else>{{ $t(`${PH}SHOW`, { count: resultCount }, resultCount) }}</template>
      </VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch, type ComponentPublicInstance } from "vue";
import { VcButton } from "@ui/components/atoms";
import { VcSwitch } from "@ui/components/molecules";
import type { BarField } from "../lib/fields";
import { isEmptyValue } from "../lib/values";
import type { SearchBarState, SearchBarValue } from "../types";
import type { ViewsApi } from "../composables/useViews";
import FieldAccordion from "./FieldAccordion.vue";
import UnsavedViewRow from "./UnsavedViewRow.vue";

defineOptions({ name: "FiltersPanel" });

const props = defineProps<{
  fields: BarField[];
  state: SearchBarState;
  views: ViewsApi;
  /** Results per option value, per field id; a toggle's count is under `true` */
  counts?: Record<string, Record<string, number>>;
  /** Results of the current filters, shown in the footer (the sheet's "Show N results") */
  resultCount?: number;
  /** Phone sheet: Clear / Done header, view chips, bigger rows and a "Show N results" footer */
  touch?: boolean;
  /** Field ids in the order they were applied; the first one starts expanded */
  order?: string[];
}>();
const emit = defineEmits<{
  set: [id: string, value: SearchBarValue];
  "clear-field": [id: string];
  "clear-all": [];
  close: [];
}>();

const K = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.";
const PH = `${K}PHONE.`;
const viewsLabelId = `vc-search-bar-views-${useId()}`;

const isSet = (id: string) => !isEmptyValue(props.state.values[id]);
const toggles = computed(() => props.fields.filter((f) => f.kind === "toggle"));
const others = computed(() => props.fields.filter((f) => f.kind !== "toggle"));
const active = computed(() => props.fields.filter((f) => isSet(f.id)).length);
// Read once: the accordion keeps its own open rows afterwards
const firstOpen =
  (props.order ?? []).find((id) => isSet(id) && others.value.some((f) => f.id === id)) ??
  (others.value.find((f) => isSet(f.id)) ?? others.value[0])?.id;

const toggleCount = (id: string) => props.counts?.[id]?.true;
const setToggle = (id: string, on: unknown) => (on ? emit("set", id, true) : emit("clear-field", id));

const closeBtn = ref<ComponentPublicInstance>();
const unsaved = ref<HTMLElement>();
const focusClose = () => void nextTick(() => (closeBtn.value?.$el as HTMLElement | undefined)?.focus());

// Save, Save as and revert remove the unsaved row, and the focus with it
watch(
  () => props.views.modified.value,
  (now, was) => {
    if (was && !now && unsaved.value?.contains(document.activeElement)) focusClose();
  },
);

// The button turns disabled under the focus
function clearAll() {
  emit("clear-all");
  focusClose();
}
</script>

<style lang="scss">
.vc-search-bar {
  &__panel {
    @apply tw-flex tw-flex-col tw-min-h-0;
  }
  &__panel-head {
    @apply tw-flex tw-items-center tw-justify-between tw-shrink-0 tw-px-3;
    height: 44px;
    border-bottom: 1px solid var(--neutrals-200);
  }
  &__panel-title {
    @apply tw-font-semibold;
    font-size: 14px;
    color: var(--neutrals-900);
  }
  &__panel-active {
    @apply tw-font-normal;
    color: var(--neutrals-500);
    &::before {
      content: " · ";
    }
  }
  &__panel-close {
    --button-ghost-text-color: var(--neutrals-500);
  }
  // the head, the unsaved row and the footer stay in view; the body takes what is left
  &__panel-body {
    @apply tw-flex-auto tw-min-h-0 tw-overflow-y-auto tw-py-1;
  }
  &__panel-section {
    @apply tw-uppercase tw-font-semibold tw-px-3 tw-pt-2 tw-pb-1;
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--neutrals-400);
  }
  &__toggle {
    @apply tw-flex tw-items-center tw-gap-2 tw-px-3;
    min-height: 36px;
    font-size: 13px;
  }
  &__toggle-label {
    @apply tw-flex-1 tw-truncate tw-cursor-pointer;
    color: var(--neutrals-900);
  }
  &__toggle-count {
    @apply tw-tabular-nums;
    font-size: 12px;
    color: var(--neutrals-500);
  }
  &__panel-unsaved:not(:empty) {
    @apply tw-px-3;
    border-top: 1px solid var(--neutrals-200);
  }
  &__panel-foot {
    @apply tw-flex tw-items-center tw-justify-between tw-gap-2 tw-shrink-0 tw-px-3;
    height: 48px;
    border-top: 1px solid var(--neutrals-200);
  }
  &__panel-status {
    font-size: 12.5px;
    color: var(--neutrals-600);
    strong {
      @apply tw-font-semibold;
      color: var(--neutrals-900);
    }
  }
  // the sheet's header, views and footer stay put; the body scrolls between them
  &__panel--touch {
    @apply tw-flex-1;
    .vc-search-bar__panel-body {
      @apply tw-flex-1;
    }
    .vc-search-bar__toggle,
    .vc-search-bar__acc-row {
      min-height: 48px;
    }
  }
  &__sheet-head {
    @apply tw-relative tw-flex tw-items-center tw-justify-between tw-shrink-0 tw-px-2;
    height: 48px;
  }
  &__sheet-clear,
  &__sheet-done {
    --button-default-padding-hor: 8px;
    --button-default-height: 40px;
  }
  &__sheet-clear {
    --button-ghost-text-color: var(--neutrals-600);
  }
  &__sheet-done {
    --button-ghost-text-color: var(--primary-700);
  }
  &__sheet-title {
    @apply tw-absolute tw-inline-flex tw-items-center tw-gap-1.5 tw-font-semibold tw-pointer-events-none;
    left: 50%;
    transform: translateX(-50%);
    font-size: 15px;
    color: var(--neutrals-900);
  }
  &__sheet-count {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-rounded-full tw-px-1.5;
    min-width: 20px;
    height: 20px;
    background: var(--primary-600);
    color: var(--additional-50);
    font-size: 11px;
  }
  &__sheet-views {
    @apply tw-shrink-0 tw-pb-1;
    border-bottom: 1px solid var(--neutrals-200);
    .vc-search-bar__unsaved {
      @apply tw-px-3;
    }
  }
  &__view-chips {
    @apply tw-flex tw-gap-2 tw-overflow-x-auto tw-px-3 tw-py-1;
    scrollbar-width: none;
  }
  // pills; the current view is a solid primary-600 one
  &__view-chip {
    --button-default-padding-hor: 14px;
    --button-border-radius: 9999px;
    @apply tw-shrink-0;
  }
  &__view-chip--current {
    --button-primary-background-color: var(--primary-600);
    --button-primary-border-color: var(--primary-600);
  }
  &__sheet-foot {
    @apply tw-shrink-0 tw-p-3;
    border-top: 1px solid var(--neutrals-200);
    // over the button's own size: its height comes from the size variable
    .vc-search-bar__sheet-show {
      --button-default-height: 48px;
      @apply tw-w-full;
      border-radius: 16px;
    }
  }
}
</style>
