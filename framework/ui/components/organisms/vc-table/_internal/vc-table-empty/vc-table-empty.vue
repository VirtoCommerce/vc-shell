<template>
  <!-- Empty table view -->
  <template v-if="!(items && items.length && !columnsInit)">
    <slot
      v-if="searchValue !== undefined || activeFilterCount"
      name="notfound"
    >
      <div class="vc-table-empty">
        <VcIcon
          v-if="notfound?.icon"
          :icon="notfound.icon"
          size="xxxl"
          class="vc-table-empty__icon"
        />
        <div class="vc-table-empty__text">
          {{ notfound?.text || $t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_FOUND") }}
        </div>
        <VcButton
          v-if="notfound?.action"
          @click="notfound?.clickHandler"
        >
          {{ notfound.action }}
        </VcButton>
      </div>
    </slot>
    <slot
      v-else
      name="empty"
    >
      <div class="vc-table-empty vc-table-empty--default">
        <VcIcon
          v-if="empty?.icon"
          :icon="empty.icon"
          size="xxxl"
          class="vc-table-empty__icon"
        />  
        <div class="vc-table-empty__text">
          {{ empty?.text || $t("COMPONENTS.ORGANISMS.VC_TABLE.EMPTY") }}
        </div>
        <VcButton
          v-if="empty?.action"
          @click="empty?.clickHandler"
        >
          {{ empty.action }}
        </VcButton>
      </div>
    </slot>
  </template>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { Ref } from "vue";
import { TableEmptyAction } from "@ui/components/organisms/vc-table/types";

export interface Props {
  items: any[];
  columnsInit: boolean;
  searchValue?: string;
  activeFilterCount?: number;
  notfound?: TableEmptyAction;
  empty?: TableEmptyAction;
}

defineProps<Props>();
defineSlots<{
  notfound: void;
  empty: void;
}>();
</script>

<style lang="scss">
:root {
  --table-empty-icon-color: var(--secondary-500);
}

.vc-table-empty {
  @apply tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center;

  &__icon {
    @apply tw-text-[color:var(--table-empty-icon-color)];
  }

  &__text {
    @apply tw-m-4 tw-text-xl tw-font-medium;
  }
}
</style>
