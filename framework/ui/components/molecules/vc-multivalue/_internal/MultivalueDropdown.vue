<template>
  <teleport :to="teleportTarget" defer>
    <Transition name="multivalue-dropdown">
      <div
        v-if="isOpened"
        :id="listboxId"
        ref="dropdownElRef"
        v-on-click-outside="[() => emit('clickOutside'), { ignore: [dropdownToggleRef] }]"
        class="vc-multivalue__dropdown"
        role="listbox"
        :aria-label="ariaLabel"
        :style="dropdownStyle"
        @wheel="onDropdownWheel"
      >
        <input
          ref="searchInputRef"
          class="vc-multivalue__search"
          tabindex="0"
          aria-label="Search options"
          autocomplete="off"
          @input="emit('search', $event)"
          @keydown.space.stop
          @keydown.enter.stop
        />

        <!-- Scroll up button -->
        <div
          class="vc-multivalue__scroll-button"
          :class="{ 'tw-opacity-0 tw-pointer-events-none': !canScrollUp }"
          aria-hidden="true"
          @pointerenter="startScroll('up')"
          @pointerleave="stopScroll"
        >
          <VcIcon
            icon="lucide-chevron-up"
            size="xs"
          />
        </div>

        <!-- Scrollable viewport -->
        <div
          ref="viewportRef"
          class="vc-multivalue__viewport"
          @scroll="updateScrollState"
        >
          <div
            v-for="(item, i) in availableOptions"
            :key="i"
            class="vc-multivalue__item"
            tabindex="0"
            role="option"
            :data-index="i"
            @click="emit('select', item)"
          >
            <slot
              name="option"
              :item="item"
              :index="i"
            >
              {{ item[optionLabel as keyof typeof item] }}
            </slot>
          </div>

          <!-- No options message -->
          <div
            v-if="availableOptions.length === 0"
            class="vc-multivalue__no-options"
          >
            {{ $t("COMPONENTS.MOLECULES.VC_SELECT.NO_OPTIONS") }}
          </div>
        </div>

        <!-- Scroll down button -->
        <div
          class="vc-multivalue__scroll-button"
          :class="{ 'tw-opacity-0 tw-pointer-events-none': !canScrollDown }"
          aria-hidden="true"
          @pointerenter="startScroll('down')"
          @pointerleave="stopScroll"
        >
          <VcIcon
            icon="lucide-chevron-down"
            size="xs"
          />
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, watch, onBeforeUnmount, nextTick } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { VcIcon } from "./../../../";
import { useTeleportTarget } from "../../../../composables";

const props = defineProps<{
  isOpened: boolean;
  dropdownStyle: Record<string, string | undefined>;
  availableOptions: any[];
  optionLabel: string;
  ariaLabel: string;
  listboxId?: string;
  dropdownToggleRef: HTMLElement | null;
}>();

const emit = defineEmits<{
  select: [item: any];
  search: [event: Event];
  clickOutside: [];
}>();

defineSlots<{
  option: (scope: { item: any; index: number }) => any;
}>();

const dropdownElRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const viewportRef = ref<HTMLElement | null>(null);
const { teleportTarget } = useTeleportTarget();

// --- Scroll arrow state ---
const canScrollUp = ref(false);
const canScrollDown = ref(false);
let scrollAnimationId: number | null = null;

function updateScrollState() {
  const el = viewportRef.value;
  if (!el) {
    canScrollUp.value = false;
    canScrollDown.value = false;
    return;
  }
  canScrollUp.value = el.scrollTop > 0;
  canScrollDown.value = Math.ceil(el.scrollTop) < el.scrollHeight - el.clientHeight;
}

function startScroll(direction: "up" | "down") {
  stopScroll();
  const el = viewportRef.value;
  if (!el) return;

  const speed = 2; // px per frame (~120px/s at 60fps) — smooth shadcn-like
  function tick() {
    if (!el) return;
    el.scrollTop += direction === "up" ? -speed : speed;
    updateScrollState();
    scrollAnimationId = requestAnimationFrame(tick);
  }
  scrollAnimationId = requestAnimationFrame(tick);
}

function stopScroll() {
  if (scrollAnimationId !== null) {
    cancelAnimationFrame(scrollAnimationId);
    scrollAnimationId = null;
  }
}

function onDropdownWheel(event: WheelEvent) {
  const el = viewportRef.value;
  if (!el) return;

  const isInViewport = el.contains(event.target as Node);

  if (isInViewport) {
    // Native scroll handles viewport scrolling.
    // Only prevent page scroll at boundaries.
    const atTop = el.scrollTop <= 0 && event.deltaY < 0;
    const atBottom =
      Math.ceil(el.scrollTop) >= el.scrollHeight - el.clientHeight && event.deltaY > 0;
    if (atTop || atBottom) {
      event.preventDefault();
    }
  } else {
    // Cursor is on scroll buttons, search, or other non-viewport area —
    // forward the wheel event to the viewport manually.
    event.preventDefault();
    el.scrollTop += event.deltaY;
  }
  updateScrollState();
}

watch(
  () => props.isOpened,
  (opened) => {
    if (opened) {
      nextTick(updateScrollState);
    } else {
      stopScroll();
      canScrollUp.value = false;
      canScrollDown.value = false;
    }
  },
);

watch(
  () => props.availableOptions.length,
  () => {
    if (props.isOpened) {
      nextTick(updateScrollState);
    }
  },
);

onBeforeUnmount(() => {
  stopScroll();
});

defineExpose({
  dropdownElRef,
  searchInputRef,
  viewportRef,
});
</script>
