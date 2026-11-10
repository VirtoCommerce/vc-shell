<template>
  <div
    class="vc-search-bar__filter-row"
    role="group"
    :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.FILTERS')"
  >
    <SearchBarPill
      v-for="f in fields"
      :key="f.id"
      :data-field-id="f.id"
      :field="f"
      :value="state.values[f.id]"
      :open="openId === f.id"
      :disabled="disabled"
      @toggle="emit('toggle', f.id)"
      @open="emit('open', f.id, $event)"
      @remove="emit('remove', f.id)"
    />
    <span
      v-if="state.query"
      class="vc-search-bar__pill vc-search-bar__pill--set vc-search-bar__pill--query"
    >
      <button
        v-if="queryEditable"
        type="button"
        class="vc-search-bar__pill-main"
        aria-haspopup="dialog"
        :aria-expanded="panelOpen"
        :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.ADVANCED.PILL_OPEN', { text: queryLabel })"
        :disabled="disabled"
        @click="emit('edit', $event.currentTarget as HTMLElement)"
      >
        {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.ADVANCED.PILL", { text: queryLabel }) }}
      </button>
      <span
        v-else
        class="vc-search-bar__pill-main"
        >{{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.ADVANCED.PILL", { text: queryLabel }) }}</span
      >
      <button
        type="button"
        class="vc-search-bar__pill-x"
        :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.ADVANCED.PILL_REMOVE')"
        :disabled="disabled"
        @click="emit('remove-query')"
      >
        <VcIcon
          icon="lucide-x"
          size="xs"
        />
      </button>
    </span>
    <button
      v-if="canAdd"
      type="button"
      class="vc-search-bar__pill vc-search-bar__pill--add"
      :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.MOBILE.ADD')"
      :disabled="disabled"
      @click="emit('add', $event.currentTarget as HTMLElement)"
    >
      + {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.ADD_FILTER") }}
    </button>
    <button
      v-if="hasValues"
      type="button"
      class="vc-search-bar__clear"
      :disabled="disabled"
      @click="emit('clear')"
    >
      {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.CLEAR_ALL") }}
    </button>
    <template v-if="showSave && presets.canSave.value">
      <PresetSaveInline
        v-if="presets.saving.value"
        :presets="presets"
      />
      <!-- stays mounted while saving, so focus can come back to it -->
      <button
        v-show="!presets.saving.value"
        type="button"
        class="vc-search-bar__save"
        :disabled="disabled"
        @click="presets.startSave()"
      >
        <VcIcon
          icon="lucide-bookmark-plus"
          size="xs"
        />
        {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.SAVE_AS") }}
      </button>
    </template>
    <button
      v-if="builderButton"
      type="button"
      class="vc-search-bar__constructor-btn"
      :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.TITLE')"
      :title="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.TITLE')"
      aria-haspopup="dialog"
      :aria-expanded="panelOpen"
      :disabled="disabled"
      @click="emit('edit', $event.currentTarget as HTMLElement)"
    >
      <VcIcon
        icon="lucide-sliders-horizontal"
        size="s"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcIcon } from "@ui/components/atoms";
import type { SearchBarState } from "../types";
import type { BarField } from "../lib/fields";
import type { PresetsApi } from "../composables/usePresets";
import { isEmptyValue } from "../lib/values";
import SearchBarPill from "./SearchBarPill.vue";
import PresetSaveInline from "./PresetSaveInline.vue";

const props = defineProps<{
  fields: BarField[];
  state: SearchBarState;
  queryLabel: string;
  openId?: string;
  presets: PresetsApi;
  showSave: boolean;
  builderButton: boolean;
  /** The Query pill opens the panel (Advanced only) */
  queryEditable: boolean;
  panelOpen: boolean;
  canAdd: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  open: [id: string, anchor: HTMLElement];
  remove: [id: string];
  toggle: [id: string];
  add: [anchor: HTMLElement];
  clear: [];
  "remove-query": [];
  edit: [anchor: HTMLElement];
}>();

const hasValues = computed(
  () => !!props.state.query || Object.values(props.state.values).some((v) => !isEmptyValue(v)),
);
</script>

<style lang="scss">
.vc-search-bar {
  &__filter-row {
    @apply tw-flex tw-flex-wrap tw-items-center tw-gap-[6px] tw-min-w-0;
  }
  &__constructor-btn {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-shrink-0;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    border: 1px solid var(--neutrals-300);
    color: var(--neutrals-700);
    background: var(--additional-50);

    &:hover:not(:disabled) {
      border-color: var(--primary-500);
    }
    &:disabled {
      @apply tw-opacity-50 tw-cursor-not-allowed;
    }
  }
}
</style>
