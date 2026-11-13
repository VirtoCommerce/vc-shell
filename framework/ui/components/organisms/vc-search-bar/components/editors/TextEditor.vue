<template>
  <div
    class="vc-search-bar-editor"
    @keydown.enter.prevent="commit"
  >
    <VcInput
      v-model="draft"
      size="small"
      clearable
      :aria-label="field.label"
      :placeholder="field.source.placeholder ?? field.label"
      @blur="commit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { VcInput } from "@ui/components/molecules";
import type { BarField } from "../../lib/fields";
import type { SearchBarValue } from "../../types";

const props = defineProps<{ field: BarField; value: SearchBarValue }>();
const emit = defineEmits<{ "update:value": [value: SearchBarValue | undefined] }>();

const asText = (v: unknown) => (typeof v === "string" ? v : "");
const draft = ref(asText(props.value));
watch(
  () => props.value,
  (v) => {
    if (asText(v) !== draft.value.trim()) draft.value = asText(v);
  },
);

function commit() {
  const text = String(draft.value ?? "").trim();
  if (text === asText(props.value)) return;
  emit("update:value", text || undefined);
}
</script>
