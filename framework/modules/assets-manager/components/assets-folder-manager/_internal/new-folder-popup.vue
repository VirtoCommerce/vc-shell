<template>
  <VcPopup
    :title="$t('ASSETS_MANAGER.FOLDER.NEW_FOLDER_POPUP.TITLE')"
    @close="emit('cancel')"
  >
    <template #content>
      <div class="tw-w-full">
        <VcInput
          v-model="name"
          class="tw-w-full"
          :label="$t('ASSETS_MANAGER.FOLDER.NEW_FOLDER_POPUP.NAME')"
          :error="invalid"
          :error-message="invalid ? $t('ASSETS_MANAGER.FOLDER.NEW_FOLDER_POPUP.INVALID') : undefined"
          autofocus
          @keydown.enter.prevent="submit"
        />
      </div>
    </template>

    <template #footer>
      <div class="assets-folder-manager__popup-footer tw-flex tw-justify-end tw-gap-3 tw-w-full">
        <VcButton
          variant="secondary"
          data-test-id="new-folder-popup-cancel"
          @click="emit('cancel')"
        >
          {{ $t("ASSETS_MANAGER.FOLDER.NEW_FOLDER_POPUP.CANCEL") }}
        </VcButton>
        <VcButton
          data-test-id="new-folder-popup-create"
          @click="submit"
        >
          {{ $t("ASSETS_MANAGER.FOLDER.NEW_FOLDER_POPUP.CREATE") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { isValidEntryName } from "../collisions";
import { ref } from "vue";
import { VcButton, VcInput, VcPopup } from "@ui/components";

const emit = defineEmits<{
  (event: "confirm", name: string): void;
  (event: "cancel"): void;
}>();

const name = ref("");
const invalid = ref(false);

// Same rule as useAssetsFolder.createFolder, checked here so the popup can stay open.
function submit() {
  const value = String(name.value ?? "").trim();
  invalid.value = !isValidEntryName(value);
  if (!invalid.value) emit("confirm", value);
}
</script>
