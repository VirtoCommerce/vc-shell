<template>
  <!-- Money cell -->
  <div v-if="cell.type === 'money'" class="vc-table-cell_money">
    <span class="vc-table-cell_money-int">{{ Math.trunc(Number(value)) }}</span
    ><span class="vc-table-cell_money-fract"
      >.{{ `${(Number(value) * 100) % 100}`.padEnd(2, "0") }}</span
    >
  </div>

  <!-- Date ago cell -->
  <div v-else-if="cell.type === 'date-ago'" class="vc-table-cell_date-ago">
    {{ moment(value).fromNow() }}
  </div>

  <!-- Date exact cell -->
  <div v-else-if="cell.type === 'date'" class="vc-table-cell_date">
    {{ value.toLocaleDateString() }}
  </div>

  <!-- Image cell -->
  <div v-else-if="cell.type === 'image'" class="vc-table-cell_image">
    <vc-image :bordered="true" size="s" aspect="1x1" :src="value" />
  </div>

  <!-- Status cell -->
  <div v-else-if="cell.type === 'status'" class="vc-table-cell_status">
    <vc-status>{{ value }}</vc-status>
  </div>

  <!-- Number cell -->
  <div v-else-if="cell.type === 'number'" class="vc-table-cell_number">
    {{ Number(value).toFixed(0) }}
  </div>

  <!-- Default cell -->
  <div v-else class="vc-table-cell_default">
    {{ value }}
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import moment from "moment";

export default defineComponent({
  props: {
    cell: {
      type: Object,
      default: () => ({}),
    },

    item: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    return {
      value: computed(() =>
        (props.cell.field || props.cell.id)
          .split(".")
          .reduce(
            (p: { [x: string]: unknown }, c: string) => (p && p[c]) || null,
            props.item
          )
      ),
      moment,
    };
  },
});
</script>

<style lang="less">
.vc-table-cell {
  &_date,
  &_date-ago {
    color: #a5a5a5;
  }

  &_number {
    text-align: right;
  }

  &_money {
    &-fract {
      color: #a5a5a5;
      font-size: 0.75em;
    }
  }
}
</style>
