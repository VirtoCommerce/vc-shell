<template>
  <div
    class="vc-scheduler__skeleton"
    role="status"
    aria-busy="true"
    :aria-label="$t('VC_SCHEDULER.LOADING')"
  >
    <!-- Month: weekday header + 6x7 cell grid with a few placeholder bars -->
    <template v-if="view === 'month'">
      <div class="vc-scheduler__sk-weekhead">
        <div
          v-for="i in 7"
          :key="`wh-${i}`"
          class="vc-scheduler__sk-weekhead-cell"
        >
          <VcSkeleton
            variant="block"
            width="1.75rem"
            height="0.625rem"
          />
        </div>
      </div>
      <div class="vc-scheduler__sk-grid">
        <div
          v-for="cell in 42"
          :key="`c-${cell}`"
          class="vc-scheduler__sk-cell"
        >
          <VcSkeleton
            variant="block"
            width="1rem"
            height="0.625rem"
          />
          <VcSkeleton
            v-if="hasBar(cell)"
            variant="block"
            width="90%"
            height="1rem"
          />
        </div>
      </div>
    </template>

    <!-- Timeline: hour gutter + day columns with a couple of placeholder blocks -->
    <template v-else-if="view === 'timeline'">
      <div class="vc-scheduler__sk-tg-head">
        <div class="vc-scheduler__sk-tg-gutter" />
        <div
          v-for="d in 7"
          :key="`th-${d}`"
          class="vc-scheduler__sk-tg-headcol"
        >
          <VcSkeleton
            variant="block"
            width="2.5rem"
            height="0.625rem"
          />
        </div>
      </div>
      <div class="vc-scheduler__sk-tg-body">
        <div class="vc-scheduler__sk-tg-gutter">
          <VcSkeleton
            v-for="h in 8"
            :key="`hl-${h}`"
            variant="block"
            width="1.75rem"
            height="0.5rem"
          />
        </div>
        <div
          v-for="d in 7"
          :key="`tc-${d}`"
          class="vc-scheduler__sk-tg-col"
        >
          <VcSkeleton
            v-if="d % 2 === 1"
            variant="block"
            width="88%"
            height="2.5rem"
          />
        </div>
      </div>
    </template>

    <!-- Agenda (mobile): a few day groups, each a header + rows -->
    <template v-else>
      <div
        v-for="g in 4"
        :key="`ag-${g}`"
        class="vc-scheduler__sk-agenda-day"
      >
        <VcSkeleton
          variant="block"
          width="6rem"
          height="0.75rem"
        />
        <div
          v-for="r in 2"
          :key="`agr-${g}-${r}`"
          class="vc-scheduler__sk-agenda-row"
        >
          <VcSkeleton
            variant="circle"
            width="0.5rem"
            height="0.5rem"
          />
          <VcSkeleton
            variant="block"
            width="60%"
            height="0.75rem"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";

defineProps<{
  /** Which view's layout to mimic while loading. */
  view: "month" | "timeline" | "agenda";
}>();

// Deterministic scatter of placeholder bars across month cells (no randomness so the
// skeleton is stable across renders/snapshots).
const BAR_CELLS = new Set([2, 3, 9, 15, 16, 22, 28, 30, 31, 37]);
const hasBar = (cell: number) => BAR_CELLS.has(cell);
</script>

<style lang="scss">
.vc-scheduler__skeleton {
  --scheduler-border-color: var(--neutrals-200);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

// -- Month --
.vc-scheduler__sk-weekhead {
  display: flex;
  flex: none;
  border-bottom: 1px solid var(--scheduler-border-color);
}
.vc-scheduler__sk-weekhead-cell {
  flex: 1 1 0;
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}
.vc-scheduler__sk-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 1fr;
  flex: 1 1 auto;
  min-height: 0;
}
.vc-scheduler__sk-cell {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-height: 3.5rem;
  padding: 0.375rem;
  border-right: 1px solid var(--scheduler-border-color);
  border-bottom: 1px solid var(--scheduler-border-color);
}

// -- Timeline --
.vc-scheduler__sk-tg-head {
  display: flex;
  flex: none;
  border-bottom: 1px solid var(--scheduler-border-color);
}
.vc-scheduler__sk-tg-gutter {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  flex: none;
  width: 3.5rem;
  padding: 0.5rem 0.375rem;
  border-right: 1px solid var(--scheduler-border-color);
}
.vc-scheduler__sk-tg-headcol {
  flex: 1 1 0;
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
  border-left: 1px solid var(--scheduler-border-color);
}
.vc-scheduler__sk-tg-body {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
.vc-scheduler__sk-tg-col {
  flex: 1 1 0;
  padding: 0.5rem 0.375rem;
  border-left: 1px solid var(--scheduler-border-color);
}

// -- Agenda --
.vc-scheduler__sk-agenda-day {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--scheduler-border-color);
}
.vc-scheduler__sk-agenda-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
