<template>
  <!-- Empty table view -->
  <template v-if="!(items && items.length && !columnsInit)">
    <slot
      v-if="searchValue !== undefined || activeFilterCount"
      name="notfound"
    >
      <div class="vc-table-empty">
        <img
          v-if="notfound?.image"
          :src="notfound.image"
          alt="Not Found"
          class="vc-table-empty__image"
        />
        <div class="vc-table-empty__text">
          {{ notfound?.text || $t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_FOUND") }}
        </div>
        <VcButton
          v-if="notfound?.action"
          class="vc-table-empty__button"
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
        <img
          v-if="empty?.image"
          :src="empty.image"
          alt="Empty Table"
          class="vc-table-empty__image"
        />
        <div class="vc-table-empty__text">
          {{ empty?.text || $t("COMPONENTS.ORGANISMS.VC_TABLE.EMPTY") }}
        </div>
        <VcButton
          v-if="empty?.action"
          class="vc-table-empty__button"
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

<style lang="scss">
.vc-table-empty {
  @apply tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center;

  &__image {
    @apply tw-w-auto tw-h-auto;
  }

  /* Элемент: Text */
  &__text {
    @apply tw-m-4;
    @apply tw-text-center;
    @apply tw-text-xl tw-font-medium;
  }

  &__button {
    @apply tw-px-4 tw-py-2 tw-rounded tw-font-medium tw-text-sm tw-cursor-pointer;
    @apply tw-bg-blue-500 tw-text-white;
    transition: background-color 0.3s ease;

    &:hover {
      @apply tw-bg-blue-600;
    }
  }
}
</style>
