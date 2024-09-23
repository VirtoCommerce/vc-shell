<template>
  <div
    v-if="editing && addNewRowButton"
    class="vc-table-add-new-row"
  >
    <div class="vc-table-add-new-row__container">
      <VcButton
        v-if="addNewRowButton.show"
        text
        class="vc-table-add-new-row__button"
        @click="$emit('onAddNewRow')"
      >
        <div class="vc-table-add-new-row__content">
          <VcIcon
            icon="fas fa-plus"
            size="m"
            class="vc-table-add-new-row__icon"
          />
          {{ unref(addNewRowButton.title) }}
        </div>
      </VcButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { unref } from "vue";
export interface Props {
  editing: boolean | undefined;
  addNewRowButton:
    | {
        show: boolean;
        title: string;
      }
    | undefined;
}

export interface Emits {
  (event: "onAddNewRow"): void;
}

defineProps<Props>();

defineEmits<Emits>();
</script>

<style lang="scss">
:root {
  --table-add-new-icon-color: var(--primary-400);
}

.vc-table-add-new-row {
  @apply tw-p-3;

  &__content {
    @apply tw-flex tw-flex-row tw-gap-2 tw-items-center;
  }

  &__icon {
    @apply tw-text-[color:var(--table-add-new-icon-color)];
  }
}
</style>
