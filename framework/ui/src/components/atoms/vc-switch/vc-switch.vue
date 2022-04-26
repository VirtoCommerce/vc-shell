<template>
  <div>
    <!-- Switch label -->
    <VcLabel v-if="label" class="mb-s" :required="required">
      <span>{{ label }}</span>
    </VcLabel>
    <div class="relative inline-block w-[54px] h-[18px]">
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
      <VcHint class="mt-s w-max" v-if="tooltip">
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

<style lang="scss">
:root {
  --switch-main-color: #43b0e6;
  --switch-secondary-color: #565656;
  --switch-transition: all 0.2s ease-in-out;
  --switch-icon-transition: opacity 0.3s ease-in-out;
  --switch-active-icon: url("data:image/svg+xml;utf8,<svg width='10' height='8' viewBox='0 0 10 8' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M3.73609 7.34288L0.161085 3.85628C-0.0536949 3.64681 -0.0536949 3.30718 0.161085 3.09769L0.938884 2.3391C1.15366 2.12961 1.50193 2.12961 1.71671 2.3391L4.125 4.68782L8.28329 0.657101C8.49807 0.447633 8.84634 0.447633 9.06112 0.657101L9.83892 1.41569C10.0537 1.62516 10.0537 1.96479 9.83892 2.17428L4.51391 7.3429C4.29911 7.55237 3.95087 7.55237 3.73609 7.34288Z' fill='white'/></svg>");
  --switch-disabled-icon: url("data:image/svg+xml;utf8,<svg width='8' height='8' viewBox='0 0 8 8' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M5.51636 4L7.79068 1.72568C8.06977 1.44659 8.06977 0.994091 7.79068 0.714773L7.28523 0.209318C7.00614 -0.0697727 6.55364 -0.0697727 6.27432 0.209318L4 2.48364L1.72568 0.209318C1.44659 -0.0697727 0.994091 -0.0697727 0.714773 0.209318L0.209318 0.714773C-0.0697727 0.993864 -0.0697727 1.44636 0.209318 1.72568L2.48364 4L0.209318 6.27432C-0.0697727 6.55341 -0.0697727 7.00591 0.209318 7.28523L0.714773 7.79068C0.993864 8.06977 1.44659 8.06977 1.72568 7.79068L4 5.51636L6.27432 7.79068C6.55341 8.06977 7.00614 8.06977 7.28523 7.79068L7.79068 7.28523C8.06977 7.00614 8.06977 6.55364 7.79068 6.27432L5.51636 4Z' fill='white'/></svg>");
}

.vc-switch {
  &__input {
    @apply w-0 h-0 opacity-0;

    &:checked + .vc-switch__slider:before {
      @apply translate-x-[29px];
    }

    &:checked + .vc-switch__slider {
      @apply bg-[color:var(--switch-main-color)] after:bg-[image:var(--switch-active-icon)] after:bg-[position:10px] after:bg-[length:10px_7px];
    }

    &:disabled + .vc-switch__slider {
      @apply bg-[color:var(--switch-secondary-color)];
    }
  }

  &__slider {
    @apply absolute top-0 right-0 bottom-0 left-0 bg-[color:var(--switch-secondary-color)] rounded-[3px] cursor-pointer transition duration-200;

    &:after {
      @apply inline-block w-full h-full bg-[image:var(--switch-disabled-icon)] bg-[position:calc(100%-11px)] bg-no-repeat bg-[length:8px_8px] content-[""];
    }

    &:before {
      @apply absolute bottom-px left-px flex justify-center items-center w-[23px] h-[16px] bg-white rounded-sm text-[color:#d2d2d2] text-[10px] transition duration-200 content-["|||"];
    }
  }
}
</style>
