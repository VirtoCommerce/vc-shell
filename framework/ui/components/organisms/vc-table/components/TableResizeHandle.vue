<template>
  <div
    ref="handleRef"
    class="vc-table-composition__resize-handle"
    :class="{ 'vc-table-composition__resize-handle--resizing': isResizing }"
    @mousedown.stop.prevent="handleMouseDown"
    @touchstart.stop.prevent="handleTouchStart"
  >
    <div class="vc-table-composition__resize-handle-bar" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  /**
   * Column ID being resized
   */
  columnId?: string;
}>();

const emit = defineEmits<{
  /** Emitted when resize operation starts */
  resizeStart: [columnId: string | undefined, startX: number];
  /** Emitted during resize with delta from start position */
  resizeMove: [deltaX: number];
  /** Emitted when resize operation ends */
  resizeEnd: [];
}>();

const handleRef = ref<HTMLElement>();
const isResizing = ref(false);
let startX = 0;
let currentX = 0;

const handleMouseDown = (event: MouseEvent) => {
  startResize(event.pageX);

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.value) {
      currentX = e.pageX;
      const delta = currentX - startX;
      emit("resizeMove", delta);
    }
  };

  const handleMouseUp = () => {
    endResize();
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const handleTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0];
  startResize(touch.pageX);

  const handleTouchMove = (e: TouchEvent) => {
    if (isResizing.value) {
      const touch = e.touches[0];
      currentX = touch.pageX;
      const delta = currentX - startX;
      emit("resizeMove", delta);
    }
  };

  const handleTouchEnd = () => {
    endResize();
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  };

  document.addEventListener("touchmove", handleTouchMove);
  document.addEventListener("touchend", handleTouchEnd);
};

const startResize = (pageX: number) => {
  isResizing.value = true;
  startX = pageX;
  currentX = pageX;
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  emit("resizeStart", props.columnId, startX);
};

const endResize = () => {
  isResizing.value = false;
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
  emit("resizeEnd");
};
</script>

<style lang="scss">
.vc-table-composition__resize-handle {
  @apply tw-absolute tw-top-0 tw-right-0 tw-h-full tw-cursor-col-resize tw-z-10;
  @apply tw-flex tw-items-center tw-justify-center;

  // Wider hit area for easier interaction (8px total)
  width: 8px;
  margin-right: -4px;

  &:hover &-bar,
  &--resizing &-bar {
    opacity: 1;
    background-color: var(--primary-500);
  }

  &-bar {
    @apply tw-h-full tw-transition-all;
    width: 2px;
    background-color: var(--table-resizer-color, var(--neutrals-300));
    opacity: 0;
  }

  // Show on table row hover
  .vc-table-composition__row:hover & &-bar {
    opacity: 0.5;
  }
}
</style>
