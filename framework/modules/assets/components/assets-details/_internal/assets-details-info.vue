<template>
  <section class="assets-details__section">
    <h3
      v-if="title"
      class="assets-details__heading"
    >
      {{ title }}
    </h3>
    <div
      v-if="state === 'loading'"
      data-test-id="assets-details-info-loading"
    >
      <VcSkeleton
        variant="text"
        :rows="2"
      />
    </div>
    <p
      v-else-if="state === 'failed'"
      class="assets-details__info-failed"
      data-test-id="assets-details-info-failed"
    >
      {{ t("ASSETS.PAGES.DETAILS.INFO_FAILED") }}
    </p>
    <dl
      v-else
      class="assets-details__list"
    >
      <div
        v-for="(row, index) in rows"
        :key="row.key ?? `${index}-${row.label}`"
        class="assets-details__row"
        :data-test-id="`assets-details-row-${row.key ?? index}`"
      >
        <dt class="assets-details__label">{{ row.label }}</dt>
        <dd class="assets-details__value">{{ row.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import type { IAssetInfoRow } from "@modules/assets/components/assets-details/types";

withDefaults(
  defineProps<{
    title?: string;
    rows: IAssetInfoRow[];
    state?: "ready" | "loading" | "failed";
  }>(),
  { state: "ready" },
);

const { t } = useI18n({ useScope: "global" });
</script>

<style lang="scss">
:root {
  --assets-details-heading-color: var(--neutrals-500);
  --assets-details-label-color: var(--neutrals-500);
  --assets-details-value-color: var(--neutrals-900);
}

.assets-details__section {
  @apply tw-flex tw-flex-col tw-gap-4;
}

.assets-details__heading {
  @apply tw-m-0 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-[0.04em];
  @apply tw-text-[color:var(--assets-details-heading-color)];
}

.assets-details__list {
  @apply tw-m-0 tw-grid tw-grid-cols-[auto_1fr] tw-gap-x-4 tw-gap-y-2.5 tw-items-baseline;
}

// Rows are wrappers for test ids; their cells sit on the parent grid.
.assets-details__row {
  @apply tw-contents;
}

.assets-details__label {
  @apply tw-text-[13px] tw-text-[color:var(--assets-details-label-color)];
}

.assets-details__value {
  @apply tw-m-0 tw-text-[13px] tw-text-[color:var(--assets-details-value-color)];
  overflow-wrap: anywhere;
}

.assets-details__info-failed {
  @apply tw-m-0 tw-text-sm tw-text-[color:var(--assets-details-muted-color)];
}
</style>
