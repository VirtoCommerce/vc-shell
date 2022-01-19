<template>
  <div
    class="vc-card vc-flex vc-flex-column"
    :class="[{ 'vc-card_collapsable': isCollapsable }, `vc-card_${variant}`]"
  >
    <div class="vc-card__header" v-if="header" @click="onHeaderClick">
      <vc-icon
        v-if="icon"
        class="vc-card__icon"
        :icon="icon"
        size="xl"
      ></vc-icon>
      <div class="vc-card__title">{{ header }}</div>
      <div v-if="$slots['actions']" class="vc-card__actions">
        <slot name="actions"></slot>
      </div>
      <vc-icon
        v-if="isCollapsable"
        class="vc-card__collapse"
        :icon="`fas fa-chevron-${isCollapsedInternal ? 'up' : 'down'}`"
        size="s"
      ></vc-icon>
    </div>
    <transition name="fade">
      <div
        :class="[{ 'vc-flex': fill }, 'vc-card__body']"
        v-show="!isCollapsedInternal"
      >
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  props: {
    header: {
      type: String,
      default: undefined,
    },

    icon: {
      type: String,
      default: undefined,
    },

    isCollapsable: {
      type: Boolean,
      default: false,
    },

    isCollapsed: {
      type: Boolean,
      default: false,
    },

    fill: {
      type: Boolean,
      default: false,
    },

    variant: {
      type: String,
      enum: ["default", "success", "danger"],
      default: "default",
    },
  },

  emits: ["header:click", "state:collapsed"],

  setup(props, { emit }) {
    const isCollapsedInternal = ref(props.isCollapsed);

    return {
      isCollapsedInternal,

      onHeaderClick() {
        if (props.isCollapsable) {
          isCollapsedInternal.value = !isCollapsedInternal.value;
          emit("state:collapsed", isCollapsedInternal.value);
        }
        emit("header:click");
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --card-background: #ffffff;
  --card-border: 1px solid #eef0f2;
  --card-border-radius: 6px;
  --card-box-shadow: 1px 1px 7px rgba(126, 142, 157, 0.15);
  --card-header-background: #f4f8fb;
  --card-header-color: #83a3be;
  --card-header-font-size: var(--font-size-m);
  --card-header-font-weight: var(--font-weight-bold);
  --card-header-padding: var(--padding-m) var(--padding-l);

  --card-header-background-success: #e9f7df;
  --card-header-background-danger: #ffe6e6;

  --card-header-color-success: #99c17a;
  --card-header-color-danger: #f34747;
}

.vc-card {
  background: var(--card-background);
  border: var(--card-border);
  box-sizing: border-box;
  box-shadow: var(--card-box-shadow);
  border-radius: var(--card-border-radius);
  overflow: hidden;
  flex-grow: 1;

  &__header {
    background: var(--card-header-background);
    padding: var(--card-header-padding);
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
  }

  &_collapsable &__header {
    cursor: pointer;
  }

  &__title {
    text-transform: uppercase;
    flex-grow: 1;
    color: var(--card-header-color);
    font-size: var(--card-header-font-size);
    font-weight: var(--card-header-font-weight);
  }

  &__icon {
    color: var(--card-header-color);
    margin-right: var(--margin-m);
  }

  &__collapse {
    color: var(--card-header-color);
    margin-left: var(--margin-m);
  }

  &__body {
    flex-grow: 1;
    box-sizing: border-box;
  }

  &_success {
    .vc-card__header {
      background: var(--card-header-background-success);
    }
    .vc-card__title {
      color: var(--card-header-color-success);
    }
  }
}
</style>
