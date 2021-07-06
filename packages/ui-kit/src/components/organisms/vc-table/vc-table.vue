<template>
  <div class="vc-table-wrapper">
    <table
      class="vc-table vc-fill_width"
      :class="{
        'vc-table_empty': !items || !items.length,
        'vc-table_multiselect': multiselect,
      }"
    >
      <thead v-if="headers" class="vc-table__header">
        <tr class="vc-table__header-row">
          <td v-if="multiselect" class="vc-table__header-cell" width="32">
            <div class="vc-flex vc-flex-justify_center vc-flex-align_center">
              <vc-checkbox></vc-checkbox>
            </div>
          </td>
          <td
            v-for="item in headers"
            :key="item.id"
            class="vc-table__header-cell vc-padding-horizontal_m"
            :width="item.width"
          >
            <div
              class="vc-flex vc-flex-align_center vc-flex-nowrap"
              :class="`vc-flex-justify_${item.align || 'start'}`"
            >
              <div>
                <slot :name="`header_${item.id}`">{{ item.title }}</slot>
              </div>
              <div
                v-if="item.sortable"
                class="vc-table__header-cell_sort vc-margin-left_xs"
              >
                <vc-icon size="xs" icon="caret-up"></vc-icon>
              </div>
            </div>
          </td>
        </tr>
      </thead>

      <tbody v-if="items" class="vc-table__body">
        <tr
          v-for="item in items"
          :key="item.id"
          class="vc-table__body-row"
          @click="$emit('itemClick', item)"
        >
          <td
            v-if="multiselect"
            class="vc-table__body-cell vc-table__body-cell_bordered"
            width="20"
          >
            <div class="vc-flex vc-flex-justify_center vc-flex-align_center">
              <vc-checkbox></vc-checkbox>
            </div>
          </td>
          <td
            v-for="cell in headers"
            :key="`${item.id}_${cell.id}`"
            class="vc-table__body-cell vc-padding-horizontal_m"
            :class="cell.class"
            :width="cell.width"
          >
            <div class="vc-flex vc-flex-align_center">
              <slot :name="`item_${cell.id}`" :item="item">{{
                item[cell.id]
              }}</slot>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import VcCheckbox from "../../atoms/vc-checkbox/vc-checkbox.vue";

export default defineComponent({
  components: { VcIcon, VcCheckbox },

  props: {
    headers: {
      type: Array,
    },

    items: {
      type: Array,
    },

    sortable: {
      type: Array,
    },

    multiselect: {
      type: Boolean,
    },
  },
});
</script>
