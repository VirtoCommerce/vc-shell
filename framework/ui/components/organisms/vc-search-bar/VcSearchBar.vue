<template>
  <div
    ref="root"
    class="vc-search-bar"
    :class="{ 'vc-search-bar--mobile': isMobile }"
  >
    <div class="vc-search-bar__row">
      <ViewSelector
        v-if="showRowSelector"
        :views="views"
        :counts="viewCounts"
        :disabled="disabled"
      />
      <div
        ref="main"
        class="vc-search-bar__main"
      >
        <SearchInput
          v-if="searchable"
          ref="searchInput"
          :model-value="searchText"
          :fields="fields"
          :values="state.values"
          :placeholder="placeholder"
          :disabled="disabled"
          :hide-hint="isMobile"
          @update:model-value="input"
          @chip="onTypedChip"
          @backspace-empty="removeLast"
        />
        <template v-if="chipsInRow && chipFields.length">
          <span
            class="vc-search-bar__divider"
            aria-hidden="true"
          />
          <FilterChip
            v-for="f in shownChips"
            :key="f.id"
            :field="f"
            :value="state.values[f.id]"
            :open="openId === f.id"
            :disabled="disabled"
            @open="openEditor(f.id, $event)"
            @remove="removeFilter(f.id)"
          />
          <VcButton
            v-if="hiddenChips.length"
            class="vc-search-bar__more"
            :class="{ 'vc-search-bar__more--open': list === 'overflow' }"
            variant="tonal"
            size="2xs"
            :selected="list === 'overflow'"
            :aria-pressed="undefined"
            aria-haspopup="dialog"
            :aria-expanded="list === 'overflow'"
            :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.MORE_FILTERS', { count: hiddenChips.length })"
            :disabled="disabled"
            @click="openList('overflow', $event.currentTarget as HTMLElement)"
          >
            +{{ hiddenChips.length }}
          </VcButton>
        </template>
        <FiltersButton
          v-if="fields.length"
          :count="chipFields.length"
          :mode="buttonMode"
          :names="names"
          :open="list === 'filters'"
          :disabled="disabled"
          @open="openList('filters', $event)"
          @clear="clearFilters"
        />
      </div>
    </div>
    <PhoneSummary
      v-if="isMobile"
      :result-count="resultCount"
      :unfiltered-count="unfilteredCount"
      :filtered="chipFields.length > 0 || !!state.search"
      :filter-count="chipFields.length"
      :view-name="
        views.current.value.scope === 'system' && !views.modified.value ? undefined : views.current.value.name
      "
      :modified="views.modified.value"
      :disabled="disabled"
      @clear="clearFilters"
    />

    <!-- every chip and the Filters button, measured to decide how many chips fit -->
    <div
      v-if="chipsInRow && chipFields.length"
      ref="measure"
      class="vc-search-bar__measure"
      aria-hidden="true"
      inert
    >
      <FilterChip
        v-for="f in chipFields"
        :key="f.id"
        data-chip
        :field="f"
        :value="state.values[f.id]"
      />
      <FiltersButton
        data-fixed
        :count="chipFields.length"
        mode="wide"
      />
    </div>

    <!-- one menu at a time; the hosts stay mounted and animate on their own open flag -->
    <component
      :is="menuHost"
      v-bind="menuProps"
      @update:model-value="!$event && closeEditor(true)"
      @update:show="!$event && closeEditor(true)"
    >
      <div
        v-if="shown.field"
        class="vc-search-bar__editor"
      >
        <PillEditor
          :field="shown.field"
          :value="state.values[shown.field.id]"
          :counts="counts?.[shown.field.id]"
          @update:value="onEditorValue"
        />
      </div>
      <FieldAccordion
        v-else-if="shown.list === 'overflow'"
        :fields="hiddenChips"
        :state="state"
        :counts="counts"
        :initially-open="hiddenChips[0]?.id"
        @set="setValue"
        @clear-field="clearValue"
      />
      <FiltersPanel
        v-else
        :fields="fields"
        :state="state"
        :views="views"
        :counts="counts"
        :result-count="resultCount"
        :order="order"
        :touch="isMobile"
        @set="setValue"
        @clear-field="clearValue"
        @clear-all="views.clearToSystem()"
        @close="closeEditor(true)"
      />
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, provide, ref, watch, type Component } from "vue";
import { useI18n } from "vue-i18n";
import { useResponsive } from "@framework/core/composables/useResponsive";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { BladeLoadingKey } from "@framework/injection-keys";
import { VcButton } from "@ui/components/atoms";
import { VcPopover } from "@ui/components/molecules";
import { VcSidebar } from "@ui/components/organisms/vc-sidebar";
import { TableQueryStateKey } from "@core/blade-navigation/table-query-state";
import type {
  SearchBarChange,
  SearchBarField,
  SearchBarMode,
  SearchBarState,
  SearchBarValue,
  SearchBarView,
} from "./types";
import { useSearchBarState } from "./composables/useSearchBarState";
import { isEmptyValue } from "./lib/values";
import PillEditor from "./components/PillEditor.vue";
import SearchInput from "./components/SearchInput.vue";
import FilterChip from "./components/FilterChip.vue";
import FiltersButton from "./components/FiltersButton.vue";
import FieldAccordion from "./components/FieldAccordion.vue";
import FiltersPanel from "./components/FiltersPanel.vue";
import ViewSelector from "./components/ViewSelector.vue";
import PhoneSummary from "./components/PhoneSummary.vue";
import { useBarMenus } from "./composables/useBarMenus";
import { useBarMode } from "./composables/useBarMode";
import { useChipOverflow } from "./composables/useChipOverflow";
import { useViews } from "./composables/useViews";
import { useBarViewSelector, useSlashFocus } from "./composables/useBarViewSelector";

defineOptions({ name: "VcSearchBar" });

const props = withDefaults(
  defineProps<{
    modelValue?: SearchBarState;
    fields?: SearchBarField[];
    placeholder?: string;
    /** Delay before the typed search reaches the state and `change` */
    searchDebounce?: number;
    /** Key of the saved views (localStorage) and of the applied filters and view in the blade URL (`<key>_filters`, `<key>_view`) */
    storageKey?: string;
    /** Views from code; one may be the `default` */
    views?: SearchBarView[];
    /** Registry target of external filters and views; defaults to the blade's name */
    name?: string;
    searchable?: boolean;
    disabled?: boolean;
    /** Wide bar: chips in the row (`inline`) or the applied field names on the Filters button (`summary`) */
    variant?: "inline" | "summary";
    /** Result count per option value, per field id */
    counts?: Record<string, Record<string, number>>;
    /** Result count per view id */
    viewCounts?: Record<string, number>;
    /** Result count of the current filters */
    resultCount?: number;
    /** Phone summary: rows without the bar's filters and search ("filtered from M") */
    unfilteredCount?: number;
  }>(),
  { fields: () => [], searchDebounce: 300, searchable: true, variant: "inline" },
);

const emit = defineEmits<{
  "update:modelValue": [value: SearchBarState];
  change: [value: SearchBarChange];
  /** Every keystroke, undebounced */
  "update:search": [value: string];
  /** The debounced search */
  search: [value: string];
  /** The bar's width mode, or "phone" on a phone */
  "update:mode": [mode: SearchBarMode];
}>();

const { t } = useI18n({ useScope: "global" });
const { isMobile } = useResponsive();
// The bar is chrome, not content: its buttons stay while the blade shows its first-load skeleton
provide(BladeLoadingKey, ref(false));
const descriptor = inject(BladeDescriptorKey, undefined);
const queryState = inject(TableQueryStateKey, undefined);

const model = computed<SearchBarState | undefined>({
  get: () => props.modelValue,
  set: (v) => v && emit("update:modelValue", v),
});

const { state, order, fields, externalViews, searchText, input, setValue, clearValue, applyValues } = useSearchBarState(
  {
    fields: () => props.fields,
    target: () => props.name ?? descriptor?.value?.name,
    storageKey: () => props.storageKey,
    queryState,
    model,
    debounce: () => props.searchDebounce,
    onInput: (v) => emit("update:search", v),
    onSearch: (v) => emit("search", v),
    onChange: (c) => emit("change", c),
  },
);

// A default view applied during setup reaches the table as the same deferred first @filter as
// filters restored from the URL
const views = useViews({
  storageKey: () => props.storageKey,
  moduleViews: () => [...(props.views ?? []), ...externalViews.value],
  fields: () => fields.value,
  state,
  apply: applyValues,
  queryState,
  t,
});

// The blade header shows the selector; a bar outside a blade (or second in one) shows it in its row.
// Phone views live in the filters sheet
const { inHeader } = useBarViewSelector({
  enabled: () => fields.value.length > 0 && !isMobile.value,
  views,
  counts: () => props.viewCounts,
  disabled: () => props.disabled,
});
const showRowSelector = computed(() => fields.value.length > 0 && !isMobile.value && !inHeader.value);

const searchInput = ref<InstanceType<typeof SearchInput>>();
useSlashFocus({
  enabled: () => props.searchable && !props.disabled,
  bladeId: () => descriptor?.value?.id,
  focus: () => searchInput.value?.focus(),
});

// Row layout by the bar's own width; chips only in a wide inline bar
const root = ref<HTMLElement>();
const main = ref<HTMLElement>();
const measure = ref<HTMLElement>();
// the mode by the bar's own width (padding included); the chip budget by the row's content width
const { mode } = useBarMode(root, "border-box");
const { width: mainWidth } = useBarMode(main);
const buttonMode = computed(() => (isMobile.value ? "narrow" : mode.value));
const chipsInRow = computed(() => !isMobile.value && mode.value === "wide" && props.variant === "inline");
// The host (the table) lays out its own actions by it
watch(
  () => (isMobile.value ? "phone" : mode.value),
  (m) => emit("update:mode", m),
  { immediate: true },
);

const chipFields = computed(() =>
  order.value.map((id) => fields.value.find((f) => f.id === id)).filter((f) => f !== undefined),
);
const { visibleCount } = useChipOverflow({
  measure,
  width: mainWidth,
  enabled: () => chipsInRow.value,
  keys: () => JSON.stringify(order.value.map((id) => [id, state.value.values[id]])),
});
const shownChips = computed(() => chipFields.value.slice(0, visibleCount.value));
const hiddenChips = computed(() => chipFields.value.slice(visibleCount.value));

const NAMES_SHOWN = 2;
const names = computed(() => {
  if (props.variant !== "summary") return undefined;
  const labels = chipFields.value.map((f) => f.label);
  const rest = labels.length - NAMES_SHOWN;
  return labels.slice(0, NAMES_SHOWN).join(", ") + (rest > 0 ? ` +${rest}` : "");
});

const { openId, anchor, list, hostOpen, shown, openEditor, openList, closeEditor } = useBarMenus({
  fields: () => fields.value,
});
const menuTitle = computed(() => {
  if (shown.value.field) return shown.value.field.label;
  if (shown.value.list === "overflow")
    return t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.MORE_FILTERS", { count: hiddenChips.value.length });
  // the panel has its own header, the phone sheet too
  return undefined;
});
const menuHost = computed<Component>(() => (isMobile.value ? VcSidebar : VcPopover));
// A chip's editor and "+N" open in a popover under their button; the Filters panel 360px wide at the
// end of the Filters button. A phone opens the Filters panel in a bottom sheet
const menuProps = computed<Record<string, unknown>>(() => {
  const open = hostOpen.value;
  const filters = shown.value.list === "filters" && !shown.value.field;
  const label = filters ? t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.FILTERS") : undefined;
  if (isMobile.value)
    return {
      modelValue: open,
      position: "bottom",
      // the Filters sheet takes its content's height, capped in the styles below
      height: filters ? "auto" : undefined,
      draggable: true,
      dragHandle: true,
      closeButton: false,
      inset: true,
      title: menuTitle.value,
      ariaLabel: label,
      panelClass: "vc-search-bar__sheet",
    };
  return {
    show: open,
    // a closing panel is still on screen for its fade; it takes no more clicks
    inert: !open,
    anchorRef: anchor.value,
    offset: 6,
    title: menuTitle.value,
    // the bar closes its menus on an outside click itself: a teleported date menu or select list counts as outside
    closeOnClickOutside: false,
    placement: filters ? "bottom-end" : "bottom-start",
    width: filters ? "360px" : "280px",
    maxWidth: "360px",
    // the panel scrolls its own body; the popover only caps the height to the room below the anchor
    ...(filters ? { contentScrollable: false, maxHeight: 640 } : {}),
    // a titled popover (a chip editor, "+N") is a dialog named by its title
    ...(label || menuTitle.value ? { role: "dialog", ariaLabel: label ?? menuTitle.value } : {}),
    panelClass: filters ? "vc-search-bar__popover vc-search-bar__popover--fit" : "vc-search-bar__popover",
  };
});

// A menu whose anchor left the row (the "+N" button once every chip fits, a chip in a narrower mode) closes
watch([mode, visibleCount, () => chipFields.value.length, isMobile], async () => {
  await nextTick();
  if (!hostOpen.value) return;
  if (anchor.value && !anchor.value.isConnected) closeEditor();
  else if (list.value === "overflow" && !hiddenChips.value.length) closeEditor();
});

// an editor can commit on blur after it closed, so the field comes with the value
const onEditorValue = (v: SearchBarValue | undefined, id: string) =>
  isEmptyValue(v) ? clearValue(id) : setValue(id, v);

function removeFilter(id: string) {
  if (openId.value === id) closeEditor();
  clearValue(id);
}

function removeLast() {
  const last = order.value[order.value.length - 1];
  if (last) removeFilter(last);
}

/** "Clear all" switches to the system view; the search stays */
function clearFilters() {
  closeEditor();
  views.clearToSystem();
}

function onTypedChip(c: { fieldId: string; value: unknown; rest: string }) {
  // the commit below carries the rest of the text in the same change
  input(c.rest);
  const field = fields.value.find((f) => f.id === c.fieldId);
  const prev = state.value.values[c.fieldId];
  const value =
    field?.kind === "multiselect" && Array.isArray(prev) && Array.isArray(c.value)
      ? [...new Set([...prev, ...c.value])]
      : c.value;
  setValue(c.fieldId, value);
}
</script>

<style lang="scss">
.vc-search-bar {
  @apply tw-relative tw-flex tw-flex-col tw-w-full;
  // the bar is ready to drop into any container; the table does not pad it
  padding: 8px 16px;

  &__row {
    @apply tw-flex tw-items-center tw-gap-1.5 tw-min-w-0;
    min-height: 36px;
  }
  &__main {
    @apply tw-flex tw-flex-1 tw-items-center tw-gap-1.5 tw-min-w-0;
  }
  &__divider {
    @apply tw-shrink-0;
    width: 1px;
    height: 20px;
    margin-inline: 2px;
    background: var(--neutrals-300);
  }
  &__more {
    @apply tw-shrink-0;
    min-width: 40px;
  }
  // zero-sized and clipped, so the chips inside keep their own width without widening any scroll area
  &__measure {
    @apply tw-absolute tw-flex tw-gap-1.5 tw-overflow-hidden tw-pointer-events-none;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    visibility: hidden;
  }
  &__editor {
    @apply tw-flex tw-flex-col tw-gap-2 tw-p-3;
  }
}

// The bar's buttons sit edge to edge (a chip and its ×, stacked menu rows): VcButton's 44px hit area would
// reach into the neighbour and take its clicks. Every button here is 24px or more on its own (WCAG 2.5.8)
:is(.vc-search-bar, .vc-search-bar__fit, .vc-search-bar__acc, .vc-search-bar__editor) .vc-button::after {
  content: none;
}
// the phone sheet's buttons stand apart: they keep the 44px touch target, except inside an attached group
.vc-search-bar__panel--touch .vc-button::after {
  content: "";
}
.vc-search-bar__panel--touch .vc-button-group--attached .vc-button::after {
  content: none;
}

// The bar's menus are teleported: their hosts carry the bar's class (panelClass)
.vc-popover.vc-search-bar__popover {
  --vc-popover-border-radius: 12px;
  --vc-popover-border-color: var(--neutrals-200);
  --vc-popover-shadow: 0 12px 32px -8px rgb(19 32 47 / 22%), 0 2px 6px rgb(19 32 47 / 6%);
  font-size: 13px;
}
// A fitted body fills the popover's capped height, so its own scroll area takes the overflow
.vc-search-bar__popover--fit > .vc-popover__content {
  @apply tw-flex tw-flex-col;
}
.vc-search-bar__fit {
  @apply tw-flex tw-flex-col tw-flex-auto tw-min-h-0;
}

// The phone sheet: a floating card with a short grabber, over a darker overlay
.vc-sidebar.vc-search-bar__sheet {
  --vc-sidebar-inset-gap: 8px;
  --vc-sidebar-radius: 28px;
  --vc-sidebar-shadow: 0 10px 50px rgb(11 20 32 / 28%);
  --vc-sidebar-overlay-color: rgb(11 20 32 / 40%);

  .vc-sidebar__panel {
    max-height: calc(100dvh - 56px);
  }
  .vc-sidebar__handle {
    @apply tw-pt-2 tw-pb-0;
  }
  .vc-sidebar__handle-bar {
    width: 36px;
    height: 5px;
  }
  .vc-sidebar-panel-bottom-enter-active,
  .vc-sidebar-panel-bottom-leave-active {
    transition-duration: 420ms;
  }
}

// a menu row: a ghost button laid out as a full-width, start-aligned line (menus are teleported: no bar ancestor)
.vc-button.vc-button-ghost.vc-search-bar__menu-row {
  --button-sm-padding-hor: 8px;
  @apply tw-w-full tw-min-w-0 tw-justify-start tw-text-start tw-font-normal;

  .vc-button__title {
    @apply tw-flex tw-flex-1 tw-items-center tw-gap-2 tw-min-w-0 tw-truncate;
  }
}
// the prototype's 13px rows: sm sets 12px with !important, so this matches it on specificity
.vc-button.vc-button-ghost.vc-button--sm.vc-search-bar__menu-row {
  font-size: 13px #{!important};

  // the title truncates: a 16px line box would clip the descenders of 13px text
  .vc-button__title {
    line-height: 20px;
  }
}
</style>
