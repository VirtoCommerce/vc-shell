<template>
  <div
    class="sidebar-collapse-button"
    @click="$emit('click')"
  >
    <div class="sidebar-collapse-button__wrap">
      <Transition name="rotate">
        <VcIcon
          class="sidebar-collapse-button__icon"
          :icon="collapsed ? 'lucide-chevron-right' : 'lucide-chevron-left'"
        />
      </Transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "../../../../";

defineProps<{
  collapsed?: boolean;
}>();

defineEmits<{
  (event: "click"): void;
}>();
</script>

<style lang="scss">
.sidebar-collapse-button {
  @apply tw-absolute tw-right-[-13px] tw-top-[50%] tw-translate-y-[-50%]
    tw-flex tw-items-center tw-justify-center tw-cursor-pointer tw-z-[12];
  width: var(--app-bar-collapse-button-width);
  height: var(--app-bar-collapse-button-height);
  border-radius: var(--app-bar-collapse-button-border-radius);
  background-color: var(--app-bar-background);
  border: 1px solid var(--app-bar-border);
  opacity: 0;
  transition: opacity var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function);

  &__wrap {
    @apply tw-flex tw-items-center tw-justify-center;
  }

  &__icon {
    color: var(--app-bar-button);
  }
}

.rotate-enter-active,
.rotate-leave-active {
  transition: transform var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function);
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
