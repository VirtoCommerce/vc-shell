<template>
  <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-py-3 tw-px-4">
    <div class="tw-w-full tw-flex tw-justify-evenly tw-mb-2">
      <VcImage
        class="tw-shrink-0"
        aspect="1x1"
        size="s"
        :bordered="true"
        :src="context.item.imgSrc"
      ></VcImage>
      <div class="tw-grow tw-basis-0 tw-ml-3">
        <div class="tw-font-bold tw-text-lg">
          {{ context.item.name }}
        </div>
      </div>
    </div>
    <div class="tw-truncate tw-grow-[2] tw-basis-0">
      <VcHint>{{ $t("DYNAMICMODULE.PAGES.LIST.MOBILE.CREATED") }}</VcHint>
      <div class="tw-truncate tw-mt-1">
        {{ context.item.createdDate }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Props {
  context: {
    item: {
      imgSrc: string;
      name: string;
      createdDate: Date;
      id: string;
    };
  };
}

defineProps<Props>();
</script>
