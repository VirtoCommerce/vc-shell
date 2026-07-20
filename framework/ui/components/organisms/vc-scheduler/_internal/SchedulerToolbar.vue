<!-- framework/ui/components/organisms/vc-scheduler/_internal/SchedulerToolbar.vue -->
<template>
  <div class="vc-scheduler__toolbar">
    <span class="vc-scheduler__toolbar-title">{{ title }}</span>
    <div class="vc-scheduler__toolbar-right">
      <VcButton
        v-if="editable"
        variant="outline"
        size="xs"
        icon="lucide-plus"
        @click="emit('create')"
      >
        {{ $t("VC_SCHEDULER.NEW_EVENT") }}
      </VcButton>
      <VcButtonGroup
        attached
        role="group"
      >
        <VcButton
          variant="outline"
          size="xs"
          icon="lucide-chevron-left"
          :aria-label="$t('VC_SCHEDULER.PREVIOUS')"
          @click="emit('prev')"
        />
        <VcButton
          variant="outline"
          size="xs"
          :disabled="current"
          @click="emit('today')"
        >
          {{ $t("VC_SCHEDULER.TODAY") }}
        </VcButton>
        <VcButton
          variant="outline"
          size="xs"
          icon="lucide-chevron-right"
          :aria-label="$t('VC_SCHEDULER.NEXT')"
          @click="emit('next')"
        />
      </VcButtonGroup>
      <VcButtonGroup
        v-if="views.length > 1"
        attached
      >
        <VcButton
          v-for="v in views"
          :key="v.value"
          variant="outline"
          size="xs"
          :selected="v.value === view"
          @click="emit('update:view', v.value)"
        >
          {{ v.label }}
        </VcButton>
      </VcButtonGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcButton } from "@ui/components/atoms/vc-button";
import { VcButtonGroup } from "@ui/components/atoms/vc-button";
import type { SchedulerView } from "../types";

defineProps<{
  title: string;
  view: SchedulerView;
  views: { value: SchedulerView; label: string }[];
  editable: boolean;
  /** True when the focused period already contains today — disables the Today button. */
  current: boolean;
}>();

const emit = defineEmits<{
  (e: "prev"): void;
  (e: "next"): void;
  (e: "today"): void;
  (e: "create"): void;
  (e: "update:view", v: SchedulerView): void;
}>();
</script>

<style lang="scss">
.vc-scheduler__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  // Wrap on narrow widths so the view switcher never gets clipped off-screen
  // (title on the first line, nav + views drop to the next).
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--scheduler-border-color, var(--neutrals-300));
}
.vc-scheduler__toolbar-title {
  font-size: 1.125rem;
  font-weight: 700;
  white-space: nowrap;
}
.vc-scheduler__toolbar-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
}
</style>
