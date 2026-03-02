<template>
  <div class="vc-language-selector">
    <VcDropdown
      :model-value="isOpened"
      :items="options"
      :floating="true"
      placement="bottom-end"
      :offset="{ mainAxis: 8, crossAxis: 0 }"
      :empty-text="t('common.no_options', 'No options')"
      :is-item-active="(item: any) => item.value === modelValue"
      role="listbox"
      :padded="true"
      @item-click="onItemClick"
      @update:model-value="isOpened = $event"
    >
      <template #trigger>
        <button
          type="button"
          class="vc-language-selector__trigger"
          :class="{
            'vc-language-selector__trigger--active': isOpened,
            'vc-language-selector__trigger--disabled': disabled,
          }"
          :disabled="disabled"
          :aria-expanded="isOpened"
          aria-haspopup="listbox"
          @click="onTriggerClick"
        >
          <img
            v-if="currentLanguageOption?.flag"
            :src="currentLanguageOption.flag"
            :alt="currentLanguageOption.label"
            class="vc-language-selector__flag"
          />
          <VcIcon
            v-else
            icon="lucide-globe"
            size="xs"
            class="tw-text-[color:var(--neutrals-400)]"
          />
        </button>
      </template>
      <template #item="{ item }">
        <div
          class="vc-language-selector__item"
          :class="{
            'vc-language-selector__item--active': item.value === modelValue,
          }"
        >
          <VcIcon
            v-if="item.value === modelValue"
            icon="lucide-check"
            size="xs"
            class="vc-language-selector__item-icon"
          />
          <span
            v-else
            class="vc-language-selector__item-icon-placeholder"
          />
          <img
            v-if="item.flag"
            :src="item.flag"
            :alt="item.label"
            class="vc-language-selector__item-flag"
          />
          <span class="vc-language-selector__item-label">{{ item.label }}</span>
        </div>
      </template>
      <template #empty>
        <div class="tw-p-2 tw-text-sm tw-text-[color:var(--neutrals-400)]">
          {{ t("common.no_options", "No options") }}
        </div>
      </template>
    </VcDropdown>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, type PropType } from "vue";
import { VcDropdown } from "@ui/components";
import { VcIcon } from "@ui/components/atoms/vc-icon";
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

<style lang="scss">
.vc-language-selector {
  @apply tw-inline-flex;

  &__trigger {
    @apply tw-flex tw-items-center tw-justify-center
      tw-w-8 tw-h-8 tw-rounded-full
      tw-border tw-border-solid tw-border-[color:var(--neutrals-300)]
      tw-bg-[color:var(--additional-50)]
      tw-cursor-pointer tw-transition-all tw-duration-150
      tw-outline-none tw-p-0;

    &:hover:not(:disabled) {
      border-color: var(--neutrals-400);
      background: var(--neutrals-50);
    }

    &:focus-visible {
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    &--active {
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    &--disabled {
      @apply tw-opacity-50 tw-cursor-not-allowed;
    }
  }

  &__flag {
    @apply tw-w-6 tw-h-6 tw-rounded-full tw-object-cover;
  }

  &__item {
    @apply tw-flex tw-items-center tw-gap-2 tw-w-full tw-px-2 tw-py-[6px] tw-rounded-md
      tw-text-sm tw-cursor-pointer tw-transition-colors tw-duration-150;

    &:hover {
      background: var(--neutrals-100);
    }

    &--active {
      @apply tw-font-medium;
    }
  }

  &__item-icon {
    @apply tw-w-3.5 tw-shrink-0;
    color: var(--primary-500);
  }

  &__item-icon-placeholder {
    @apply tw-w-3.5 tw-shrink-0;
  }

  &__item-flag {
    @apply tw-w-5 tw-h-5 tw-rounded-full tw-object-cover tw-shrink-0;
  }

  &__item-label {
    @apply tw-truncate;
  }
}
</style>
