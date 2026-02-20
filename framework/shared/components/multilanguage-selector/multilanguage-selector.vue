<template>
  <div class="vc-language-selector">
    <VcDropdown
      :model-value="isOpened"
      :items="options"
      :floating="true"
      placement="bottom-end"
      :offset="{ mainAxis: 10, crossAxis: -15 }"
      :empty-text="t('common.no_options', 'No options')"
      :is-item-active="(item: any) => item.value === modelValue"
      @item-click="onItemClick"
      @update:model-value="isOpened = $event"
    >
      <template #trigger>
        <div
          class="tw-flex tw-cursor-pointer tw-items-center tw-justify-center tw-bg-[--primary-100] tw-w-8 tw-h-8 tw-rounded-full hover:tw-bg-[--primary-200]"
          @click="onTriggerClick"
        >
          <VcImage
            :src="currentLanguageOption?.flag"
            class="tw-w-6 tw-h-6"
            empty-icon=""
          />
        </div>
      </template>
      <template #item="{ item }">
        <div class="tw-flex tw-items-center tw-gap-2 tw-p-2">
          <VcImage
            :src="item.flag"
            class="tw-w-6 tw-h-6"
            empty-icon=""
          />
          <span class="tw-text-sm">{{ item.label }}</span>
        </div>
      </template>
      <template #empty>
        <div class="tw-p-2 tw-text-sm">
          {{ t("common.no_options", "No options") }}
        </div>
      </template>
    </VcDropdown>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, type PropType } from "vue";
import { VcDropdown, VcImage } from "@ui/components";
import { useI18n } from "vue-i18n";

type LanguageOption = {
  value: string;
  label: string;
  flag?: string;
};

const props = defineProps({
  options: {
    type: Array as PropType<LanguageOption[]>,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const { t } = useI18n({ useScope: "global" });
const isOpened = ref(false);

const currentLanguageOption = computed(() => {
  return props.options.find((option) => option.value === props.modelValue);
});

const onTriggerClick = () => {
  if (props.disabled) return;
  isOpened.value = !isOpened.value;
};

const onItemClick = (item: LanguageOption) => {
  isOpened.value = false;
  emit("update:modelValue", item.value);
};
</script>
