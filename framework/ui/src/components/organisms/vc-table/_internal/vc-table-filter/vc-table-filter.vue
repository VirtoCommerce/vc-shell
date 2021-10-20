<template>
  <div class="vc-table-filter">
    <!-- Filter button -->
    <div
      class="vc-table-filter__button"
      @click="isPanelVisible = !isPanelVisible"
    >
      <vc-icon icon="fas fa-filter" size="m" />
      <span v-if="title" class="vc-table-filter__button-title">
        {{ title }}
      </span>
      <div v-if="counter" class="vc-table-filter__button-counter">
        {{ counter }}
      </div>
    </div>

    <!-- Filter panel -->
    <div
      class="vc-table-filter__panel"
      v-if="isPanelVisible"
      @click.self="isPanelVisible = false"
    >
      <div
        class="
          vc-table-filter__panel-inner
          vc-padding_xl
          vc-flex vc-flex-column
        "
        @click.stop
      >
        <vc-icon
          class="vc-table-filter__panel-close vc-flex-shrink_0"
          icon="fas fa-times"
          size="xl"
          @click="isPanelVisible = false"
        />

        <div class="vc-table-filter__panel-title vc-flex-shrink_0">Filters</div>

        <vc-container :no-padding="true" class="vc-flex-grow_1">
          <template v-for="(item, i) in items" :key="i">
            <div class="vc-table-filter__panel-block">
              <div class="vc-table-filter__panel-block-title">
                {{ item.title }}
              </div>
              <div v-if="item.type === 'multi'">
                <div v-for="(option, i) in item.options" :key="i">
                  <vc-checkbox>{{ option.label }}</vc-checkbox>
                </div>
              </div>
              <div v-else-if="item.type === 'date'">
                <vc-input type="date" label="Start"></vc-input>
                <vc-input
                  class="vc-margin-top_m"
                  type="date"
                  label="End"
                ></vc-input>
              </div>
              <div v-else>
                <vc-input type="text"></vc-input>
              </div>
            </div>
          </template>
        </vc-container>

        <div
          class="
            vc-table-filter__panel-actions
            vc-flex-shrink_0
            vc-flex
            vc-flex-justify_center
            vc-padding-top_xl
          "
        >
          <vc-button class="vc-margin-right_s" @click="$emit('apply')">
            Apply filters
          </vc-button>
          <vc-button variant="secondary" @click="$emit('reset')">
            Reset filters
          </vc-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { clickOutside } from "../../../../../directives";

export default defineComponent({
  name: "VcTableFilter",

  inheritAttrs: false,

  directives: {
    clickOutside,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },

    title: {
      type: String,
      default: undefined,
    },

    counter: {
      type: Number,
      default: 0,
    },
  },

  emits: ["apply", "reset"],

  setup() {
    const isPanelVisible = ref(false);

    return {
      isPanelVisible,
    };
  },
});
</script>

<style lang="less">
.vc-table-filter {
  position: relative;
  overflow: visible;

  &__button {
    border-radius: 3px;
    background-color: #43b0e6;
    display: flex;
    align-items: center;
    padding: 0 10px;
    color: white;
    height: 38px;
    box-sizing: border-box;
    cursor: pointer;

    &-title {
      margin-left: 10px;
      font-weight: 500;
    }

    &-counter {
      margin-left: 10px;
      border-radius: 10px;
      background-color: white;
      color: #43b0e6;
      height: 20px;
      min-width: 20px;
      line-height: 20px;
      text-align: center;
      font-weight: 500;
    }
  }

  &__panel {
    position: absolute;
    right: 0;
    top: 120%;
    max-height: 300px;
    max-width: 600px;
    min-width: 400px;
    z-index: 100;
    box-shadow: 1px 1px 11px rgba(141, 152, 163, 0.6);
    border-radius: 3px;
    overflow: hidden;

    &-inner {
      background: white;
      box-sizing: border-box;
    }

    &-close {
      color: #43b0e6;
      cursor: pointer;
    }

    &-title {
      display: none;
    }

    &-block {
      margin-bottom: 16px;

      &-title {
        color: #a1c0d4;
        font-weight: 700;
        font-size: 17px;
        margin-bottom: 12px;
      }
    }
  }

  .vc-app_mobile &__panel {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    bottom: 0;
    z-index: 9999;
    background: rgba(128, 140, 153, 0.6);
    box-shadow: none;
    border-radius: 0;
    max-height: 100%;
    max-width: 100%;
    min-width: 100%;

    &-inner {
      width: 280px;
      height: 100%;
    }

    &-title {
      display: block;
      color: #2e3d4e;
      font-weight: 600;
      font-size: 22px;
      margin-top: 24px;
      margin-bottom: 24px;
    }
  }
}
</style>
