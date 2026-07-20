<!-- framework/ui/components/organisms/vc-scheduler/_internal/editor/RecurrenceScopeDialog.vue -->
<template>
  <VcPopup
    :model-value="open"
    :title="$t('VC_SCHEDULER.RECUR_SCOPE_TITLE')"
    modal-width="tw-max-w-sm"
    @update:model-value="onVisibilityChange"
  >
    <template #content>
      <p class="vc-scheduler__scope-body">
        {{ $t(action === "delete" ? "VC_SCHEDULER.RECUR_SCOPE_BODY_DELETE" : "VC_SCHEDULER.RECUR_SCOPE_BODY_EDIT") }}
      </p>
    </template>

    <template #footer>
      <div class="vc-scheduler__scope-footer">
        <VcButton
          variant="secondary"
          data-test="scope-cancel"
          @click="emit('close')"
        >
          {{ $t("VC_SCHEDULER.CANCEL") }}
        </VcButton>
        <div class="vc-scheduler__scope-footer-spacer" />
        <!-- "This event" is the emphasized (primary) choice for edit — the safer, narrower
             scope; "All events" is de-emphasized. Both are danger for delete. -->
        <VcButton
          :variant="action === 'delete' ? 'danger' : 'primary'"
          data-test="scope-this"
          @click="emit('select', 'this')"
        >
          {{ $t("VC_SCHEDULER.RECUR_SCOPE_THIS") }}
        </VcButton>
        <VcButton
          :variant="action === 'delete' ? 'danger' : 'secondary'"
          data-test="scope-all"
          @click="emit('select', 'all')"
        >
          {{ $t("VC_SCHEDULER.RECUR_SCOPE_ALL") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { VcPopup } from "@ui/components/organisms/vc-popup";
import { VcButton } from "@ui/components/atoms/vc-button";

export interface Props {
  open: boolean;
  action: "edit" | "delete";
}

export interface Emits {
  (event: "select", scope: "this" | "all"): void;
  (event: "close"): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function onVisibilityChange(value: boolean) {
  if (!value) emit("close");
}
</script>

<style lang="scss">
.vc-scheduler {
  &__scope-body {
    @apply tw-text-sm tw-w-full;
  }

  &__scope-footer {
    @apply tw-flex tw-items-center tw-gap-3 tw-w-full;
  }

  &__scope-footer-spacer {
    @apply tw-flex-1;
  }
}
</style>
