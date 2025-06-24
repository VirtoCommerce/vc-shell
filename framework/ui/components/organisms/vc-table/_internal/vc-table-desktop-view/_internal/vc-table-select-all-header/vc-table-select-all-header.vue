<template>
  <div
    v-if="selectAll && showSelectionChoice"
    class="vc-table-select-all-footer"
  >
    <div class="vc-table-select-all-footer__content">
      <div>
        {{
          allSelected
            ? t("COMPONENTS.ORGANISMS.VC_TABLE.ALL_SELECTED")
            : t("COMPONENTS.ORGANISMS.VC_TABLE.CURRENT_PAGE_SELECTED")
        }}
        <VcButton
          text
          class="vc-table-select-all-footer__button"
          @click="$emit('selectAll')"
        >
          {{ allSelected ? t("COMPONENTS.ORGANISMS.VC_TABLE.CANCEL") : t("COMPONENTS.ORGANISMS.VC_TABLE.SELECT_ALL") }}
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { VcButton } from "../../../../../../";

const { t } = useI18n({ useScope: "global" });

defineProps<{
  selectAll?: boolean;
  showSelectionChoice?: boolean;
  allSelected?: boolean;
}>();

defineEmits<{
  (e: "selectAll"): void;
}>();
</script>

<style lang="scss">
.vc-table-select-all-footer {
  @apply tw-h-16 tw-min-h-16 tw-bg-[--table-select-all-bg] tw-w-full tw-flex;

  &__content {
    @apply tw-w-full tw-flex tw-items-center tw-justify-center;
  }

  &__button {
    @apply tw-text-sm;
  }
}
</style>
