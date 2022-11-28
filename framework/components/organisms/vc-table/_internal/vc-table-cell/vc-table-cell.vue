<template>
  <!-- Money cell -->
  <template v-if="cell.type === 'money'">
    <template v-if="value > 0">
      <span>{{ Math.trunc(Number(value)) }}</span
      ><span class="text-[#a5a5a5] text-xs"
        >.{{
          `${(Number(value) * 100) % 100}`.padEnd(2, "0").slice(0, 2)
        }}</span
      >
    </template>
    <template v-else>
      <span>N/A</span>
    </template>
  </template>

  <!-- Date ago cell -->
  <span v-else-if="cell.type === 'date-ago'" class="text-[#a5a5a5]">
    <template v-if="value">
      {{ moment(value).fromNow() }}
    </template>
    <template v-else>N/A</template>
  </span>

  <!-- Date exact cell -->
  <span
    v-else-if="
      cell.type === 'date' || cell.type === 'time' || cell.type === 'date-time'
    "
    class="text-[#a5a5a5]"
  >
    <template v-if="value">
      <template v-if="cell.format">
        {{ moment(value).locale(locale).format(cell.format) }}
      </template>
      <template v-else>
        <template v-if="cell.type === 'date'">{{
          value.toLocaleDateString()
        }}</template>
        <template v-if="cell.type === 'time'">{{
          value.toLocaleTimeString()
        }}</template>
        <template v-if="cell.type === 'date-time'">{{
          value.toLocaleString()
        }}</template>
      </template>
    </template>
    <template v-else>N/A</template>
  </span>

  <!-- Image cell -->
  <template v-else-if="cell.type === 'image'">
    <VcImage
      :bordered="true"
      size="s"
      aspect="1x1"
      :src="value"
      background="contain"
    />
  </template>

  <!-- Status cell -->
  <template v-else-if="cell.type === 'status'">
    <VcStatus>{{ value }}</VcStatus>
  </template>

  <!-- Status icon cell -->
  <div v-else-if="cell.type === 'status-icon'" class="flex justify-center">
    <VcStatusIcon :status="value"></VcStatusIcon>
  </div>

  <!-- Number cell -->
  <span v-else-if="cell.type === 'number'" class="text-right">
    {{ Number(value).toFixed(0) }}
  </span>

  <!-- Link cell -->
  <template v-else-if="cell.type === 'link'">
    <VcLink>{{ value }}</VcLink>
  </template>

  <!-- Default cell -->
  <span v-else>
    {{ value }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import moment from "moment";
import { ITableColumns } from "@types";
import { VcImage, VcStatus, VcStatusIcon, VcLink } from "@components";

export interface Props {
  cell: ITableColumns;
  item: Record<string, unknown>;
}

const props = withDefaults(defineProps<Props>(), {
  cell: undefined,
  item: undefined,
});

const locale = window.navigator.language;
const value = computed(() =>
  (props.cell.field || props.cell.id)
    .split(".")
    .reduce(
      (p: { [x: string]: unknown }, c: string) => (p && p[c]) || null,
      props.item
    )
);
</script>
