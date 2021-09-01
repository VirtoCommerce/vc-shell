<template>
  <div class="vc-blade-header vc-flex-shrink_0">
    <div v-if="icon" class="vc-blade-header__icon">
      <vc-icon :icon="icon" size="xxl"></vc-icon>
    </div>

    <div class="vc-blade-header__info vc-flex-grow_1">
      <div
        class="vc-blade-header__title"
        :class="{ 'vc-blade-header__title_only': !subtitle }"
      >
        {{ title }}
      </div>
      <div v-if="subtitle" class="vc-blade-header__subtitle">
        {{ subtitle }}
      </div>
    </div>

    <div v-if="$slots['filters']" class="vc-blade-header__filters">
      <slot name="filters"></slot>
    </div>

    <div class="vc-blade-header__buttons vc-flex vc-flex-align_center">
      <div v-if="expanded" class="vc-blade-header__button" @click="onCollapse">
        <vc-icon icon="fas fa-window-minimize" size="s"></vc-icon>
      </div>
      <div v-else class="vc-blade-header__button" @click="onExpand">
        <vc-icon icon="fas fa-window-maximize" size="s"></vc-icon>
      </div>
      <div
        class="vc-blade-header__button"
        :class="{ 'vc-blade-header__button_disabled': !closable }"
        @click="onClose"
      >
        <vc-icon icon="fas fa-times"></vc-icon>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";

export default defineComponent({
  components: {
    VcIcon,
  },

  props: {
    expanded: {
      type: Boolean,
      default: false,
    },

    closable: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      default: undefined,
    },

    subtitle: {
      type: String,
      default: undefined,
    },

    icon: {
      type: String,
      default: undefined,
    },
  },

  emits: ["close", "expand", "collapse"],

  setup(props, { emit }) {
    return {
      onExpand(): void {
        emit("expand");
      },

      onCollapse(): void {
        emit("collapse");
      },

      onClose(): void {
        if (props.closable) {
          emit("close");
        }
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --blade-header-height: 50px;
  --blade-header-background-color: #ffffff;

  --blade-header-button-color: #a1c0d4;
  --blade-header-button-color-hover: #7ea8c4;
  --blade-header-button-color-disabled: #d5e3ec;

  --blade-header-icon-color: #a1c0d4;

  --blade-header-title-font-size: 19px;
  --blade-header-title-color: #2e3d4e;

  --blade-header-subtitle-color: #a1c0d4;
}

.vc-blade-header {
  height: var(--blade-header-height);
  background-color: var(--blade-header-background-color);
  display: flex;
  align-items: center;
  padding: 0 var(--padding-l);

  &__button {
    color: var(--blade-header-button-color);
    margin-left: var(--margin-l);
    cursor: pointer;

    &:hover {
      color: var(--blade-header-button-color-hover);
    }

    &_disabled,
    &_disabled:hover {
      color: var(--blade-header-button-color-disabled);
      cursor: not-allowed;
    }
  }

  &__icon {
    color: var(--blade-header-icon-color);
    margin-right: var(--margin-m);
  }

  &__title {
    color: var(--blade-header-title-color);
    font-size: var(--font-size-l);

    &_only {
      font-size: var(--blade-header-title-font-size);
      font-weight: var(--font-weight-medium);
    }
  }

  &__subtitle {
    color: var(--blade-header-subtitle-color);
    font-size: var(--font-size-xs);
    margin-top: var(--margin-xs);
  }
}
</style>
