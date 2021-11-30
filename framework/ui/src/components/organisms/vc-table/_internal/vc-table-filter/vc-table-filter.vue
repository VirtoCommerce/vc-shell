<template>
  <div class="vc-table-filter">
    <!-- Filter button -->
    <div class="vc-table-filter__button" @click="openPanel" ref="filterToggle">
      <vc-icon icon="fas fa-filter" size="m" />
      <span v-if="title" class="vc-table-filter__button-title">
        {{ title }}
      </span>
      <div v-if="counter" class="vc-table-filter__button-counter">
        {{ counter }}
      </div>
    </div>

    <!-- Filter panel -->
    <teleport to="body">
      <div
        class="vc-table-filter__panel"
        v-if="isPanelVisible"
        @click.self="closePanel"
        ref="filterPanel"
      >
        <div
          class="vc-table-filter__panel-inner vc-padding_xl vc-flex vc-flex-column"
          @click.stop
        >
          <vc-icon
            class="vc-table-filter__panel-close vc-flex-shrink_0"
            icon="fas fa-times"
            size="xl"
            @click="closePanel"
          />

          <slot></slot>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, ref, watch, inject } from "vue";
import { clickOutside } from "../../../../../directives";
import { createPopper, Instance } from "@popperjs/core";
import { useFunctions } from "@virtoshell/core";

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
    const { delay } = useFunctions();
    const isPanelVisible = ref(false);
    const filterToggle = ref();
    const filterPanel = ref();
    const popper = ref<Instance>();
    const workspace = inject("workspace");

    watch(
      () => workspace,
      () => {
        delay(() => popper.value?.update(), 400);
      },
      { deep: true }
    );

    function openPanel() {
      isPanelVisible.value = !isPanelVisible.value;
      const element = document.querySelector(".vc-blade");
      if (isPanelVisible.value) {
        nextTick(() => {
          popper.value = createPopper(filterToggle.value, filterPanel.value, {
            placement: "bottom-end",
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  boundary: element,
                },
              },
            ],
          });
        });
      } else {
        destroyPopper();
      }
    }

    function closePanel() {
      isPanelVisible.value = false;
      destroyPopper();
    }

    function destroyPopper() {
      // To prevent memory leaks Popper needs to be destroyed.
      popper.value?.destroy();
    }

    return {
      isPanelVisible,
      filterToggle,
      filterPanel,
      openPanel,
      closePanel,
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
    //right: 0;
    //top: 20%;
    max-height: 400px;
    max-width: 800px;
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
      align-self: flex-end;
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

    &-close {
      align-self: flex-start;
    }
  }
}
</style>
