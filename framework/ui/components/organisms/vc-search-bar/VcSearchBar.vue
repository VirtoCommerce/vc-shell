<template>
  <div
    ref="root"
    class="vc-search-bar"
    :class="{ 'vc-search-bar--mobile': isMobile }"
  >
    <SearchField
      v-if="searchable && searchAbove"
      v-bind="searchProps"
      full
      @update:model-value="onSearchInput"
    />
    <div
      v-if="!searchAbove || hasFilterRow || showTray"
      ref="row"
      class="vc-search-bar__row"
      :class="
        isMobile
          ? 'vc-search-bar__row--phone'
          : {
              'vc-search-bar__row--clip': true,
              'vc-search-bar__row--clipped': clipped && !unfolded,
              'vc-search-bar__row--open': unfolded,
            }
      "
      @pointerenter="onPointerEnter"
      @pointerleave="onPointerLeave"
      @focusin="onFocusIn"
      @focusout="onFocusOut"
    >
      <SearchField
        v-if="searchable && !searchAbove"
        v-bind="searchProps"
        :collapsed="isMobile ? (collapseSearch ?? hasExtras()) : searchCollapsed"
        :full="isMobile"
        @update:model-value="onSearchInput"
        @open-change="searchOpen = $event"
      />
      <div
        v-if="hasFilterRow"
        ref="scroller"
        class="vc-search-bar__filters"
        :class="
          isMobile && {
            'vc-search-bar__filters--scroll': true,
            'vc-search-bar__filters--fade-l': fadeL,
            'vc-search-bar__filters--fade-r': fadeR,
            'vc-search-bar__filters--hidden': searchOpen,
          }
        "
        @scroll.passive="updateFades"
      >
        <FilterRow
          :fields="rowFields"
          :state="state"
          :query-label="queryLabel"
          :open-id="openId"
          :presets="presetApi"
          :show-save="!isMobile"
          :builder-button="!!(builder || advanced)"
          :query-editable="!!advanced"
          :panel-open="panelOpen"
          :can-add="canAdd"
          :disabled="disabled"
          @open="openEditor"
          @remove="removeFilter"
          @toggle="(id: string) => (isSet(id) ? clearValue(id) : setValue(id, true))"
          @add="toggleAdd"
          @clear="clearEverything"
          @remove-query="setQuery(undefined)"
          @edit="togglePanelFrom"
        />
      </div>
      <PhonePresets
        v-if="showTray && isMobile"
        :class="{ 'vc-search-bar__phone-tray--hidden': searchOpen }"
        :presets="presetApi"
        :disabled="disabled"
      />
      <template v-if="!isMobile">
        <span class="vc-search-bar__spacer" />
        <PresetTray
          v-if="showTray"
          :presets="presetApi"
          :disabled="disabled"
          @menu-change="trayMenuOpen = $event"
          @vue:unmounted="trayMenuOpen = false"
        />
      </template>
    </div>

    <FilterPanel
      v-if="panelOpen"
      :fields="fields"
      :state="state"
      :builder="!!builder"
      :advanced="!!advanced"
      :anchor="editBtn"
      @apply="applyPanel"
      @close="closePanel"
    />

    <MenuHost
      v-if="hostOpen"
      :sheet="isMobile"
      :anchor="anchor"
      :title="openField?.label ?? $t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.MOBILE.ADD')"
      :close-on-outside="false"
      @close="closeEditor(true)"
    >
      <div
        v-if="openField"
        class="vc-search-bar__editor"
      >
        <PillEditor
          :field="openField"
          :value="state.values[openField.id]"
          @update:value="onEditorValue"
        />
        <VcButton
          v-if="isMobile"
          class="vc-search-bar__done"
          @click="closeEditor(true)"
        >
          {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.MOBILE.DONE") }}
        </VcButton>
      </div>
      <div
        v-else
        class="vc-search-bar__menu"
      >
        <button
          v-for="f in addable"
          :key="f.id"
          type="button"
          class="vc-search-bar__menu-item"
          @click="pickAdd(f)"
        >
          <VcIcon
            icon="lucide-plus"
            size="xs"
          />{{ f.label }}
        </button>
      </div>
    </MenuHost>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { useI18n } from "vue-i18n";
import { VcButton, VcIcon } from "@ui/components/atoms";
import { useResponsive } from "@framework/core/composables/useResponsive";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { TableQueryStateKey } from "@core/blade-navigation/table-query-state";
import type { SearchBarChange, SearchBarField, SearchBarPreset, SearchBarState, SearchBarValue } from "./types";
import { useSearchBarState } from "./composables/useSearchBarState";
import { isEmptyValue } from "./lib/values";
import PillEditor from "./components/PillEditor.vue";
import FilterPanel from "./components/FilterPanel.vue";
import PresetTray from "./components/PresetTray.vue";
import PhonePresets from "./components/PhonePresets.vue";
import SearchField from "./components/SearchField.vue";
import FilterRow from "./components/FilterRow.vue";
import "./phone-row.scss";
import MenuHost from "./components/MenuHost.vue";
import { usePresets } from "./composables/usePresets";
import { useSearchInput } from "./composables/useSearchInput";
import { useBarLayout } from "./composables/useBarLayout";
import { useRowReveal } from "./composables/useRowReveal";
import { useBarMenus } from "./composables/useBarMenus";
import { useFilterPanel } from "./composables/useFilterPanel";
import { useScrollFades } from "./composables/useScrollFades";
import { useSaveFocus } from "./composables/useSaveFocus";

defineOptions({ name: "VcSearchBar" });

const props = withDefaults(
  defineProps<{
    modelValue?: SearchBarState;
    fields?: SearchBarField[];
    placeholder?: string;
    /** Delay before the typed search reaches the state and `change` */
    searchDebounce?: number;
    /** Key of the saved presets (localStorage) and of the applied filters in the blade URL (`<key>_filters`) */
    storageKey?: string;
    presets?: SearchBarPreset[];
    builder?: boolean;
    advanced?: boolean;
    /** Registry target of external filters; defaults to the blade's name */
    name?: string;
    /** Controlled search text; an outside change updates the input and state without `change` or `search` */
    search?: string;
    searchable?: boolean;
    disabled?: boolean;
    /** Hide the search behind a button. Default: automatic, hidden in a narrow bar or on a phone */
    collapseSearch?: boolean;
  }>(),
  { fields: () => [], searchDebounce: 300, searchable: true, collapseSearch: undefined },
);

const emit = defineEmits<{
  "update:modelValue": [value: SearchBarState];
  change: [value: SearchBarChange];
  /** Every keystroke, undebounced */
  "update:search": [value: string];
  /** The debounced search */
  search: [value: string];
}>();

const { t } = useI18n({ useScope: "global" });
const { isMobile } = useResponsive();
const descriptor = inject(BladeDescriptorKey, undefined);
const queryState = inject(TableQueryStateKey, undefined);

const model = computed<SearchBarState | undefined>({
  get: () => props.modelValue,
  set: (v) => v && emit("update:modelValue", v),
});

const {
  state,
  visibleFields,
  fields,
  externalPresets,
  setSearch,
  flushSearch,
  setValue,
  clearValue,
  clearAll,
  applyState,
  setQuery,
} = useSearchBarState({
  fields: () => props.fields,
  target: () => props.name ?? descriptor?.value?.name,
  storageKey: () => props.storageKey,
  queryState,
  model,
  search: () => props.search,
  takePendingSearch: () => takePendingSearch(),
  onChange: (c) => emit("change", c),
});

const root = ref<HTMLElement>();
const presetApi = usePresets({
  storageKey: () => props.storageKey,
  modulePresets: () => [...(props.presets ?? []), ...externalPresets.value],
  fields: () => fields.value,
  state,
  apply: applyState,
  flushSearch,
  t,
});
useSaveFocus(presetApi, root);
// A preset holds field values, so without fields an empty storable tray would offer nothing
const showTray = computed(
  () =>
    (presetApi.canStore.value && fields.value.length > 0) ||
    presetApi.all.value.length > 0 ||
    presetApi.hiddenCount.value > 0,
);

const {
  searchText,
  input: onSearchInput,
  clear: clearSearch,
  takePending: takePendingSearch,
} = useSearchInput({
  state,
  setSearch,
  search: () => props.search,
  debounce: () => props.searchDebounce,
  onInput: (v) => emit("update:search", v),
  onSearch: (v) => emit("search", v),
});

function clearEverything() {
  clearSearch();
  closeEditor();
  clearAll();
}

const QUERY_LABEL_MAX = 40;
const queryLabel = computed(() => {
  const q = state.value.query ?? "";
  return q.length > QUERY_LABEL_MAX ? `${q.slice(0, QUERY_LABEL_MAX)}…` : q;
});
const isSet = (id: string) => !isEmptyValue(state.value.values[id]);

// Layout: one row; a narrow bar shows only set pills and hides the search behind a button
const row = ref<HTMLElement>();
const hasFilterRow = computed(
  () => !!(fields.value.length || state.value.query || presetApi.canSave.value || props.builder || props.advanced),
);
const hasExtras = () => fields.value.length > 0 || showTray.value || !!(props.builder || props.advanced);
const { narrow, searchCollapsed } = useBarLayout({
  el: root,
  isMobile,
  collapseSearch: () => props.collapseSearch,
  hasExtras,
});
const searchProps = computed(() => ({
  modelValue: searchText.value,
  placeholder: props.placeholder,
  disabled: props.disabled,
}));
// Phone: the search is a button in the row (with text it starts open), or with collapseSearch false a row of its own
const searchAbove = computed(() => isMobile.value && props.collapseSearch === false);
// an open phone search takes the whole row; desktop ignores it
const searchOpen = ref(false);
const scroller = ref<HTMLElement>();
const { fadeL, fadeR, update: updateFades } = useScrollFades(scroller);

// Row pills, field editor and "+ Filter" list
const { openId, anchor, addOpen, rowFields, openField, addable, canAdd, hostOpen, ...menus } = useBarMenus({
  fields: () => fields.value,
  visibleFields: () => visibleFields.value,
  narrow: () => narrow.value,
  isSet,
  setToggle: (id) => setValue(id, true),
  focusFallback: (id) =>
    [...(row.value?.querySelectorAll<HTMLElement>("[data-field-id]") ?? [])].find((el) => el.dataset.fieldId === id) ??
    row.value,
});
const { openEditor, closeEditor, toggleAdd, pickAdd } = menus;
const trayMenuOpen = ref(false);
const { panelOpen, editBtn, togglePanelFrom, closePanel, applyPanel } = useFilterPanel({
  state,
  closeEditor,
  flushSearch,
  applyState,
});
const { clipped, unfolded, onPointerEnter, onPointerLeave, onFocusIn, onFocusOut } = useRowReveal({
  row,
  enabled: () => !isMobile.value,
  keepOpen: () => !!openId.value || addOpen.value || panelOpen.value || presetApi.saving.value || trayMenuOpen.value,
  ignoreFocus: (t) => !!t.closest(".vc-search-bar__search"),
});

// an editor can commit on blur after it closed, so the field comes with the value
const onEditorValue = (v: SearchBarValue | undefined, id: string) =>
  isEmptyValue(v) ? clearValue(id) : setValue(id, v);

function removeFilter(id: string) {
  if (openId.value === id) closeEditor();
  clearValue(id);
}
</script>

<style lang="scss">
.vc-search-bar {
  @apply tw-flex tw-flex-col tw-gap-2 tw-w-full;

  // desktop: one 46px line; the row is lifted out of the flow so it can unfold over the table
  &:not(&--mobile) {
    @apply tw-relative tw-block;
    height: 46px;
  }
  &__row {
    @apply tw-flex tw-flex-nowrap tw-items-center tw-gap-1.5 tw-min-w-0;

    // the padding keeps focus rings inside the clip
    &--clip {
      @apply tw-absolute tw-overflow-hidden;
      top: 0;
      left: -4px;
      right: -4px;
      height: 46px;
      padding-inline: 4px;
    }
    &--clip .vc-search-bar__filter-row {
      @apply tw-flex-nowrap tw-shrink-0;
    }
    // cut: faded at the right edge
    &--clipped {
      mask-image: linear-gradient(to right, #000 calc(100% - 56px), transparent);
    }
    // unfolded: the same row, wrapped, floating over the table
    &--open {
      @apply tw-flex-wrap tw-overflow-visible tw-rounded-md;
      // above the sticky table header; the row's own popovers are teleported over it
      z-index: var(--z-overlay-dropdown);
      left: -12px;
      right: -12px;
      height: auto;
      min-height: 46px;
      padding: 7px 12px;
      background: var(--neutrals-50);
      box-shadow:
        0 0 0 1px var(--neutrals-200),
        0 8px 24px rgb(0 0 0 / 12%);
      transition: box-shadow 0.2s;
    }
    // the pills wrap one by one beside the search, not as one block under it
    &--open .vc-search-bar__filter-row {
      display: contents;
    }
  }
  &__spacer {
    @apply tw-flex-1;
  }
  &__pill {
    @apply tw-inline-flex tw-items-center tw-gap-1 tw-rounded-md tw-text-xs tw-whitespace-nowrap tw-shrink-0;
    height: 28px;
    border: 1px dashed var(--neutrals-400);
    color: var(--neutrals-700);
    padding-inline: 8px;

    &--set {
      border-style: solid;
      border-color: var(--primary-300, var(--primary-500));
      background: var(--primary-50);
      color: var(--primary-800, var(--primary-700));
    }
    &--open {
      outline: 2px solid var(--primary-200, var(--primary-300));
    }
    &:has(.vc-search-bar__pill-x) {
      padding-inline-end: 2px;
    }
  }
  &__pill-main {
    @apply tw-inline-flex tw-items-center tw-gap-1 tw-h-full;
    b {
      @apply tw-font-semibold;
    }
  }
  &__pill-x {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-rounded;
    width: 24px;
    height: 24px;
    &:hover {
      background: var(--primary-100);
    }
  }
  &__clear,
  &__save {
    @apply tw-inline-flex tw-items-center tw-gap-1 tw-shrink-0 tw-text-xs tw-whitespace-nowrap;
    height: 28px;
    color: var(--primary-600, var(--primary-500));
    margin-inline-start: 18px; // + 6px pills gap = 24px between actions
  }
  &__clear {
    // 16px each side of the divider; the pills gap adds 6px on the left
    margin-inline-start: 10px;
    padding-inline-start: 16px;
    border-inline-start: 1px solid var(--neutrals-200);
  }
  &__editor {
    @apply tw-flex tw-flex-col tw-gap-2 tw-p-3;
  }
  &__done {
    @apply tw-w-full;
  }
  &__menu {
    @apply tw-flex tw-flex-col tw-p-1;
  }
  &__menu-item {
    @apply tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-left tw-rounded tw-px-2 tw-py-1.5;
    &:hover {
      background: var(--neutrals-100);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .vc-search-bar__row--open {
    transition: none;
  }
}
</style>
