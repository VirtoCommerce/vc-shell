<template>
  <div class="vc-user-actions">
    <div class="vc-user-actions__trigger">
      <div class="vc-user-actions__buttons">
        <button
          v-for="(item, i) in profileMenu"
          :key="`action_btn_${i}`"
          class="vc-user-actions__btn"
          @click="$emit('action:click', item)"
        >
          <VcIcon
            v-if="item.icon"
            :icon="item.icon"
            size="l"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "../../../../ui/components";
import type { IMenuItem } from "../../../../core/types";

defineProps<{
  profileMenu: IMenuItem[];
}>();

defineEmits<{
  (e: "action:click", item: IMenuItem): void;
}>();
</script>

<style lang="scss">
.vc-user-actions {
  @apply tw-relative tw-h-full;

  &__trigger {
    @apply tw-absolute tw-right-0 tw-top-0 tw-h-full tw-w-1 tw-bg-[--user-dropdown-button-bg];
  }

  &__buttons {
    @apply tw-flex tw-absolute tw-right-0 tw-top-0 tw-h-full tw-translate-x-full;
    transition: transform 0.3s ease;
  }

  &__btn {
    @apply tw-w-12 tw-h-full tw-flex tw-items-center tw-justify-center tw-text-[color:var(--user-dropdown-button-icon-color)];

    &:nth-child(1) {
      @apply tw-bg-[--user-dropdown-button-bg];

      &:hover {
        @apply tw-bg-[--user-dropdown-button-bg-hover];
      }
    }

    &:nth-child(2) {
      @apply tw-bg-[--user-dropdown-button-bg-logout];

      &:hover {
        @apply tw-bg-[--user-dropdown-button-bg-logout-hover];
      }
    }
  }
}
</style>
