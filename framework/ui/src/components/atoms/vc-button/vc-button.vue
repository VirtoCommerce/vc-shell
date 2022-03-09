<template>
  <div
    class="vc-button"
    :class="[
      `vc-button_${variant}`,
      {
        'vc-button_disabled': disabled,
        'vc-button_small': small,
        'vc-button_outline': outline,
        'vc-button_selected': selected,
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

export default defineComponent({
  name: "VcButton",
});
</script>

<script lang="ts" setup>
import VcIcon from "../vc-icon/vc-icon.vue";

const props = defineProps({
  icon: {
    type: String,
    default: undefined,
  },

  variant: {
    type: String,
    enum: ["primary", "secondary", "special", "danger", "widget"],
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

  selected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

function onClick(): void {
  if (!props.disabled) {
    emit("click");
  }
}
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

  --button-danger-background-color: #ff4a4a;
  --button-danger-background-color-hover: #d73a3a;
  --button-danger-background-color-active: #d73a3a;
  --button-danger-background-color-disabled: #ff5e5e;

  --button-special-text-color: #ffffff;
  --button-special-text-color-hover: #ffffff;
  --button-special-text-color-active: #ffffff;
  --button-special-text-color-disabled: #ffffff;

  --button-widget-background-color: #ffffff;
  --button-widget-background-color-hover: #f2faff;
  --button-widget-background-color-active: #eaf6ff;
  --button-widget-background-color-disabled: #fafafa;

  --button-widget-border-color: #eaedf3;
  --button-widget-border-color-hover: #d3e2ec;
  --button-widget-border-color-active: #deecf4;

  --button-border-radius: 3px;
  --button-padding: 0 14px;
  --button-padding-small: 0 12px;
  --button-height: 36px;
  --button-height-small: 28px;
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
    border: 1px solid var(--button-primary-background-color);

    &:hover {
      background-color: var(--button-primary-background-color-hover);
      color: var(--button-primary-text-color-hover);
      border: 1px solid var(--button-primary-background-color-hover);
    }

    &:focus {
      background-color: var(--button-primary-background-color-active);
      color: var(--button-primary-text-color-active);
      border: 1px solid var(--button-primary-background-color-active);
    }

    &.vc-button_disabled,
    &.vc-button_disabled:hover {
      cursor: not-allowed;
      background-color: var(--button-primary-background-color-disabled);
      color: var(--button-primary-text-color-disabled);
      border: 1px solid var(--button-primary-background-color-disabled);
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
    border: 1px solid var(--button-special-background-color);

    &:hover {
      background-color: var(--button-special-background-color-hover);
      color: var(--button-special-text-color-hover);
      border: 1px solid var(--button-special-background-color-hover);
    }

    &:focus {
      background-color: var(--button-special-background-color-active);
      color: var(--button-special-text-color-active);
      border: 1px solid var(--button-special-background-color-active);
    }

    &.vc-button_disabled,
    &.vc-button_disabled:hover {
      cursor: not-allowed;
      background-color: var(--button-special-background-color-disabled);
      color: var(--button-special-text-color-disabled);
      border: 1px solid var(--button-special-background-color-disabled);
    }
  }

  &_danger {
    background-color: var(--button-danger-background-color);
    color: var(--button-special-text-color);
    border: 1px solid var(--button-danger-background-color);

    &:hover {
      background-color: var(--button-danger-background-color-hover);
      color: var(--button-special-text-color-hover);
      border: 1px solid var(--button-danger-background-color-hover);
    }

    &:focus {
      background-color: var(--button-danger-background-color-active);
      color: var(--button-special-text-color-active);
      border: 1px solid var(--button-danger-background-color-active);
    }

    &.vc-button_disabled,
    &.vc-button_disabled:hover {
      cursor: not-allowed;
      background-color: var(--button-danger-background-color-disabled);
      color: var(--button-special-text-color-disabled);
      border: 1px solid var(--button-danger-background-color-disabled);
    }

    .color-scheme-outline(
            var(--button-danger-background-color),
            var(--button-danger-background-color),
            var(--button-danger-background-color-hover),
            var(--button-danger-background-color-hover),
            var(--button-danger-background-color-active),
            var(--button-danger-background-color-disabled),
            var(--button-danger-background-color-disabled));
  }

  &_widget {
    height: auto;
    border: var(--button-widget-border-color);
    box-shadow: 1px 4px 10px rgba(197, 206, 214, 0.24);
    border-radius: 4px;
    padding: 15px;

    .vc-button__icon {
      font-size: 30px;
      color: #a9bfd2;
    }

    &:hover {
      background-color: var(--button-widget-background-color-hover);
      border: 1px solid var(--button-widget-background-color-hover);
      border: var(--button-widget-border-color-hover);
    }

    &:focus {
      background-color: var(--button-widget-background-color-active);
      border: 1px solid var(--button-widget-background-color-active);
      border: var(--button-widget-border-color-active);
    }

    &.vc-button_disabled,
    &.vc-button_disabled:hover {
      cursor: not-allowed;
      background-color: var(--button-widget-background-color-disabled);
      border: 1px solid var(--button-widget-background-color-disabled);
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

  &_onlytext {
    color: var(--button-secondary-text-color);
    padding: 0;
    border: none;
    background-color: transparent;
    height: auto;

    &:hover {
      background-color: transparent;
      color: var(--button-secondary-text-color-hover);
    }

    &:focus {
      background-color: transparent;
      color: var(--button-secondary-text-color-hover);
    }
  }

  &_selected {
    &.vc-button_widget {
      background-color: var(--button-widget-background-color-hover);
    }
  }

  .color-scheme-outline(
    @text-color,
    @border_color,
    @text-color-hover,
    @border-color-hover,
    @border-color-active,
    @text-color-disabled,
    @border-color-disabled) {
    &.vc-button_outline {
      background-color: transparent;
      color: @text-color;
      border: 1px solid @border_color;

      &:hover {
        background-color: transparent;
        color: @text-color-hover;
        border: 1px solid @border-color-hover;
      }

      &:focus {
        background-color: transparent;
        color: @text-color-hover;
        border: 1px solid @border-color-active;
      }

      &.vc-button_disabled,
      &.vc-button_disabled:hover {
        cursor: not-allowed;
        background-color: transparent;
        color: @text-color-disabled;
        border: 1px solid @border-color-disabled;
      }
    }
  }
}
</style>
