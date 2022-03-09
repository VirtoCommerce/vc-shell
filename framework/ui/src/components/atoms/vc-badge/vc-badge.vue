<template>
  <div
    class="vc-badge"
    :class="{
      'vc-badge_active': active,
      'vc-badge_clickable': clickable,
      'vc-badge_disabled': disabled,
    }"
    @click="onClick"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  clickable: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["click"]);

function onClick(): void {
  if (props.clickable && !props.disabled) {
    emit("click");
  }
}
</script>

<style lang="less">
:root {
  --badge-padding: 4px 8px;

  --badge-font-size: var(--font-size-m);
  --badge-font-weight: var(--font-weight-normal);

  --badge-background-color: #ffffff;
  --badge-background-color-hover: #fafafa;
  --badge-background-color-active: #fafafa;
  --badge-background-color-disabled: #f2f2f2;

  --badge-text-color: #455668;
  --badge-text-color-hover: #3b4959;
  --badge-text-color-active: #3b4959;
  --badge-text-color-disabled: #8296ab;

  --badge-border-radius: 35px;
  --badge-border-width: 1px;

  --badge-border-color: #a1bfd4;
  --badge-border-color-hover: #8fb3cc;
  --badge-border-color-active: #8fb3cc;
  --badge-border-color-disabled: #b2cbdc;
}

.vc-badge {
  display: inline-block;
  border-radius: var(--badge-border-radius);
  padding: var(--badge-padding);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  background-color: var(--badge-background-color);
  color: var(--badge-text-color);
  border: var(--badge-border-width) solid var(--badge-border-color);
  transition: all 0.2s ease;

  &_clickable {
    cursor: pointer;

    &:hover {
      background-color: var(--badge-background-color-hover);
      color: var(--badge-text-color-hover);
      border: var(--badge-border-width) solid var(--badge-border-color-hover);
    }
  }

  &_active {
    background-color: var(--badge-background-color-active);
    color: var(--badge-text-color-active);
    border: var(--badge-border-width) solid var(--badge-border-color-active);
  }

  &_disabled,
  &_disabled:hover {
    cursor: not-allowed;
    background-color: var(--badge-background-color-disabled);
    color: var(--badge-text-color-disabled);
    border: var(--badge-border-width) solid var(--badge-border-color-disabled);
  }
}
</style>
