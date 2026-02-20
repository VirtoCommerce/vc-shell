<template>
  <div class="vc-ai-agent-iframe">
    <!-- Loading overlay -->
    <Transition name="fade">
      <VcAiAgentLoader v-if="isLoading && url" :text="$t('AI_AGENT.LOADING')" />
    </Transition>

    <iframe
      v-if="url"
      ref="iframeRef"
      :src="url"
      class="vc-ai-agent-iframe__frame"
      :class="{ 'vc-ai-agent-iframe__frame--loading': isLoading }"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      allow="clipboard-read; clipboard-write"
      @load="onLoad"
    />
    <div v-else class="vc-ai-agent-iframe__placeholder">
      <VcIcon icon="lucide-sparkles" size="xl" class="vc-ai-agent-iframe__placeholder-icon" />
      <p class="vc-ai-agent-iframe__placeholder-text">AI Agent URL not configured</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { VcIcon } from "@ui/components";
import VcAiAgentLoader from "@core/plugins/ai-agent/components/_internal/VcAiAgentLoader.vue";

const props = defineProps<{
  url: string;
}>();

const emit = defineEmits<{
  (e: "iframe-ready", iframe: HTMLIFrameElement): void;
}>();

const iframeRef = ref<HTMLIFrameElement | null>(null);
const isLoading = ref(true);

// Emit iframe ref as soon as it's available in the DOM (before @load)
// This is critical because chatbot sends CHAT_READY before @load fires
watch(iframeRef, (iframe) => {
  if (iframe) {
    emit("iframe-ready", iframe);
  }
}, { immediate: true });

const onLoad = () => {
  // Hide loader after iframe loads
  isLoading.value = false;
  console.debug("[VcAiAgentIframe] Iframe loaded");
};

onMounted(() => {
  // Emit again on mount in case watch didn't catch it
  if (iframeRef.value) {
    emit("iframe-ready", iframeRef.value);
  }
});

// Reset loading state when URL changes
watch(() => props.url, () => {
  isLoading.value = true;
});
</script>

<style lang="scss">
// Fade transition
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.vc-ai-agent-iframe {
  @apply tw-w-full tw-h-full tw-flex tw-flex-col tw-relative;

  &__frame {
    @apply tw-w-full tw-h-full tw-border-0 tw-flex-1;
    background-color: var(--ai-panel-iframe-bg, var(--additional-50));
    transition: opacity 0.3s ease;

    &--loading {
      opacity: 0;
    }
  }

  &__placeholder {
    @apply tw-w-full tw-h-full tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-4;
    background-color: var(--ai-panel-placeholder-bg, var(--neutrals-50));
  }

  &__placeholder-icon {
    color: var(--ai-panel-placeholder-icon-color, var(--neutrals-300));
  }

  &__placeholder-text {
    @apply tw-text-sm tw-m-0;
    color: var(--ai-panel-placeholder-text-color, var(--neutrals-500));
  }
}
</style>
