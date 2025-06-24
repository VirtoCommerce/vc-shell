<template>
  <div class="vc-language-selector">
    <GenericDropdown
      :opened="isOpened"
      :items="options"
      :floating="true"
      placement="bottom-end"
      :offset="{ mainAxis: 10, crossAxis: -15 }"
      :disabled="disabled"
      :empty-text="t('common.no_options', 'No options')"
      :is-item-active="(item: any) => item.value === modelValue"
      @item-click="onItemClick"
      @update:opened="isOpened = $event"
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
    </GenericDropdown>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref, type PropType } from "vue";
import { VcImage } from "../../../ui/components";
import { GenericDropdown } from "../../../shared/components";
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

// // We use a computed property to build the dropdown via render function `h`.
// // This is because the old implementation in `dynamic-blade-form` used this pattern,
// // and it's a powerful way to construct complex components with custom slots programmatically.
// const dropdownComponent = computed(() => {
//   return h(
//     GenericDropdown,
//     {
//       opened: isOpened.value,
//       items: props.options,
//       floating: true,
//       placement: "bottom-end",
//       offset: { mainAxis: 10, crossAxis: -15 },
//       variant: "secondary",
//       disabled: props.disabled,
//       emptyText: t("common.no_options", "No options"),
//       isItemActive: (item: any) => item.value === props.modelValue,
//       onItemClick: (item: any) => {
//         isOpened.value = false;
//         emit("update:modelValue", item.value);
//       },
//       "onUpdate:opened": (state: boolean) => {
//         isOpened.value = state;
//       },
//     },
//     {
//       // Custom trigger slot: a circular button with the current language's flag
//       trigger: () =>
//         h(
//           "div",
//           {
//             onClick: () => {
//               if (props.disabled) return;
//               isOpened.value = !isOpened.value;
//             },
//             class: [
//               "tw-flex tw-cursor-pointer tw-items-center tw-justify-center tw-bg-[--primary-100]",
//               "tw-w-8 tw-h-8 tw-rounded-full hover:tw-bg-[--primary-200]",
//               { "tw-cursor-not-allowed tw-opacity-50": props.disabled },
//             ],
//           },
//           [h(VcImage, { src: currentLanguageOption.value?.flag, class: "tw-w-6 tw-h-6", emptyIcon: "" })],
//         ),
//       // Custom item slot: a row with the flag and language name
//       item: ({ item }: { item: any }) =>
//         h("div", { class: "tw-flex tw-items-center tw-gap-2 tw-p-2" }, [
//           h(VcImage, { src: item.flag, class: "tw-w-6 tw-h-6", emptyIcon: "" }),
//           h("span", { class: "tw-text-sm" }, item.label),
//         ]),
//       empty: () => h("div", { class: "tw-p-2 tw-text-sm" }, t("common.no_options", "No options")),
//     },
//   );
// });
</script>
