<!-- The Filters panel. `touch` renders only the body, for the phone sheet that brings its own header and footer -->
<template>
  <div
    class="vc-search-bar__panel"
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
      <button
        ref="closeBtn"
        type="button"
        class="vc-search-bar__panel-close"
        :aria-label="$t('COMPONENTS.CONTROLS.CLOSE')"
        @click="emit('close')"
      >
        <VcIcon
          icon="lucide-x"
          :custom-size="16"
        />
      </button>
    </div>

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
            <strong>{{ resultCount }}</strong> {{ $t(`${K}PANEL.RESULTS`, { count: resultCount }) }}
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
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { VcButton, VcIcon } from "@ui/components/atoms";
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
  /** Results of the current filters, shown in the footer */
  resultCount?: number;
  /** Phone sheet: the body only, with bigger rows */
  touch?: boolean;
}>();
const emit = defineEmits<{
  set: [id: string, value: SearchBarValue];
  "clear-field": [id: string];
  "clear-all": [];
  close: [];
}>();

const K = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.";

const isSet = (id: string) => !isEmptyValue(props.state.values[id]);
const toggles = computed(() => props.fields.filter((f) => f.kind === "toggle"));
const others = computed(() => props.fields.filter((f) => f.kind !== "toggle"));
const active = computed(() => props.fields.filter((f) => isSet(f.id)).length);
// Read once: the accordion keeps its own open rows afterwards
const firstOpen = (others.value.find((f) => isSet(f.id)) ?? others.value[0])?.id;

const toggleCount = (id: string) => props.counts?.[id]?.true;
const setToggle = (id: string, on: unknown) => (on ? emit("set", id, true) : emit("clear-field", id));

const closeBtn = ref<HTMLButtonElement>();
const unsaved = ref<HTMLElement>();
const focusClose = () => void nextTick(() => closeBtn.value?.focus());

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
    @apply tw-inline-flex tw-items-center tw-justify-center tw-rounded-md;
    width: 28px;
    height: 28px;
    color: var(--neutrals-500);
    &:hover {
      background: var(--neutrals-100);
      color: var(--neutrals-800);
    }
  }
  &__panel-body {
    @apply tw-overflow-y-auto tw-py-1;
    max-height: min(480px, calc(100vh - 240px));
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
  &__panel--touch {
    .vc-search-bar__panel-body {
      max-height: none;
    }
    .vc-search-bar__toggle,
    .vc-search-bar__acc-row {
      min-height: 48px;
    }
  }
}
</style>
