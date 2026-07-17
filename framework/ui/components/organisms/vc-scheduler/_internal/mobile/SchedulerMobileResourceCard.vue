<template>
  <div class="vc-scheduler-mobile-card vc-scheduler-mobile-card--mobile">
    <button
      class="vc-scheduler-mobile-card__header"
      @click="isOpen = !isOpen"
    >
      <span>{{ resource.label }}</span>
      <span class="vc-scheduler-mobile-card__count">{{ bars.length }}</span>
    </button>
    <div
      v-if="isOpen"
      class="vc-scheduler-mobile-card__body"
    >
      <div
        v-for="b in bars"
        :key="b.id"
        class="vc-scheduler-mobile-card__period"
        @click="emit('bar-tap', b)"
      >
        <div class="vc-scheduler-mobile-card__period-head">
          <span class="vc-scheduler-mobile-card__label">{{ b.label }}</span>
          <span
            class="vc-scheduler-mobile-card__chip"
            :class="statusClass(b)"
          >
            {{ format(b.start, "d MMM") }} – {{ format(b.end, "d MMM") }}
          </span>
        </div>
        <div class="vc-scheduler-mobile-card__minibar-track">
          <div
            class="vc-scheduler-mobile-card__minibar"
            :style="miniStyle(b)"
          />
        </div>
      </div>
      <VcButton
        text
        size="sm"
        @click="emit('create', { resourceId: resource.id })"
        >+</VcButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { format } from "date-fns";
import { VcButton } from "@ui/components/atoms/vc-button";
import type { ISchedulerResource, ISchedulerBar } from "../../types";

const props = defineProps<{ resource: ISchedulerResource; bars: ISchedulerBar[]; expanded?: boolean }>();
const emit = defineEmits<{
  (e: "bar-tap", bar: ISchedulerBar): void;
  (e: "create", p: { resourceId: string }): void;
}>();

const isOpen = ref(props.expanded ?? false);

const bounds = computed(() => {
  if (props.bars.length === 0) return { min: 0, max: 1 };
  const min = Math.min(...props.bars.map((b) => b.start.getTime()));
  const max = Math.max(...props.bars.map((b) => b.end.getTime()));
  return { min, max: max === min ? min + 1 : max };
});

function miniStyle(b: ISchedulerBar) {
  const { min, max } = bounds.value;
  const span = max - min;
  const left = ((b.start.getTime() - min) / span) * 100;
  const width = ((b.end.getTime() - b.start.getTime()) / span) * 100;
  return { left: `${left}%`, width: `${Math.max(width, 2)}%`, background: b.color ?? "var(--primary-500)" };
}

function statusClass(b: ISchedulerBar) {
  const now = Date.now();
  if (b.end.getTime() < now) return "vc-scheduler-mobile-card__chip--past";
  if (b.start.getTime() > now) return "vc-scheduler-mobile-card__chip--future";
  return "vc-scheduler-mobile-card__chip--active";
}
</script>

<style lang="scss">
.vc-scheduler-mobile-card {
  border-bottom: 1px solid var(--neutrals-200);
}
.vc-scheduler-mobile-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.875rem 1rem;
  font-weight: 600;
  background: var(--neutrals-50);
}
.vc-scheduler-mobile-card__count {
  min-width: 1.5rem;
  text-align: center;
  border-radius: 999px;
  background: var(--neutrals-200);
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
}
.vc-scheduler-mobile-card__period {
  padding: 0.75rem 1rem;
  cursor: pointer;
}
.vc-scheduler-mobile-card__period-head {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
.vc-scheduler-mobile-card__chip {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  white-space: nowrap;
  &--active {
    background: var(--success-100, var(--accent-100));
    color: var(--success-700, var(--accent-700));
  }
  &--past {
    background: var(--neutrals-100);
    color: var(--neutrals-600);
  }
  &--future {
    background: var(--primary-100);
    color: var(--primary-700);
  }
}
.vc-scheduler-mobile-card__minibar-track {
  position: relative;
  height: 6px;
  margin-top: 0.5rem;
  border-radius: 3px;
  background: var(--neutrals-100);
}
.vc-scheduler-mobile-card__minibar {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 3px;
}
</style>
