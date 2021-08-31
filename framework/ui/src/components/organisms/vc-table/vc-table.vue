<template>
  <div class="vc-table-wrapper vc-flex vc-flex-column">
    <div v-if="$slots['header']" class="vc-flex-shrink_0">
      <slot name="header"></slot>
    </div>

    <vc-container :noPadding="true" class="vc-flex-grow_1">
      <table
        class="vc-table vc-fill_width"
        :class="{
          'vc-table_empty': !items || !items.length,
          'vc-table_multiselect': multiselect,
        }"
      >
        <thead v-if="headers" class="vc-table__header">
          <tr class="vc-table__header-row">
            <th v-if="multiselect" class="vc-table__header-cell" width="50">
              <div class="vc-flex vc-flex-justify_center vc-flex-align_center">
                <vc-checkbox></vc-checkbox>
              </div>
            </th>
            <th
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
                  <vc-icon size="xs" icon="fas fa-caret-up"></vc-icon>
                </div>
              </div>
            </th>
          </tr>
        </thead>

        <tbody v-if="items" class="vc-table__body">
          <tr
            v-for="(item, i) in items"
            :key="item.id"
            class="vc-table__body-row"
            :class="{
              'vc-table__body-row_even': i % 2 === 1,
            }"
            @click="$emit('itemClick', item)"
          >
            <td v-if="multiselect" class="vc-table__body-cell" width="50">
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
    </vc-container>

    <div v-if="$slots['footer']" class="vc-flex-shrink_0">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import VcCheckbox from "../../atoms/vc-checkbox/vc-checkbox.vue";
import VcContainer from "../../atoms/vc-container/vc-container.vue";

export default defineComponent({
  components: { VcIcon, VcCheckbox, VcContainer },

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

<style lang="less">
.vc-table {
  border-spacing: 0;
  border-collapse: collapse;
  position: relative;
  padding-top: 43px;

  &-wrapper {
    overflow: hidden;
  }

  &__header {
    &-cell {
      height: 42px;
      background-color: #f9f9f9;
      border: 0 !important;
      box-shadow: inset 0px 1px 0px #eaedf3, inset 0px -1px 0px #eaedf3;
      box-sizing: border-box;
      position: sticky;
      top: 0;
    }
  }

  &__body {
    &-row {
      height: 60px;
      cursor: pointer;
      background-color: #ffffff;

      &_even {
        background-color: #f8f8f8;
      }

      &:hover {
        background-color: #dfeef9;
      }
    }

    &-row:hover &-cell_bordered {
      border-right: 1px solid #bdd1df;
    }

    &-cell {
      box-sizing: border-box;

      &_bordered {
        border-right: 1px solid #eaedf3;
      }
    }
  }
}
</style>
