<template>
  <div
    class="dashboard-widget"
    data-test="dashboard-widget"
    @mousedown="handleWidgetMouseDown"
    @touchstart.passive="handleWidgetTouchStart"
  >
    <component
      :is="widget.component"
      v-bind="widget.props || {}"
      class="dashboard-widget__content"
    />
  </div>
</template>

<script setup lang="ts">
import type { IDashboardWidget } from "../types";

interface Props {
  widget: IDashboardWidget;
}

defineProps<Props>();

// Список селекторов интерактивных элементов, на которых не должно срабатывать перетаскивание
const interactiveSelectors = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "label",
  '[role="button"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="tab"]',
  '[role="link"]',
];

// Проверяем, был ли клик на интерактивном элементе
const isInteractiveElement = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof Element)) return false;

  // Проверяем, соответствует ли элемент или его родители селектору интерактивного элемента
  return interactiveSelectors.some((selector) => {
    return target.matches(selector) || !!target.closest(selector);
  });
};

// Обработчик mousedown
const handleWidgetMouseDown = (event: MouseEvent) => {
  // Если клик был на интерактивном элементе, не начинаем перетаскивание
  if (isInteractiveElement(event.target)) {
    return;
  }

  // Если клик был на пустой области, запускаем перетаскивание
  event.preventDefault();
  event.stopPropagation();

  // Эмитим событие drag
  emit("drag", event);
};

// Обработчик touchstart
const handleWidgetTouchStart = (event: TouchEvent) => {
  // Если касание было на интерактивном элементе, не начинаем перетаскивание
  if (isInteractiveElement(event.target)) {
    return;
  }

  // Если касание было на пустой области, запускаем перетаскивание
  // Не используем preventDefault здесь, так как уже используем .passive
  emit("drag", event);
};

const emit = defineEmits<{
  (e: "drag", event: MouseEvent | TouchEvent): void;
}>();
</script>

<style lang="scss">
:root {
  --dashboard-transition-duration: 0.35s;
  --dashboard-transition-timing: cubic-bezier(0.25, 0.1, 0.25, 1);
  --dashboard-widget-shadow-color: rgb(from var(--additional-950) r g b / 0.08);
  --dashboard-widget-shadow-color-secondary: rgb(from var(--additional-950) r g b / 0.06);
  --dashboard-widget-shadow-active: 0px 6px 16px -2px rgb(from var(--additional-950) r g b / 0.12);
  --dashboard-widget-border-radius: 12px;
}

.dashboard-widget {
  @apply tw-rounded-md;
  border-radius: var(--dashboard-widget-border-radius);
  will-change: transform;
  touch-action: none; /* Prevent default browser touch actions */
  -webkit-tap-highlight-color: transparent; /* Remove tap highlight on mobile */
  user-select: none; /* Prevent text selection on drag */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  box-shadow:
    0px 1px 4px -1px var(--dashboard-widget-shadow-color),
    0px 4px 10px -2px var(--dashboard-widget-shadow-color-secondary);
  transition:
    transform var(--dashboard-transition-duration) var(--dashboard-transition-timing),
    box-shadow 0.2s ease;

  &:hover {
    @apply tw-cursor-move;
    transform: translateY(-2px);
    box-shadow: var(--dashboard-widget-shadow-active);
  }

  /* Активное состояние для касаний - более выраженный эффект */
  &:active {
    @apply tw-cursor-grabbing;
    transform: scale(1.02);
    box-shadow: var(--dashboard-widget-shadow-active);
  }

  &__content {
    @apply tw-w-full tw-h-full tw-rounded-md;
    border-radius: var(--dashboard-widget-border-radius);
    overflow: hidden; /* Ensure nothing breaks out of the widget */
    position: relative;
    z-index: 1;
    height: 100%;
    pointer-events: all; /* Ensure content receives events */
  }
}
</style>
