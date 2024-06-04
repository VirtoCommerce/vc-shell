<template>
  <!-- Empty table view -->
  <template v-if="!(items && items.length && !columnsInit)">
    <slot
      v-if="searchValue || searchValue === '' || activeFilterCount"
      name="notfound"
    >
      <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
        <img
          v-if="notfound?.image"
          :src="notfound.image"
        />
        <div class="tw-m-4 vc-table__empty-text">
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
      <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
        <img
          v-if="empty?.image"
          :src="empty.image"
        />
        <div class="tw-m-4 tw-text-xl tw-font-medium">
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

export interface Props {
  items: any[];
  columnsInit: boolean;
  searchValue?: string;
  activeFilterCount: number;
  notfound?: {
    image?: string;
    text: string | Ref<string>;
    action?: string;
    clickHandler?: () => void;
  };
  empty?: {
    image?: string;
    text: string | Ref<string>;
    action?: string;
    clickHandler?: () => void;
  };
}

defineProps<Props>();
defineSlots<{
  notfound: void;
  empty: void;
}>();
</script>

<style lang="scss" scoped></style>
