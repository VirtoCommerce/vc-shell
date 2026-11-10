<template>
  <button
    v-if="field.kind === 'toggle'"
    ref="root"
    type="button"
    class="vc-search-bar__pill vc-search-bar__pill--toggle"
    :class="{ 'vc-search-bar__pill--set': set }"
    :aria-pressed="set"
    :disabled="disabled"
    @click="emit('toggle')"
  >
    <VcIcon
      :icon="set ? 'lucide-square-check' : 'lucide-square'"
      size="xs"
    />
    {{ field.label }}
  </button>
  <span
    v-else
    ref="root"
    class="vc-search-bar__pill"
    :class="{ 'vc-search-bar__pill--set': set, 'vc-search-bar__pill--open': open }"
  >
    <button
      type="button"
      class="vc-search-bar__pill-main"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :disabled="disabled"
      @click="emit('open', root as HTMLElement)"
    >
      <span v-if="!set">{{ field.label }}</span>
      <span v-else>
        <b>{{ field.label }}:</b> {{ summary }}
      </span>
      <VcIcon
        icon="lucide-chevron-down"
        size="xs"
      />
    </button>
    <button
      v-if="set"
      type="button"
      class="vc-search-bar__pill-x"
      :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.REMOVE_FILTER', { label: field.label })"
      :disabled="disabled"
      @click="emit('remove')"
    >
      <VcIcon
        icon="lucide-x"
        size="xs"
      />
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { VcIcon } from "@ui/components/atoms";
import type { BarField } from "../lib/fields";
import { isEmptyValue, isNot, pillLabel } from "../lib/values";
import type { SearchBarValue } from "../types";

const props = defineProps<{ field: BarField; value: SearchBarValue; open?: boolean; disabled?: boolean }>();
const emit = defineEmits<{ open: [anchor: HTMLElement]; remove: []; toggle: [] }>();
const { t } = useI18n({ useScope: "global" });

const root = ref<HTMLElement>();
const set = computed(() => !isEmptyValue(props.value));
const not = computed(() => isNot(props.value));
const summary = computed(() => {
  if (!set.value) return "";
  const label = pillLabel(props.field, props.value, t);
  return not.value ? `${t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.OPERATOR.NOT")} ${label}` : label;
});
</script>
