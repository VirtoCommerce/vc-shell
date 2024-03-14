<template>
  <!-- Money cell -->
  <template v-if="cell.type === 'money'">
    <div
      v-if="typeof Number(value) === 'number' && Number(value) > 0"
      class="tw-truncate"
    >
      <span class="tw-truncate">{{ Math.trunc(Number(value)) }}</span
      ><span class="tw-text-[#a5a5a5] tw-text-xs tw-truncate"
        >.{{ `${(Number(value) * 100) % 100}`.padEnd(2, "0").slice(0, 2) }}</span
      >
    </div>
    <template v-else>
      <div class="tw-truncate">N/A</div>
    </template>
  </template>

  <!-- Date ago cell -->
  <span
    v-else-if="cell.type === 'date-ago'"
    class="tw-text-[#a5a5a5]"
  >
    <div
      v-if="value"
      class="tw-truncate"
    >
      {{ moment(value).fromNow() }}
    </div>
    <div
      v-else
      class="tw-truncate"
    >
      N/A
    </div>
  </span>

  <!-- Date exact cell -->
  <div
    v-else-if="cell.type === 'date' || cell.type === 'time' || cell.type === 'date-time'"
    class="tw-text-[#a5a5a5] tw-truncate"
  >
    <template v-if="value">
      <div
        v-if="cell.format"
        class="tw-truncate"
      >
        {{ moment(value).locale(locale).format(cell.format) }}
      </div>
      <template v-else>
        <div
          v-if="cell.type === 'date'"
          class="tw-truncate"
        >
          {{ value instanceof Date && value.toLocaleDateString() }}
        </div>
        <div
          v-if="cell.type === 'time'"
          class="tw-truncate"
        >
          {{ value instanceof Date && value.toLocaleTimeString() }}
        </div>
        <p
          v-if="cell.type === 'date-time'"
          class="tw-truncate"
        >
          {{ value.toLocaleString() }}
        </p>
      </template>
    </template>
    <div
      v-else
      class="tw-truncate"
    >
      N/A
    </div>
  </div>

  <!-- Image cell -->
  <template v-else-if="cell.type === 'image'">
    <VcImage
      :bordered="true"
      size="s"
      aspect="1x1"
      :src="value as string"
      background="contain"
    />
  </template>

  <!-- Status cell -->
  <template v-else-if="cell.type === 'status'">
    <VcStatus>{{ value }}</VcStatus>
  </template>

  <!-- Status icon cell -->
  <div
    v-else-if="cell.type === 'status-icon'"
    class="tw-flex tw-justify-center"
  >
    <VcStatusIcon :status="value as boolean"></VcStatusIcon>
  </div>

  <!-- Number cell -->
  <div
    v-else-if="cell.type === 'number'"
    class="tw-text-right tw-truncate"
  >
    {{ Number(value).toFixed(0) }}
  </div>

  <!-- Link cell -->
  <template v-else-if="cell.type === 'link'">
    <VcLink class="tw-truncate">{{ value }}</VcLink>
  </template>

  <!-- Default cell -->
  <div
    v-else
    class="tw-truncate"
  >
    {{ value }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import moment from "moment";
import { ITableColumns } from "./../../../../../../core/types";

export interface Props {
  cell: ITableColumns;
  item: Record<string, unknown>;
}

const props = defineProps<Props>();

// TODO fix on russian locale
const locale = window.navigator.language;
const value = computed((): unknown => {
  return (props.cell.field || props.cell.id).split(".").reduce((p: { [x: string]: unknown }, c: string) => {
    if (p && Array.isArray(p) && p.length) {
      const val = p && p[0][c];
      return val !== undefined ? val : null;
    }
    const val = p && p[c];
    return val !== undefined ? val : null;
  }, props.item);
});
</script>
