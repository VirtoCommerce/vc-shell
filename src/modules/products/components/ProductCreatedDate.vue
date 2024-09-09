<template>
  <span
    class="tw-text-[#a5a5a5]"
    :class="context.cell.class"
    :title="(value instanceof Date && value.toLocaleString(locale)) || ''"
  >
    <div
      v-if="value && context.item.type !== 'category'"
      class="tw-truncate"
    >
      {{ moment(value).fromNow() }}
    </div>
  </span>
</template>

<script setup lang="ts">
import { ISellerProduct } from "@vcmp-vendor-portal/api/marketplacevendor";
import { type ITableColumns } from "@vc-shell/framework";
import moment from "moment";
import { computed } from "vue";
import * as _ from "lodash-es";
import { IListEntryBase } from "@vcmp-vendor-portal/api/catalog";

export interface Props {
  context: {
    cell: ITableColumns;
    item: ISellerProduct & IListEntryBase;
  };
}

const props = defineProps<Props>();

const locale = window.navigator.language;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const value = computed((): any => _.get(props.context.item, props.context.cell.field || props.context.cell.id));
</script>
