<template>
  <VcPopup
    :title="$t('ASSETS_MANAGER.FOLDER.URL_POPUP.TITLE')"
    @close="emit('cancel')"
  >
    <template #content>
      <div class="tw-w-full">
        <VcInput
          v-model="url"
          class="tw-w-full"
          type="url"
          :label="$t('ASSETS_MANAGER.FOLDER.URL_POPUP.URL')"
          :error="invalid"
          :error-message="invalid ? $t('ASSETS_MANAGER.FOLDER.URL_POPUP.INVALID') : undefined"
          autofocus
          @keydown.enter.prevent="submit"
        />
      </div>
    </template>

    <template #footer>
      <div class="assets-folder-manager__popup-footer tw-flex tw-justify-end tw-gap-3 tw-w-full">
        <VcButton
          variant="secondary"
          data-test-id="upload-url-popup-cancel"
          @click="emit('cancel')"
        >
          {{ $t("ASSETS_MANAGER.FOLDER.URL_POPUP.CANCEL") }}
        </VcButton>
        <VcButton
          data-test-id="upload-url-popup-upload"
          @click="submit"
        >
          {{ $t("ASSETS_MANAGER.FOLDER.URL_POPUP.UPLOAD") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcButton, VcInput, VcPopup } from "@ui/components";

const emit = defineEmits<{
  (event: "confirm", url: string): void;
  (event: "cancel"): void;
}>();

const url = ref("");
const invalid = ref(false);

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function submit() {
  const value = String(url.value ?? "").trim();
  invalid.value = !isHttpUrl(value);
  if (!invalid.value) emit("confirm", value);
}
</script>
