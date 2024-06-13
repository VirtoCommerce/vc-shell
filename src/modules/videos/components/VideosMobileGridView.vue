<template>
  <div class="tw-p-3 tw-flex tw-flex-nowrap">
    <VcImage
      class="tw-shrink-0"
      aspect="1x1"
      size="m"
      :bordered="true"
      :src="context.item.thumbnailUrl"
    />
    <div class="tw-grow tw-basis-0 tw-ml-3">
      <div class="tw-font-bold tw-text-lg">
        {{ context.item.name }}
      </div>
      <VcHint class="tw-mt-1">{{ context.item.contentUrl }}</VcHint>

      <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
        <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
          <VcHint>{{ $t("VIDEOS.PAGES.LIST.MOBILE.CREATED") }}</VcHint>
          <div class="tw-truncate tw-mt-1">
            {{ context.item.createdDate && moment(context.item.createdDate).fromNow() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IVideo } from "@vcmp-vendor-portal/api/catalog";
import moment from "moment";

export interface Props {
  context: {
    item: IVideo;
  };
}

defineProps<Props>();
</script>
