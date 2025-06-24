<template>
  <div
    v-if="multiselect && $isMobile.value && (selection.length > 0 || allSelected)"
    class="vc-table-select-all"
  >
    <div class="vc-table-select-all__bar">
      <div class="vc-table-select-all__content">
        <div class="vc-table-select-all__checkbox">
          <VcCheckbox
            :model-value="headerCheckbox"
            class="vc-table-select-all__checkbox-input"
            size="m"
            @update:model-value="$emit('update:header-checkbox', $event)"
            @click.stop
          >
            {{ t("COMPONENTS.ORGANISMS.VC_TABLE.SELECT_ALL_TRUNCATED") }}
          </VcCheckbox>
          {{ t("COMPONENTS.ORGANISMS.VC_TABLE.SELECTED") }}: {{ allSelected ? totalCount : selection.length }}
        </div>

        <VcButton
          text
          @click="handleCancelSelection"
        >
          {{ t("COMPONENTS.ORGANISMS.VC_TABLE.CANCEL") }}
        </VcButton>
      </div>
    </div>
    <div
      v-if="selectAll && showSelectionChoice"
      class="vc-table-select-all__choice"
    >
      <div class="vc-table-select-all__choice-content">
        <div>
          {{
            allSelected
              ? t("COMPONENTS.ORGANISMS.VC_TABLE.ALL_SELECTED")
              : t("COMPONENTS.ORGANISMS.VC_TABLE.CURRENT_PAGE_SELECTED")
          }}
          <VcButton
            text
            class="vc-table-select-all__choice-button"
            @click="$emit('select:all')"
          >
            {{
              allSelected ? t("COMPONENTS.ORGANISMS.VC_TABLE.CANCEL") : t("COMPONENTS.ORGANISMS.VC_TABLE.SELECT_ALL")
            }}
          </VcButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { VcButton, VcCheckbox } from "../../../../";

const props = defineProps<{
  multiselect?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selection: any[];
  allSelected: boolean;
  totalCount: number;
  headerCheckbox: boolean;
  selectAll?: boolean;
  showSelectionChoice: boolean;
}>();

const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: "update:selection", value: any[]): void;
  (e: "update:allSelected", value: boolean): void;
  (e: "update:header-checkbox", value: boolean): void;
  (e: "select:all"): void;
}>();

const { t } = useI18n({ useScope: "global" });

function handleCancelSelection() {
  emit("update:selection", []);
  emit("update:allSelected", false);
}
</script>

<style lang="scss">
.vc-table-select-all {
  @apply tw-flex tw-flex-col;

  &__bar {
    @apply tw-flex tw-flex-row tw-items-center tw-justify-between tw-px-4 tw-py-2 tw-min-h-14 tw-font-bold tw-text-lg tw-border-[color:var(--table-select-all-border-color)] tw-border-b tw-border-solid tw-box-border;
  }

  &__content {
    @apply tw-flex tw-flex-row tw-w-full tw-justify-between;
  }

  &__checkbox {
    @apply tw-flex tw-flex-row tw-items-center tw-justify-center tw-gap-3;
  }

  &__checkbox-input {
    @apply tw-font-normal tw-self-center tw-flex;
  }

  &__choice {
    @apply tw-w-full tw-flex tw-py-2;
  }

  &__choice-content {
    @apply tw-w-full tw-flex tw-items-center tw-justify-center;
  }

  &__choice-button {
    @apply tw-text-sm;
  }
}
</style>
