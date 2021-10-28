<template>
  <div
    class="vc-button"
    :class="[
      `vc-button_${variant}`,
      {
        'vc-button_disabled': disabled,
        'vc-button_small': small,
        'vc-button_outline': outline,
      },
    ]"
    @click="onClick"
  >
    <vc-icon
      v-if="icon"
      class="vc-button__icon"
      :icon="icon"
      :size="small ? 'xs' : 's'"
    ></vc-icon>
    <div v-if="$slots['default']" class="vc-button__title">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcIcon from "../vc-icon/vc-icon.vue";

export default defineComponent({
  name: "VcButton",

  components: {
    VcIcon,
  },

  props: {
    icon: {
      type: String,
      default: undefined,
    },

    variant: {
      type: String,
      enum: ["primary", "secondary", "special"],
      default: "primary",
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    small: {
      type: Boolean,
      default: false,
    },

    outline: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["click"],

  setup(props, { emit }) {
    return {
      onClick(): void {
        if (!props.disabled) {
          emit("click");
        }
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --button-primary-background-color: #41afe6;
  --button-primary-background-color-hover: #319ed4;
  --button-primary-background-color-active: #319ed4;
  --button-primary-background-color-disabled: #a9ddf6;

  --button-primary-text-color: #ffffff;
  --button-primary-text-color-hover: #ffffff;
  --button-primary-text-color-active: #ffffff;
  --button-primary-text-color-disabled: #ffffff;

  --button-secondary-background-color: #ffffff;
  --button-secondary-background-color-hover: #ffffff;
  --button-secondary-background-color-active: #ffffff;
  --button-secondary-background-color-disabled: #ffffff;

  --button-secondary-border-color: #43b0e6;
  --button-secondary-border-color-hover: #319ed4;
  --button-secondary-border-color-active: #319ed4;
  --button-secondary-border-color-disabled: #a9ddf6;

  --button-secondary-text-color: #43b0e6;
  --button-secondary-text-color-hover: #319ed4;
  --button-secondary-text-color-active: #319ed4;
  --button-secondary-text-color-disabled: #a9ddf6;

  --button-special-background-color: #f89406;
  --button-special-background-color-hover: #eb8b03;
  --button-special-background-color-active: #eb8b03;
  --button-special-background-color-disabled: #fed498;

  --button-special-text-color: #ffffff;
  --button-special-text-color-hover: #ffffff;
  --button-special-text-color-active: #ffffff;
  --button-special-text-color-disabled: #ffffff;

  --button-border-radius: 3px;
  --button-padding: 0 14px;
  --button-padding-small: 0 12px;
  --button-height: 36px;
  --button-height-small: 22px;
}

.vc-button {
  border-radius: var(--button-border-radius);
  padding: var(--button-padding);
  height: var(--button-height);
  display: inline-flex;
  align-items: center;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-s);
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &__icon + &__title {
    margin-left: var(--margin-s);
  }

  &_primary {
    background-color: var(--button-primary-background-color);
    color: var(--button-primary-text-color);

    &:hover {
      background-color: var(--button-primary-background-color-hover);
      color: var(--button-primary-text-color-hover);
    }

    &:focus {
      background-color: var(--button-primary-background-color-active);
      color: var(--button-primary-text-color-active);
    }

    &.vc-button_disabled,
    &.vc-button_disabled:hover {
      cursor: not-allowed;
      background-color: var(--button-primary-background-color-disabled);
      color: var(--button-primary-text-color-disabled);
    }
  }

  &_secondary {
    background-color: var(--button-secondary-background-color);
    color: var(--button-secondary-text-color);
    border: 1px solid var(--button-secondary-border-color);

    &:hover {
      background-color: var(--button-secondary-background-color-hover);
      color: var(--button-secondary-text-color-hover);
      border: 1px solid var(--button-secondary-border-color-hover);
    }

    &:focus {
      background-color: var(--button-secondary-background-color-active);
      color: var(--button-secondary-text-color-hover);
      border: 1px solid var(--button-secondary-border-color-active);
    }

    &.vc-button_disabled,
    &.vc-button_disabled:hover {
      cursor: not-allowed;
      background-color: var(--button-secondary-background-color-disabled);
      color: var(--button-secondary-text-color-disabled);
      border: 1px solid var(--button-secondary-border-color-disabled);
    }
  }

  &_special {
    background-color: var(--button-special-background-color);
    color: var(--button-special-text-color);

    &:hover {
      background-color: var(--button-special-background-color-hover);
      color: var(--button-special-text-color-hover);
    }

    &:focus {
      background-color: var(--button-special-background-color-active);
      color: var(--button-special-text-color-active);
    }

    &.vc-button_disabled,
    &.vc-button_disabled:hover {
      cursor: not-allowed;
      background-color: var(--button-special-background-color-disabled);
      color: var(--button-special-text-color-disabled);
    }
  }

  &_small {
    height: var(--button-height-small);
    padding: var(--button-padding-small);
    font-weight: var(--font-weight-normal);
    font-size: var(--font-size-xs);

    .vc-button__icon + .vc-button__title {
      margin-left: var(--margin-xs);
    }
  }

  &_outline {
    background-color: transparent;
    color: var(--button-secondary-text-color);
    border: 1px solid var(--button-secondary-border-color);

    &:hover {
      background-color: transparent;
      color: var(--button-secondary-text-color-hover);
      border: 1px solid var(--button-secondary-border-color-hover);
    }

    &:focus {
      background-color: transparent;
      color: var(--button-secondary-text-color-hover);
      border: 1px solid var(--button-secondary-border-color-active);
    }

    &.vc-button_disabled,
    &.vc-button_disabled:hover {
      cursor: not-allowed;
      background-color: transparent;
      color: var(--button-secondary-text-color-disabled);
      border: 1px solid var(--button-secondary-border-color-disabled);
    }
  }
}
</style>
