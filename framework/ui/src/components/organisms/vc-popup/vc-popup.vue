<template>
  <div class="vc-popup" :class="`vc-popup_${variant}`">
    <div class="vc-popup__wrapper">
      <div class="vc-popup__inner">
        <div class="vc-popup__header">
          <div
            class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0"
          >
            <slot name="title">{{ title }}</slot>
          </div>
          <VcIcon
            v-if="closable"
            class="vc-popup__header-icon"
            icon="fas fa-times"
            @click="$emit('close')"
          ></VcIcon>
        </div>

        <div class="vc-popup__content grow basis-0">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    default: undefined,
  },

  closable: {
    type: Boolean,
    default: true,
  },

  variant: {
    type: String,
    default: "fullscreen",
    enum: ["small", "medium", "fullscreen"],
  },
});

defineEmits(["close"]);
</script>

<style lang="scss">
.vc-popup {
  @apply fixed top-0 right-0 bottom-0 left-0 z-[9999] bg-[rgba(31,40,50,0.58)];

  &_small {
    .vc-popup__wrapper {
      @apply max-h-fit items-center flex grow-0 shrink-0 basis-auto [flex-direction:inherit] justify-center;
    }

    .vc-popup__inner {
      @apply max-w-[439px] w-full flex flex-col grow basis-0;
    }
  }

  &_medium {
    .vc-popup__wrapper {
      @apply max-h-[75vh];
    }
  }

  &_fullscreen {
    .vc-popup__wrapper {
      @apply max-h-[100vh];
    }
  }

  &__wrapper {
    @apply fixed top-2/4 -translate-y-2/4 right-0 bottom-0 left-0 flex grow shrink basis-auto flex-col h-full;

    .vc-app_phone & {
      @apply max-h-[100vh];
    }
  }

  &__inner {
    @apply grow shrink basis-auto m-[40px] box-border bg-white rounded-[5px] overflow-hidden relative flex flex-col grow basis-0;

    .vc-app_phone & {
      @apply m-0 rounded-none;
    }
  }

  &__header {
    @apply h-[44px] px-4 bg-[#eef5fa] flex shrink-0 items-center;

    &-icon {
      @apply cursor-pointer text-[#a1c0d4];
    }
  }
}
</style>
