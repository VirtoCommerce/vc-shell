<template>
  <component
    :is="host"
    v-bind="hostProps"
    @update:model-value="!$event && emit('close', 'dismiss')"
    @update:show="!$event && emit('close', 'dismiss')"
  >
    <div
      ref="panelRef"
      class="vc-search-bar__panel"
      :class="{ 'vc-search-bar__panel--mobile': isMobile }"
    >
      <div
        v-if="advanced"
        class="vc-search-bar__tabs"
      >
        <div
          v-if="builder"
          class="vc-search-bar__tablist"
          role="tablist"
        >
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            role="tab"
            class="vc-search-bar__tab"
            :class="{ 'vc-search-bar__tab--on': tab === t.id }"
            :aria-selected="tab === t.id"
            :disabled="t.id === 'conditions' && !readable"
            @click="selectTab(t.id)"
          >
            {{ $t(t.label) }}
          </button>
        </div>
        <button
          v-if="tab === 'advanced'"
          type="button"
          class="vc-search-bar__syntax"
          :aria-expanded="showHelp"
          @click="showHelp = !showHelp"
        >
          <VcIcon
            icon="lucide-circle-help"
            size="xs"
          />
          {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.ADVANCED.SYNTAX") }}
        </button>
      </div>

      <div class="vc-search-bar__panel-body">
        <template v-if="showConditions">
          <p
            v-if="!rows.length"
            class="vc-search-bar__hint"
          >
            {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.EMPTY") }}
          </p>
          <ConditionRow
            v-for="(f, i) in rows"
            :key="f.id"
            :field="f"
            :value="draft[f.id]"
            :first="i === 0"
            @update:value="setDraft(f.id, $event)"
            @remove="removeRow(f.id)"
          />
          <div
            class="vc-search-bar__addwrap"
            @keydown.esc="onAddEsc"
          >
            <VcDropdown
              v-model="addOpen"
              :items="unused"
              :item-key="(f: BarField) => f.id"
              floating
              teleport
              placement="bottom-start"
              :max-height="192"
              :z-index="ADD_LIST_Z"
              :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.ADD')"
              close-on-select
              @item-click="addRow"
              @close="onAddClose"
            >
              <template #trigger="{ isActive, toggle, panelId }">
                <button
                  ref="addBtn"
                  type="button"
                  class="vc-search-bar__add"
                  :disabled="!unused.length"
                  aria-haspopup="menu"
                  :aria-expanded="isActive"
                  :aria-controls="isActive ? panelId : undefined"
                  @click="toggle"
                >
                  <VcIcon
                    icon="lucide-plus"
                    size="xs"
                  />
                  {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.ADD") }}
                </button>
              </template>
              <template #item="{ item }">
                <span class="vc-search-bar__add-item">{{ item.label }}</span>
              </template>
            </VcDropdown>
          </div>
        </template>
        <AdvancedTab
          v-else
          v-model="text"
          :fields="fields"
          :parsed="parsed"
          :show-help="showHelp"
        />
      </div>

      <div class="vc-search-bar__panel-foot">
        <button
          type="button"
          class="vc-search-bar__panel-clear"
          @click="clearDraft"
        >
          {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.CLEAR_ALL") }}
        </button>
        <VcButton
          size="sm"
          variant="outline"
          @click="emit('close', 'cancel')"
        >
          {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.CANCEL") }}
        </VcButton>
        <VcButton
          size="sm"
          @click="apply"
        >
          {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.APPLY") }}
        </VcButton>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, type Component } from "vue";
import { onClickOutside } from "@vueuse/core";
import { VcButton, VcIcon } from "@ui/components/atoms";
import { VcDropdown, VcPopover, type DropdownCloseReason } from "@ui/components/molecules";
import { VcSidebar } from "@ui/components/organisms/vc-sidebar";
import { useResponsive } from "@framework/core/composables/useResponsive";
import { useI18n } from "vue-i18n";
import type { BarField } from "../lib/fields";
import { cloneValue, isEmptyValue } from "../lib/values";
import type { SearchBarState, SearchBarValue } from "../types";
import { phraseToState, stateToPhrase } from "../phrase/convert";
import AdvancedTab from "./AdvancedTab.vue";
import ConditionRow from "./ConditionRow.vue";

const props = defineProps<{
  fields: BarField[];
  state: SearchBarState;
  builder: boolean;
  advanced: boolean;
  anchor?: HTMLElement | null;
}>();
/** `outside` is the only close that must not pull focus back to the opener */
export type FilterPanelCloseReason = "cancel" | "apply" | "dismiss" | "outside";
const emit = defineEmits<{ apply: [state: SearchBarState]; close: [reason: FilterPanelCloseReason] }>();

const { t } = useI18n({ useScope: "global" });
const { isMobile } = useResponsive();

const PANEL_WIDTH = "min(640px, calc(100vw - 32px))";
// --z-critical-tooltip: the list is teleported ahead of the panel in the DOM, so an equal z-index would put it under
const ADD_LIST_Z = 9400;
const title = computed(() => t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.TITLE"));
const host = computed<Component>(() => (isMobile.value ? VcSidebar : VcPopover));
const hostProps = computed<Record<string, unknown>>(() =>
  isMobile.value
    ? {
        modelValue: true,
        position: "bottom",
        size: "sm",
        draggable: true,
        dragHandle: true,
        closeButton: false,
        inset: false,
        title: title.value,
      }
    : {
        show: true,
        anchorRef: props.anchor ?? null,
        title: title.value,
        closeOnClickOutside: false,
        // Equal min and max: the content never changes the panel's width
        width: PANEL_WIDTH,
        maxWidth: PANEL_WIDTH,
        maxHeight: 520,
      },
);

type Tab = "conditions" | "advanced";
const tabs: { id: Tab; label: string }[] = [
  { id: "conditions", label: "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.TAB_CONDITIONS" },
  { id: "advanced", label: "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.TAB_ADVANCED" },
];
// An applied query (or no constructor at all) opens straight on Advanced
const tab = ref<Tab>(props.state.query || !props.builder ? "advanced" : "conditions");
const showConditions = computed(() => props.builder && (!props.advanced || tab.value === "conditions"));

// The panel edits a copy; the bar keeps the applied state until Apply
const search = ref(props.state.search);
const draft = ref<Record<string, SearchBarValue>>(cloneValue(props.state.values));
const rowIds = ref<string[]>(props.fields.filter((f) => !isEmptyValue(draft.value[f.id])).map((f) => f.id));
const rows = computed(() =>
  rowIds.value.map((id) => props.fields.find((f) => f.id === id)).filter((f): f is BarField => !!f),
);
const unused = computed(() => props.fields.filter((f) => !rowIds.value.includes(f.id)));

function setDraft(id: string, v: SearchBarValue | undefined) {
  if (v === undefined) delete draft.value[id];
  else draft.value[id] = v;
}
function addRow(f: BarField) {
  rowIds.value.push(f.id);
  if (f.kind === "toggle") draft.value[f.id] = true;
}
function removeRow(id: string) {
  rowIds.value = rowIds.value.filter((x) => x !== id);
  delete draft.value[id];
}
function clearDraft() {
  rowIds.value = [];
  draft.value = {};
  text.value = "";
  if (tab.value === "advanced") search.value = "";
}

// Advanced: the same conditions as a phrase. Conditions -> Advanced writes the draft as text,
// Advanced -> Conditions reads it back, which is only possible while the text is readable.
const showHelp = ref(false);
const text = ref(props.state.query ?? stateToPhrase(props.fields, props.state));
const parsed = computed(() => phraseToState(text.value.trim(), props.fields));
// Only the Advanced text can make Conditions unavailable
const readable = computed(() => tab.value !== "advanced" || "state" in parsed.value);

function selectTab(next: Tab) {
  if (next === tab.value) return;
  if (next === "advanced") {
    text.value = stateToPhrase(props.fields, { search: search.value, values: draft.value });
  } else {
    const r = parsed.value;
    if (!("state" in r)) return;
    search.value = r.state.search;
    draft.value = cloneValue(r.state.values);
    rowIds.value = props.fields.filter((f) => !isEmptyValue(draft.value[f.id])).map((f) => f.id);
  }
  tab.value = next;
}
// Esc on the button with the list open closes only the list (the list handles Esc itself)
function onAddEsc(e: KeyboardEvent) {
  if (!addOpen.value) return;
  e.stopPropagation();
  addOpen.value = false;
  addBtn.value?.focus();
}
function onAddClose(reason: DropdownCloseReason) {
  if (reason !== "outside") nextTick(() => addBtn.value?.focus());
}
function apply() {
  if (props.advanced && tab.value === "advanced") {
    const r = parsed.value;
    // Unreadable text goes to the backend as is, as one "Query"
    emit("apply", "state" in r ? r.state : { search: "", values: {}, query: text.value.trim() });
    return;
  }
  const values: Record<string, SearchBarValue> = {};
  for (const f of props.fields) if (!isEmptyValue(draft.value[f.id])) values[f.id] = draft.value[f.id];
  emit("apply", { search: search.value, values });
}

// Select, date, add-condition and suggestion menus teleport to the body; a click in them is inside
const TELEPORTED = [
  ".vc-select__dropdown",
  ".dp__menu",
  ".dp__outer_menu_wrap",
  ".dp--menu-wrapper",
  ".vc-dropdown__dropdown",
  ".vc-search-bar__suggest",
];
const addOpen = ref(false);
const addBtn = ref<HTMLElement>();
const panelRef = ref<HTMLElement>();
onClickOutside(
  panelRef,
  () => {
    if (!isMobile.value) emit("close", "outside");
  },
  {
    ignore: [
      ...TELEPORTED,
      ".vc-popover",
      ".vc-search-bar__constructor-btn",
      ".vc-search-bar__pill--query .vc-search-bar__pill-main",
    ],
  },
);
</script>

<style lang="scss">
.vc-search-bar {
  &__panel {
    @apply tw-flex tw-flex-col;
  }
  &__tablist {
    @apply tw-flex tw-gap-1;
  }
  &__syntax {
    @apply tw-ms-auto tw-inline-flex tw-items-center tw-gap-1 tw-text-xs;
    color: var(--primary-700);
  }
  &__tabs {
    @apply tw-flex tw-items-center tw-gap-1 tw-px-3 tw-sticky tw-top-0;
    border-bottom: 1px solid var(--neutrals-200);
    background: var(--additional-50, #fff);
  }
  &__tab {
    @apply tw-px-3 tw-py-2 tw-text-sm;
    color: var(--neutrals-600);
    border-bottom: 2px solid transparent;
    &--on {
      color: var(--primary-700);
      border-bottom-color: var(--primary-500);
    }
    &:disabled {
      opacity: 0.5;
    }
  }
  &__panel-body {
    @apply tw-flex tw-flex-col tw-gap-2 tw-p-3 tw-overflow-y-auto;
  }
  &__crow {
    @apply tw-grid tw-items-center tw-gap-2;
    grid-template-columns: 3rem 7rem 8rem minmax(0, 1fr) 24px;
    &:hover .vc-search-bar__crow-x,
    &:focus-within .vc-search-bar__crow-x {
      opacity: 1;
    }
  }
  // Phone: line 1 is conj + field + operator + remove, the value takes line 2
  &__panel--mobile &__crow {
    grid-template-columns: auto minmax(0, 6rem) minmax(0, 1fr) 24px;
    row-gap: 0.25rem;
  }
  &__panel--mobile &__crow-val {
    grid-column: 1 / -1;
    grid-row: 2;
  }
  &__panel--mobile &__crow-val--stack {
    @apply tw-flex-col tw-items-stretch;
  }
  &__panel--mobile &__crow-x {
    grid-column: 4;
    grid-row: 1;
  }
  &__crow-conj,
  &__crow-field,
  &__op-text {
    @apply tw-text-sm tw-truncate;
    color: var(--neutrals-600);
  }
  &__crow-field {
    color: var(--neutrals-900);
    font-weight: 500;
  }
  &__crow-op,
  &__crow-val {
    @apply tw-min-w-0;
  }
  &__crow-val {
    @apply tw-flex tw-items-center tw-gap-2;
    > * {
      @apply tw-min-w-0 tw-flex-1;
    }
  }
  &__crow-x {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-rounded;
    width: 24px;
    height: 24px;
    opacity: 0.35;
    &:hover {
      background: var(--neutrals-100);
    }
  }
  &__addwrap {
    @apply tw-flex tw-items-start;
  }
  &__add {
    @apply tw-inline-flex tw-items-center tw-gap-1 tw-text-sm;
    color: var(--primary-700);
    &:disabled {
      opacity: 0.5;
    }
  }
  &__add-item {
    @apply tw-block tw-truncate tw-text-sm tw-px-1;
    min-width: 10rem;
    max-width: 16rem;
  }
  &__panel-foot {
    @apply tw-flex tw-items-center tw-gap-2 tw-p-3 tw-sticky tw-bottom-0;
    border-top: 1px solid var(--neutrals-200);
    background: var(--additional-50, #fff);
  }
  &__panel-clear {
    @apply tw-me-auto tw-text-xs;
    color: var(--primary-600, var(--primary-500));
  }
}

// VcDropdown defines its surface variables on its root, which the teleported list leaves behind
.vc-dropdown__dropdown:has(.vc-search-bar__add-item) {
  --vc-dropdown-bg: var(--additional-50);
  --vc-dropdown-text: var(--neutrals-950);
  --vc-dropdown-border: var(--neutrals-200);
  --vc-dropdown-accent: var(--neutrals-100);
  --vc-dropdown-accent-foreground: var(--neutrals-900);

  .vc-dropdown__item {
    @apply tw-cursor-pointer;
  }
}
</style>
