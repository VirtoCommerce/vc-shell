<template>
  <!-- Money cell -->
  <div v-if="cell.type === 'money'">
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
  </div>

  <!-- Date ago cell -->
  <div v-else-if="cell.type === 'date-ago'" class="text-[#a5a5a5]">
    {{ moment(value).fromNow() }}
  </div>

  <!-- Date exact cell -->
  <div v-else-if="cell.type === 'date'" class="text-[#a5a5a5]">
    {{
      cell.format
        ? moment(value).locale(locale).format(cell.format)
        : value.toLocaleDateString()
    }}
  </div>

  <!-- Image cell -->
  <div v-else-if="cell.type === 'image'">
    <VcImage :bordered="true" size="s" aspect="1x1" :src="value" />
  </div>

  <!-- Status cell -->
  <div v-else-if="cell.type === 'status'">
    <VcStatus>{{ value }}</VcStatus>
  </div>

  <!-- Status icon cell -->
  <div v-else-if="cell.type === 'status-icon'" class="flex justify-center">
    <VcStatusIcon :status="value"></VcStatusIcon>
  </div>

  <!-- Number cell -->
  <div v-else-if="cell.type === 'number'" class="text-right">
    {{ Number(value).toFixed(0) }}
  </div>

  <!-- Link cell -->
  <div v-else-if="cell.type === 'link'">
    <VcLink>{{ value }}</VcLink>
  </div>

  <!-- Default cell -->
  <div v-else>
    {{ value }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import moment from "moment";

const props = defineProps({
  cell: {
    type: Object,
    default: () => ({}),
  },

  item: {
    type: Object,
    default: () => ({}),
  },
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
