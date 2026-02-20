<template>
  <teleport :to="teleportTarget" defer>
    <Transition name="select-dropdown">
      <div
        v-if="isOpened"
        ref="dropdownElRef"
        v-on-click-outside="[() => emit('clickOutside'), { ignore: [dropdownToggleRef] }]"
        :id="listboxId"
        data-test-id="dropdown"
        class="vc-select__dropdown"
        role="listbox"
        :aria-label="ariaLabel"
        :style="dropdownStyle"
        @wheel="onDropdownWheel"
      >
        <input
          v-if="searchable"
          ref="searchInputRef"
          class="vc-select__search-input"
          tabindex="0"
          aria-label="Search options"
          autocomplete="off"
          @input="emit('input', $event)"
          @keydown.space.stop
          @keydown.enter.stop
        />

        <VcScrollableContainer
          ref="scrollContainerRef"
          class="vc-select__scroll-container"
        >
          <!-- Render existing options -->
          <div
            v-for="(item, i) in optionScope"
            :key="i"
            class="vc-select__option"
            data-test-id="option"
            role="option"
            :aria-selected="item.selected"
            :class="{ 'vc-select__option--selected': item.selected }"
            tabindex="0"
            :data-index="i"
            @click="item.toggleOption(item.opt)"
            @keydown.enter="item.toggleOption(item.opt)"
            @keydown.space="item.toggleOption(item.opt)"
          >
            <slot
              name="option"
              v-bind="item"
            >{{ item.label }}</slot>
            <span
              v-if="item.selected"
              class="vc-select__check-icon"
            >
              <VcIcon
                icon="lucide-check"
                size="xs"
              />
            </span>
          </div>

          <!-- Loading Indicator (Initial or More) -->
          <div
            v-if="listLoading"
            class="vc-select__list-loading-indicator"
          >
            <VcIcon
              icon="lucide-loader-2"
              class="tw-animate-spin"
              size="m"
            />
            <span>
              {{
                optionsListLength > 0
                  ? t("COMPONENTS.MOLECULES.VC_SELECT.LOADING_MORE")
                  : t("COMPONENTS.MOLECULES.VC_SELECT.LOADING")
              }}
            </span>
          </div>

          <!-- Show "No options" message -->
          <div
            v-if="!listLoading && !optionsListLength"
            class="vc-select__no-options"
          >
            <slot name="no-options">
              <span class="vc-select__no-options-text">{{ t("COMPONENTS.MOLECULES.VC_SELECT.NO_OPTIONS") }}</span>
            </slot>
          </div>

          <!-- Intersection observer target for loading more -->
          <span
            v-if="hasNextPage && !listLoading"
            ref="loadMoreRef"
            class="vc-select__load-more-trigger"
          ></span>
        </VcScrollableContainer>
      </div>
    </Transition>
  </teleport>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { VcIcon, VcScrollableContainer } from "@ui/components";
import { useI18n } from "vue-i18n";
import { useTeleportTarget } from "@ui/composables";

const props = defineProps<{
  isOpened: boolean;
  listboxId: string;
  ariaLabel: string;
  dropdownStyle: Record<string, string | undefined>;
  searchable?: boolean;
  optionScope: {
    index: number;
    opt: any;
    selected: boolean;
    label: any;
    toggleOption: (opt: any) => void;
  }[];
  listLoading: boolean;
  optionsListLength: number;
  hasNextPage: boolean;
  dropdownToggleRef: HTMLElement | null;
}>();

const emit = defineEmits<{
  input: [event: Event];
  clickOutside: [];
}>();

defineSlots<{
  option: (scope: {
    index: number;
    opt: any;
    selected: boolean;
    label: any;
    toggleOption: (opt: any) => void;
  }) => any;
  "no-options": (props: any) => any;
}>();

const { t } = useI18n({ useScope: "global" });
const { teleportTarget } = useTeleportTarget();

const dropdownElRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const scrollContainerRef = ref<InstanceType<typeof VcScrollableContainer> | null>(null);
const loadMoreRef = ref<HTMLElement | null>(null);

const viewportRef = computed<HTMLElement | null>(() => scrollContainerRef.value?.viewportRef ?? null);

function onDropdownWheel(event: WheelEvent) {
  const el = viewportRef.value;
  if (!el) return;

  const isInViewport = el.contains(event.target as Node);

  if (isInViewport) {
    const atTop = el.scrollTop <= 0 && event.deltaY < 0;
    const atBottom =
      Math.ceil(el.scrollTop) >= el.scrollHeight - el.clientHeight && event.deltaY > 0;
    if (atTop || atBottom) {
      event.preventDefault();
    }
  } else {
    event.preventDefault();
    el.scrollTop += event.deltaY;
  }
  scrollContainerRef.value?.updateScrollState();
}

watch(
  () => props.isOpened,
  (opened) => {
    if (opened) {
      nextTick(() => scrollContainerRef.value?.updateScrollState());
    }
  },
);

watch(
  () => props.optionScope.length,
  () => {
    if (props.isOpened) {
      nextTick(() => scrollContainerRef.value?.updateScrollState());
    }
  },
);

defineExpose({
  dropdownElRef,
  searchInputRef,
  viewportRef,
  loadMoreRef,
});
</script>
