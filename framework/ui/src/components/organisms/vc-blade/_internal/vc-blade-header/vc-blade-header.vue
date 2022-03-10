<template>
  <div class="vc-blade-header vc-flex-shrink_0">
    <div v-if="icon" class="vc-blade-header__icon">
      <VcIcon :icon="icon" size="xxl"></VcIcon>
    </div>

    <div class="vc-blade-header__info vc-flex-grow_1">
      <div
        class="vc-blade-header__title vc-ellipsis"
        :class="{ 'vc-blade-header__title_only': !subtitle }"
      >
        {{ title }}
      </div>
      <div v-if="subtitle" class="vc-blade-header__subtitle">
        {{ subtitle }}
      </div>
    </div>

    <div v-if="$slots['actions']" class="vc-blade-header__actions">
      <slot name="actions"></slot>
    </div>

    <div
      v-if="!$isMobile.value"
      class="vc-blade-header__buttons vc-flex vc-flex-align_center"
    >
      <template v-if="expandable">
        <div
          v-if="expanded"
          class="vc-blade-header__button"
          @click="onCollapse"
        >
          <VcIcon icon="fas fa-window-minimize" size="s"></VcIcon>
        </div>
        <div v-else class="vc-blade-header__button" @click="onExpand">
          <VcIcon icon="fas fa-window-maximize" size="s"></VcIcon>
        </div>
      </template>
      <div v-if="closable" class="vc-blade-header__button" @click="onClose">
        <VcIcon icon="fas fa-times"></VcIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import VcIcon from "../../../../atoms/vc-icon/vc-icon.vue";

const props = defineProps({
  expandable: {
    type: Boolean,
    default: false,
  },

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
});

const emit = defineEmits(["close", "expand", "collapse"]);

function onExpand(): void {
  if (props.expandable) {
    emit("expand");
  }
}

function onCollapse(): void {
  if (props.expandable) {
    emit("collapse");
  }
}

function onClose(): void {
  if (props.closable) {
    emit("close");
  }
}
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
  border-bottom: 1px solid #eaedf3;

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

  &__info {
    overflow: hidden;
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
