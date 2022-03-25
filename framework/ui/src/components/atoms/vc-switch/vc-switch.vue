<template>
  <div>
    <!-- Switch label -->
    <VcLabel v-if="label" class="vc-margin-bottom_s" :required="required">
      <span>{{ label }}</span>
    </VcLabel>
    <div class="vc-switch">
      <label>
        <input
          type="checkbox"
          class="vc-switch__input"
          :checked="modelValue"
          :disabled="disabled"
          @input="onInput"
        />
        <span class="vc-switch__slider"></span>
      </label>
      <VcHint class="vc-margin-top_s vc-switch__tooltip" v-if="tooltip">
        {{ tooltip }}
      </VcHint>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  tooltip: {
    type: String,
    default: "",
  },

  required: {
    type: Boolean,
    default: false,
  },

  label: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(["update:modelValue"]);

function onInput(e: InputEvent) {
  const newValue = (e.target as HTMLInputElement).checked;
  emit("update:modelValue", newValue);
}
</script>

<style lang="less">
:root {
  --switch-main-color: #43b0e6;
  --switch-secondary-color: #565656;
  --switch-transition: all 0.2s ease-in-out;
  --switch-icon-transition: opacity 0.3s ease-in-out;
  --switch-active-icon: url("data:image/svg+xml;utf8,<svg width='10' height='8' viewBox='0 0 10 8' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M3.73609 7.34288L0.161085 3.85628C-0.0536949 3.64681 -0.0536949 3.30718 0.161085 3.09769L0.938884 2.3391C1.15366 2.12961 1.50193 2.12961 1.71671 2.3391L4.125 4.68782L8.28329 0.657101C8.49807 0.447633 8.84634 0.447633 9.06112 0.657101L9.83892 1.41569C10.0537 1.62516 10.0537 1.96479 9.83892 2.17428L4.51391 7.3429C4.29911 7.55237 3.95087 7.55237 3.73609 7.34288Z' fill='white'/></svg>");
  --switch-disabled-icon: url("data:image/svg+xml;utf8,<svg width='8' height='8' viewBox='0 0 8 8' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M5.51636 4L7.79068 1.72568C8.06977 1.44659 8.06977 0.994091 7.79068 0.714773L7.28523 0.209318C7.00614 -0.0697727 6.55364 -0.0697727 6.27432 0.209318L4 2.48364L1.72568 0.209318C1.44659 -0.0697727 0.994091 -0.0697727 0.714773 0.209318L0.209318 0.714773C-0.0697727 0.993864 -0.0697727 1.44636 0.209318 1.72568L2.48364 4L0.209318 6.27432C-0.0697727 6.55341 -0.0697727 7.00591 0.209318 7.28523L0.714773 7.79068C0.993864 8.06977 1.44659 8.06977 1.72568 7.79068L4 5.51636L6.27432 7.79068C6.55341 8.06977 7.00614 8.06977 7.28523 7.79068L7.79068 7.28523C8.06977 7.00614 8.06977 6.55364 7.79068 6.27432L5.51636 4Z' fill='white'/></svg>");
}

.vc-switch {
  position: relative;
  display: inline-block;
  width: 54px;
  height: 18px;

  &__input {
    width: 0;
    height: 0;
    opacity: 0;

    &:checked + .vc-switch__slider:before {
      transform: translateX(29px);
    }

    &:checked + .vc-switch__slider {
      background-color: var(--switch-main-color);

      &:after {
        background-image: var(--switch-active-icon);
        background-position: 10px;
        background-size: 10px 7px;
      }
    }

    &:disabled + .vc-switch__slider {
      background-color: var(--switch-secondary-color);
    }
  }

  &__slider {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: var(--switch-secondary-color);
    border-radius: 3px;
    cursor: pointer;
    transition: var(--switch-transition);

    &:after {
      display: inline-block;
      width: 100%;
      height: 100%;
      background-image: var(--switch-disabled-icon);
      background-position: calc(100% - 11px);
      background-repeat: no-repeat;
      background-size: 8px 8px;
      content: "";
    }

    &:before {
      position: absolute;
      bottom: 1px;
      left: 1px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 23px;
      height: 16px;
      background-color: #fff;
      border-radius: 2px;
      color: #d2d2d2;
      font-size: 10px;
      transition: var(--switch-transition);
      content: "|||";
    }
  }

  &__tooltip {
    width: max-content;
  }
}
</style>
