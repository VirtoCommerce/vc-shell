<template>
  <div
    class="vc-widget"
    :class="{ 'vc-widget_disabled': disabled }"
    @click="onClick"
  >
    <VcIcon
      v-if="icon"
      class="vc-widget__icon"
      :icon="icon"
      size="xxl"
    ></VcIcon>
    <div v-if="title" class="vc-widget__title">{{ title }}</div>
    <div v-if="value !== undefined" class="vc-widget__value">{{ value }}</div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  icon: {
    type: String,
    default: undefined,
  },

  title: {
    type: String,
    default: undefined,
  },

  value: {
    type: [String, Number],
    default: undefined,
  },

  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["click"]);

function onClick() {
  if (!props.disabled) {
    emit("click");
  }
}
</script>

<style lang="less">
.vc-widget {
  display: flex;
  width: 100px;
  overflow: hidden;
  padding: var(--padding-xl);
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eaedf3;
  cursor: pointer;
  background-color: #ffffff;

  &:hover {
    background-color: #eff7fc;
  }

  &_disabled {
    cursor: default;
  }

  &_disabled:hover {
    background-color: #ffffff;
  }

  &__icon {
    color: #a9bfd2;
  }

  &_disabled &__icon {
    color: #d2d4d7;
  }

  &__title {
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-s);
    color: #333333;
    margin: var(--margin-m) 0 var(--margin-xs);
  }

  &_disabled &__title {
    color: #d2d4d7;
  }

  &__value {
    font-weight: var(--font-weight-medium);
    font-size: 22px;
    color: #43b0e6;
  }

  &_disabled &__value {
    color: #d2d4d7;
  }
}
</style>
