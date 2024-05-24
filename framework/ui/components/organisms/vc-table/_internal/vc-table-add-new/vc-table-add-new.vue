o
<template>
  <tr v-if="editing && addNewRowButton">
    <td>
      <div class="tw-p-3">
        <VcButton
          v-if="addNewRowButton.show"
          text
          @click="$emit('onAddNewRow')"
        >
          <div class="tw-flex tw-flex-row tw-gap-2 tw-items-center">
            <VcIcon
              icon="fas fa-plus"
              size="m"
              class="tw-text-[#41afe6]"
            />
            {{ unref(addNewRowButton.title) }}
          </div>
        </VcButton>
      </div>
    </td>
  </tr>
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

<style lang="scss" scoped></style>
