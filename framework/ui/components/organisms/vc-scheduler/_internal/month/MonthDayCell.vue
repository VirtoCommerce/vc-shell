<template>
  <div
    class="vc-scheduler__day-cell"
    :class="{
      'vc-scheduler__day-cell--out-month': !inMonth,
      'vc-scheduler__day-cell--today': isToday,
      'vc-scheduler__day-cell--weekend': isWeekend,
    }"
    role="gridcell"
    :aria-label="ariaLabel"
    tabindex="-1"
    @pointerdown="emit('cell-pointerdown', $event)"
  >
    <div class="vc-scheduler__day-badge">{{ dayNum }}</div>
    <div class="vc-scheduler__day-content"><slot /></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { format } from "date-fns";
const props = defineProps<{ date: Date; inMonth: boolean; isToday: boolean; isWeekend: boolean }>();
const emit = defineEmits<{ (e: "cell-pointerdown", ev: PointerEvent): void }>();
const dayNum = computed(() => format(props.date, "d"));
const ariaLabel = computed(() => format(props.date, "PPPP"));
</script>

<style lang="scss">
.vc-scheduler__day-cell {
  position: relative;
  // Floor only: week rows flex to fill the grid height, so cells grow past this
  // in a normal-height host. Kept low enough that 6 rows fit a constrained host
  // without spilling into a vertical scrollbar.
  min-height: 5rem;
  padding: 0.25rem;
  border-right: 1px solid var(--scheduler-border-color, var(--neutrals-300));
  border-bottom: 1px solid var(--scheduler-border-color, var(--neutrals-300));
  background: var(--additional-50, #fff);
  // Rapid single/double clicks on the empty cell drive create-intent disambiguation;
  // prevent the day number from being selected as text in the process.
  user-select: none;
  &--out-month {
    background: var(--neutrals-50);
    // neutrals-500 (not -400): keeps adjacent-month days de-emphasized while clearing
    // WCAG AA on the neutrals-50 fill (-400 measured 2.42:1).
    color: var(--neutrals-500);
  }
  &--weekend {
    background: var(--neutrals-50);
  }
}
.vc-scheduler__day-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  font-size: 0.8125rem;
  border-radius: 999px;
}
.vc-scheduler__day-cell--today .vc-scheduler__day-badge {
  background: var(--accent-500);
  color: #fff;
}
.vc-scheduler__day-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 0.125rem;
  // Reserve the same height as the abs-positioned week-lanes overlay (multi-day
  // bars) so timed chips / "+N more" render below it instead of underneath it.
  // Vars are defined on the ancestor .vc-scheduler__week-row; fallbacks match
  // MonthWeekRow's defaults so this also degrades sanely if rendered standalone.
  padding-top: calc(
    var(--scheduler-month-max-lanes, 3) *
      (var(--scheduler-month-lane-height, 1.375rem) + var(--scheduler-month-lane-gap, 2px))
  );
}
</style>
