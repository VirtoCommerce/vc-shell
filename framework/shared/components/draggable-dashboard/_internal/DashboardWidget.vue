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

// List of selectors for interactive elements that should not trigger dragging
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

// Check if the click was on an interactive element
const isInteractiveElement = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof Element)) return false;

  // Check if the element or its parents match the interactive element selector
  return interactiveSelectors.some((selector) => {
    return target.matches(selector) || !!target.closest(selector);
  });
};

// Mouse down handler
const handleWidgetMouseDown = (event: MouseEvent) => {
  // If the click was on an interactive element, do not start dragging
  if (isInteractiveElement(event.target)) {
    return;
  }

  // If the click was on an empty area, start dragging
  event.preventDefault();
  event.stopPropagation();

  // Emit the drag event
  emit("drag", event);
};

// Touch start handler
const handleWidgetTouchStart = (event: TouchEvent) => {
  // If the touch was on an interactive element, do not start dragging
  if (isInteractiveElement(event.target)) {
    return;
  }

  // If the touch was on an empty area, start dragging
  // Do not use preventDefault here, as we already use .passive
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
  --dashboard-widget-border-radius: 6px;

  --dashboard-widget-shadow-base: 0px 0px 6px -2px rgb(from var(--neutrals-950) r g b / 0.1);
  --dashboard-widget-shadow-elevated: 3px 9px 15px -3px rgb(from var(--neutrals-950) r g b / 0.08);
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
  box-shadow: var(--dashboard-widget-shadow-base), var(--dashboard-widget-shadow-elevated);
  transition:
    transform var(--dashboard-transition-duration) var(--dashboard-transition-timing),
    box-shadow 0.2s ease;

  &__content {
    @apply tw-w-full tw-h-full tw-rounded-md;
    overflow: hidden; /* Ensure nothing breaks out of the widget */
    position: relative;
    z-index: 1;
    height: 100%;
    pointer-events: all; /* Ensure content receives events */
  }
}
</style>
