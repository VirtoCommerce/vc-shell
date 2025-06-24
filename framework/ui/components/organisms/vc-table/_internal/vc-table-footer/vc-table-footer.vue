<template>
  <div
    class="vc-table__footer"
    :class="{
      'vc-table__footer--mobile': $isMobile.value,
      'vc-table__footer--desktop': $isDesktop.value,
    }"
  >
    <VcTableCounter
      :label="totalLabel || t('COMPONENTS.ORGANISMS.VC_TABLE.TOTALS')"
      :value="totalCount"
    />

    <VcPagination
      :expanded="expanded"
      :pages="pages"
      :current-page="currentPage"
      :variant="paginationVariant"
      @item-click="handlePaginationClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { VcPagination } from "../../../../";
import VcTableCounter from "../vc-table-counter/vc-table-counter.vue";
import type { ComponentProps } from "vue-component-type-helpers";

const props = defineProps<{
  totalLabel?: string;
  totalCount: number;
  expanded: boolean;
  pages: number;
  currentPage: number;
  paginationVariant: ComponentProps<typeof VcPagination>["variant"];
}>();

const emit = defineEmits<{
  (e: "pagination-click", page: number): void;
}>();

const { t } = useI18n({ useScope: "global" });

function handlePaginationClick(event: number) {
  emit("pagination-click", event);
}
</script>

<style lang="scss">
.vc-table__footer {
  @apply tw-flex-shrink-0 tw-flex tw-items-center tw-justify-between;

  &--mobile {
    @apply tw-p-6;
  }

  &--desktop {
    @apply tw-p-[10px];
  }
}
</style>
