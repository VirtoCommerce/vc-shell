<template>
  <div class="vc-search-bar__acc">
    <template
      v-for="f in fields"
      :key="f.id"
    >
      <!-- a toggle has nothing to expand: the row shows it and its remove button -->
      <div
        v-if="f.kind === 'toggle'"
        class="vc-search-bar__acc-item vc-search-bar__acc-static"
      >
        <span class="vc-search-bar__acc-label">{{ f.label }}</span>
        <VcButton
          v-if="isSet(f.id)"
          class="vc-search-bar__acc-clear"
          variant="ghost"
          size="icon-sm"
          icon="lucide-x"
          :aria-label="$t(`${K}REMOVE_FILTER`, { label: f.label })"
          @click="emit('clear-field', f.id)"
        />
      </div>
      <!-- one open at a time; the editor mounts on open and unmounts once the body has closed -->
      <VcAccordionItem
        v-else
        class="vc-search-bar__acc-item"
        :class="{ 'vc-search-bar__acc-item--set': isSet(f.id) }"
        :is-expanded="isOpen(f.id)"
        :max-expanded-height="256"
        icon-position="start"
        lazy
        @toggle="flip(f.id, $event)"
      >
        <template #title>
          <span class="vc-search-bar__acc-title">
            <span class="vc-search-bar__acc-label">{{ f.label }}</span>
            <span
              class="vc-search-bar__acc-value"
              :class="{ 'vc-search-bar__acc-value--set': isSet(f.id) }"
              :title="isSet(f.id) ? summary(f).title : undefined"
              >{{ isSet(f.id) ? summary(f).text : $t(`${K}PANEL.ANY`) }}</span
            >
          </span>
        </template>
        <template
          v-if="isSet(f.id)"
          #actions
        >
          <VcButton
            class="vc-search-bar__acc-clear"
            variant="ghost"
            size="icon-sm"
            icon="lucide-x"
            :aria-label="$t(`${K}REMOVE_FILTER`, { label: f.label })"
            @click="emit('clear-field', f.id)"
          />
        </template>
        <div class="vc-search-bar__acc-body">
          <PillEditor
            :field="f"
            :value="state.values[f.id]"
            :counts="counts?.[f.id]"
            @update:value="onValue"
          />
        </div>
      </VcAccordionItem>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { VcButton } from "@ui/components/atoms";
import { VcAccordionItem } from "@ui/components/molecules";
import type { BarField } from "../lib/fields";
import { chipLabel, isEmptyValue } from "../lib/values";
import type { SearchBarState, SearchBarValue } from "../types";
import PillEditor from "./PillEditor.vue";

defineOptions({ name: "FieldAccordion" });

const props = defineProps<{
  fields: BarField[];
  state: SearchBarState;
  /** Results per option value, per field id */
  counts?: Record<string, Record<string, number>>;
  /** Id of the field expanded on mount */
  initiallyOpen?: string;
}>();
const emit = defineEmits<{ set: [id: string, value: SearchBarValue]; "clear-field": [id: string] }>();

const K = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.";
const { t, locale } = useI18n({ useScope: "global" });

// One field open at a time: opening another closes it, clicking the open one closes it
const open = ref<string | undefined>(props.initiallyOpen);
const isOpen = (id: string) => open.value === id;
const flip = (id: string, expanded: boolean) => {
  if (expanded) open.value = id;
  else if (open.value === id) open.value = undefined;
};

const isSet = (id: string) => !isEmptyValue(props.state.values[id]);
const summary = (f: BarField) => chipLabel(f, props.state.values[f.id], t, locale?.value);

const onValue = (v: SearchBarValue | undefined, id: string) =>
  isEmptyValue(v) ? emit("clear-field", id) : emit("set", id, v);
</script>

<style lang="scss">
.vc-search-bar__acc {
  @apply tw-flex tw-flex-col;
  // the bar's 13px rows; the open body on a grey ground, the closing and the opening one move together
  --accordion-item-border-radius: 0;
  --accordion-item-header-padding: 10px 12px 10px 10px;
  --accordion-item-header-background: transparent;
  --accordion-item-header-background-hover: var(--neutrals-50);
  --accordion-item-header-color: var(--neutrals-900);
  --accordion-item-header-font-size: 13px;
  --accordion-item-icon-margin-left: 6px;
  --accordion-item-icon-color: var(--neutrals-500);
  --accordion-item-content-padding: 8px 12px;
  --accordion-item-content-background: var(--neutrals-50);
  --accordion-item-content-font-size: 13px;
  --accordion-item-transition-duration: 200ms;

  > .vc-search-bar__acc-item + .vc-search-bar__acc-item {
    border-top: 1px solid var(--neutrals-100);
  }
  // the value sits close to its remove button
  > .vc-search-bar__acc-item--set {
    --accordion-item-header-padding: 10px 8px 10px 10px;
  }
}

.vc-search-bar {
  &__acc-title {
    @apply tw-flex tw-items-center tw-gap-2 tw-min-w-0;
  }
  &__acc-label {
    @apply tw-shrink-0;
  }
  &__acc-value {
    @apply tw-ms-auto tw-truncate tw-font-normal;
    max-width: 60%;
    font-size: 12.5px;
    color: var(--neutrals-400);
  }
  &__acc-value--set {
    color: var(--primary-700);
  }
  &__acc-clear {
    --button-ghost-text-color: var(--neutrals-500);
    @apply tw-shrink-0 tw-me-2;
  }
  // a toggle's row: the header's text and height, no chevron
  &__acc-static {
    @apply tw-flex tw-items-center tw-gap-2 tw-font-medium;
    min-height: 40px;
    padding-inline: 34px 0;
    font-size: 13px;
    color: var(--neutrals-900);

    .vc-search-bar__acc-label {
      @apply tw-flex-1 tw-truncate;
    }
  }
}
</style>
