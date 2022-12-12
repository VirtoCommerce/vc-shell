<template>
  <div
    class="vc-gallery-item"
    :class="{
      'vc-gallery-item_readonly': readonly,
      'vc-gallery-item_hover': hover,
    }"
    @tap.stop="hover = !hover"
    v-click-outside="onClose"
  >
    <VcImage aspect="1x1" :src="image.url" background="contain"></VcImage>
    <div class="vc-gallery-item__overlay">
      <div class="flex">
        <VcIcon
          v-if="!readonly && !disableDrag"
          class="vc-gallery-item__move"
          icon="fas fa-arrows-alt"
          size="s"
        ></VcIcon>
        <div class="truncate" :title="image.name">
          {{ image.name }}
        </div>
      </div>
      <div class="flex grow basis-0 items-center justify-around">
        <div
          class="vc-gallery-item__button"
          @click="$emit('preview', image)"
          v-if="actions && actions.preview"
        >
          <VcIcon
            class="vc-gallery-item__button-icon"
            icon="fas fa-eye"
          ></VcIcon>
          <div class="mt-2">Fullscreen</div>
        </div>
        <div
          v-if="!readonly && actions && actions.edit"
          class="vc-gallery-item__button"
          @click="$emit('edit', image)"
        >
          <VcIcon
            class="vc-gallery-item__button-icon"
            icon="fas fa-pen"
          ></VcIcon>
          <div class="mt-2">Edit</div>
        </div>
        <div
          v-if="!readonly && actions && actions.remove"
          class="vc-gallery-item__button"
          @click="$emit('remove', image)"
        >
          <VcIcon
            class="vc-gallery-item__button-icon"
            icon="fas fa-trash"
          ></VcIcon>
          <div class="mt-2">Delete</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { clickOutside as vClickOutside } from "@/core/directives";

defineProps({
  image: {
    type: Object,
    default: () => ({}),
  },

  readonly: {
    type: Boolean,
    default: false,
  },

  actions: {
    type: Object,
    default: () => ({}),
  },

  disableDrag: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["preview", "edit", "remove"]);

const hover = ref(false);

function onClose() {
  hover.value = false;
}
</script>

<style lang="scss">
.vc-gallery-item {
  @apply relative w-[155px] h-[155px] box-border border border-solid border-[#d3dae9] rounded-md p-1;

  &__overlay {
    @apply bg-[rgba(238,246,252,0.97)] flex-col p-2 opacity-0 flex absolute left-0 top-0 right-0 bottom-0 transition duration-200;
  }

  &:hover &__overlay,
  .vc-app_touch &_hover &__overlay {
    @apply opacity-100;
  }

  &__move {
    @apply text-[#a1c0d4] cursor-pointer mr-2;
  }

  &__button {
    @apply cursor-pointer flex flex-col items-center;

    &-icon {
      @apply text-[#319ed4];
    }
  }
}
</style>
