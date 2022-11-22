<template>
  <VcPopup
    :title="$t('IMPORT.PAGES.IMPORTING.POPUP.TITLE')"
    @close="$emit('close')"
    class="import-popup"
    variant="medium"
  >
    <div class="flex flex-row justify-between">
      <div class="p-5 flex items-center">
        <p class="m-0 text-[color:var(--basic-black-color)] leading-lg">
          {{ $t("IMPORT.PAGES.IMPORTING.POPUP.DESCRIPTION") }}
        </p>
      </div>
      <div
        class="p-5 flex items-center border-l border-solid border-l-[#e3e7ec]"
      >
        <p class="text-lg leading-xl text-[color:var(--basic-black-color)] m-0">
          {{ $t("IMPORT.PAGES.IMPORTING.POPUP.PREVIEW_COUNT") }}:
          <span class="text-[color:var(--primary-color)]">{{
            items.length
          }}</span>
          {{ $t("IMPORT.PAGES.IMPORTING.POPUP.PREVIEW_OF") }}
          <span class="text-[color:var(--primary-color)]">{{ total }}</span>
        </p>
      </div>
    </div>
    <VcTable
      :columns="columns"
      :items="items"
      :header="false"
      :scrolling="true"
      :footer="false"
    ></VcTable>
    <div class="p-5 flex justify-between">
      <VcButton :outline="true" @click="$emit('close')">{{
        $t("IMPORT.PAGES.IMPORTING.POPUP.CANCEL")
      }}</VcButton>
      <VcButton @click="$emit('startImport')" :disabled="disabled">{{
        $t("IMPORT.PAGES.IMPORTING.POPUP.IMPORT")
      }}</VcButton>
    </div>
  </VcPopup>
</template>

<script lang="ts" setup>
import { VcTable, VcButton, VcPopup } from "@vc-shell/framework";
import { ITableColumns } from "../../../types";

export interface Props {
  columns: ITableColumns[];
  items: Record<string, unknown>[];
  total: number;
  disabled: boolean;
}

interface Emits {
  (event: "close"): void;
}

withDefaults(defineProps<Props>(), {
  columns: () => [],
  items: () => [],
  total: 0,
  disabled: false,
});

defineEmits<Emits>();
</script>

<style lang="scss">
.import-popup {
  .vc-popup__content {
    @apply flex flex-col;
  }
}
</style>
