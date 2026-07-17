<template>
  <VcPopover
    :show="open"
    :anchor-ref="anchorEl"
    :title="$t('VC_SCHEDULER.NEW_EVENT')"
    placement="bottom-start"
    :content-scrollable="false"
    @update:show="onShowChange"
  >
    <div class="vc-scheduler__quick-create">
      <VcInput
        ref="titleInputRef"
        :model-value="title"
        :placeholder="$t('VC_SCHEDULER.TITLE')"
        data-test="qc-title"
        @update:model-value="(v) => (title = (v as string) ?? '')"
        @keydown.enter="onSave"
      />
      <div class="vc-scheduler__quick-create-actions">
        <VcButton
          text
          data-test="qc-more"
          @click="onMore"
        >
          {{ $t("VC_SCHEDULER.MORE_OPTIONS") }}
        </VcButton>
        <VcButton
          variant="primary"
          data-test="qc-save"
          :disabled="!isValid"
          @click="onSave"
        >
          {{ $t("VC_SCHEDULER.SAVE") }}
        </VcButton>
      </div>
    </div>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { ReferenceElement } from "@floating-ui/vue";
import { VcButton } from "@ui/components/atoms/vc-button";
import { VcInput } from "@ui/components/molecules/vc-input";
import { VcPopover } from "@ui/components/molecules/vc-popover";
import type { IEventDraft } from "../../types";

export interface Props {
  open: boolean;
  /** Bounding rect of the clicked cell; wrapped as a floating-ui virtual anchor. */
  anchorRect: DOMRect | null;
  draft: IEventDraft;
}

export interface Emits {
  (event: "save", value: { title: string }): void;
  (event: "more", value: { title: string }): void;
  (event: "close"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const title = ref(props.draft.title);
const titleInputRef = ref<InstanceType<typeof VcInput> | null>(null);

// Wrap the captured rect as a floating-ui VirtualElement so VcPopover anchors to the clicked cell.
const anchorEl = computed<ReferenceElement | null>(() =>
  props.anchorRect ? { getBoundingClientRect: () => props.anchorRect as DOMRect } : null,
);

const isValid = computed(() => title.value.trim().length > 0);

watch(
  () => props.draft,
  (d) => {
    title.value = d.title;
  },
);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      title.value = props.draft.title;
      nextTick(() => {
        const el = titleInputRef.value?.$el;
        if (el instanceof HTMLElement) {
          el.querySelector("input")?.focus();
        }
      });
    }
  },
  { immediate: true },
);

function onSave() {
  if (!isValid.value) return;
  emit("save", { title: title.value.trim() });
}

function onMore() {
  emit("more", { title: title.value.trim() });
}

function onShowChange(value: boolean) {
  if (!value) emit("close");
}
</script>

<style lang="scss">
.vc-scheduler__quick-create {
  @apply tw-flex tw-flex-col tw-gap-3 tw-p-3;
}

.vc-scheduler__quick-create-actions {
  @apply tw-flex tw-items-center tw-justify-between tw-gap-2;
}
</style>
