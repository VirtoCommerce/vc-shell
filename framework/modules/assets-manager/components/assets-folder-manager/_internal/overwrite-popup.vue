<template>
  <VcPopup
    :title="$t('ASSETS_MANAGER.FOLDER.OVERWRITE_POPUP.TITLE')"
    @close="emit('cancel')"
  >
    <template #content>
      <div class="assets-folder-manager__popup-body tw-flex tw-flex-col tw-gap-3 tw-w-full">
        <p>{{ $t("ASSETS_MANAGER.FOLDER.OVERWRITE_POPUP.MESSAGE", { name }) }}</p>
        <VcInput
          v-model="newName"
          class="tw-w-full"
          autofocus
          :label="$t('ASSETS_MANAGER.FOLDER.OVERWRITE_POPUP.NAME')"
          :error="invalid"
          :error-message="invalid ? $t('ASSETS_MANAGER.FOLDER.NEW_FOLDER_POPUP.INVALID') : undefined"
          @keydown.enter.prevent="rename"
        />
      </div>
    </template>

    <template #footer>
      <div class="assets-folder-manager__popup-footer tw-flex tw-justify-end tw-gap-3 tw-w-full">
        <VcButton
          variant="secondary"
          data-test-id="overwrite-popup-skip"
          @click="emit('confirm', { action: 'skip' })"
        >
          {{ $t("ASSETS_MANAGER.FOLDER.OVERWRITE_POPUP.SKIP") }}
        </VcButton>
        <VcButton
          variant="secondary"
          data-test-id="overwrite-popup-rename"
          @click="rename"
        >
          {{ $t("ASSETS_MANAGER.FOLDER.OVERWRITE_POPUP.RENAME") }}
        </VcButton>
        <VcButton
          variant="danger"
          data-test-id="overwrite-popup-overwrite"
          @click="emit('confirm', { action: 'overwrite' })"
        >
          {{ $t("ASSETS_MANAGER.FOLDER.OVERWRITE_POPUP.OVERWRITE") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcButton, VcInput, VcPopup } from "@ui/components";
import { isValidEntryName, type CollisionDecision } from "../collisions";

const props = defineProps<{
  name: string;
}>();

const emit = defineEmits<{
  (event: "confirm", decision: CollisionDecision): void;
  (event: "cancel"): void;
}>();

const newName = ref(props.name);
const invalid = ref(false);

function rename() {
  const name = String(newName.value ?? "").trim();
  // A separator would put the file into another folder.
  invalid.value = !isValidEntryName(name);
  if (!invalid.value) emit("confirm", { action: "rename", name });
}
</script>
