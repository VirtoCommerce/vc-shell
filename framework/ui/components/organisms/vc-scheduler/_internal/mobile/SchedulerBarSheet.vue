<template>
  <div
    v-if="open"
    class="vc-scheduler__sheet-backdrop"
    @click.self="emit('close')"
  >
    <div
      class="vc-scheduler__sheet"
      role="dialog"
      aria-modal="true"
    >
      <h3 class="vc-scheduler__sheet-title">{{ modelBar?.label ?? "Period" }}</h3>
      <VcDatePicker
        v-model="range"
        :date-picker-options="{ range: true }"
        class="vc-scheduler__sheet-picker"
      />
      <div class="vc-scheduler__sheet-actions">
        <VcButton
          v-if="modelBar"
          text
          data-test="delete"
          @click="emit('delete', { id: modelBar.id })"
        >
          {{ $t?.("DELETE") ?? "Delete" }}
        </VcButton>
        <VcButton
          data-test="save"
          @click="onSave"
          >{{ $t?.("SAVE") ?? "Save" }}</VcButton
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { VcDatePicker } from "@ui/components/molecules/vc-date-picker";
import { VcButton } from "@ui/components/atoms/vc-button";
import type { ISchedulerBar, IBarUpdate } from "../../types";

const props = defineProps<{ modelBar: ISchedulerBar | null; open: boolean }>();
const emit = defineEmits<{
  (e: "save", u: IBarUpdate): void;
  (e: "delete", p: { id: string }): void;
  (e: "close"): void;
}>();

const range = ref<[Date, Date] | null>(null);
watch(
  () => props.modelBar,
  (b) => {
    range.value = b ? [new Date(b.start), new Date(b.end)] : null;
  },
  { immediate: true },
);

function onSave() {
  if (!props.modelBar || !range.value) return;
  emit("save", { id: props.modelBar.id, start: range.value[0], end: range.value[1] });
  emit("close");
}
</script>

<style lang="scss">
.vc-scheduler__sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-critical-modal);
  background: rgb(0 0 0 / 40%);
  display: flex;
  align-items: flex-end;
}
.vc-scheduler__sheet {
  width: 100%;
  background: var(--additional-50, #fff);
  border-radius: 1rem 1rem 0 0;
  padding: 1rem;
  animation: vc-scheduler-sheet-up 200ms ease-out;
}
.vc-scheduler__sheet-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
@keyframes vc-scheduler-sheet-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .vc-scheduler__sheet {
    animation: none;
  }
}
</style>
