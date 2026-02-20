<template>
  <Transition name="ai-panel-slide">
    <div
      v-if="isOpen"
      class="vc-ai-agent-panel"
      :class="{
        'vc-ai-agent-panel--expanded': isExpanded,
      }"
      :style="panelStyle"
    >
      <VcAiAgentHeader
        :title="config.title"
        :is-expanded="isExpanded"
        :items-count="totalItemsCount"
        @close="closePanel"
        @expand="expandPanel"
        @collapse="collapsePanel"
      />

      <div class="vc-ai-agent-panel__content">
        <VcAiAgentIframe
          :url="config.url"
          @iframe-ready="onIframeReady"
        />
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, inject } from "vue";
import { AiAgentServiceKey } from "@framework/injection-keys";
import type { IAiAgentServiceInternal } from "@core/plugins/ai-agent/services/ai-agent-service";
import VcAiAgentHeader from "@core/plugins/ai-agent/components/_internal/VcAiAgentHeader.vue";
import VcAiAgentIframe from "@core/plugins/ai-agent/components/_internal/VcAiAgentIframe.vue";

// Inject AI agent service
const aiAgentService = inject(AiAgentServiceKey) as IAiAgentServiceInternal | undefined;

if (!aiAgentService) {
  console.error("[VcAiAgentPanel] AiAgentService not provided");
}

// Destructure service properties
const config = computed(
  () => aiAgentService?.config.value ?? { url: "", title: "AI Assistant", width: 362, expandedWidth: 500 },
);
const isOpen = computed(() => aiAgentService?.isOpen.value ?? false);
const isExpanded = computed(() => aiAgentService?.isExpanded.value ?? false);
const totalItemsCount = computed(() => aiAgentService?.totalItemsCount.value ?? 0);

// Panel style with dynamic width
const panelStyle = computed(() => ({
  width: isExpanded.value ? "50%" : `${config.value.width ?? 362}px`,
}));

// Panel control methods
const closePanel = () => aiAgentService?.closePanel();
const expandPanel = () => aiAgentService?.expandPanel();
const collapsePanel = () => aiAgentService?.collapsePanel();

// Handle iframe ready event
const onIframeReady = (iframe: HTMLIFrameElement) => {
  aiAgentService?._setIframeRef(iframe);
};

// Clean up iframe ref on unmount
onUnmounted(() => {
  aiAgentService?._setIframeRef(null);
});
</script>

<style lang="scss">
:root {
  --ai-panel-bg: var(--additional-50);
  --ai-panel-border-color: var(--neutrals-200);
  --ai-panel-shadow: -4px 0 12px rgba(0, 0, 0, 0.08);
  --ai-panel-header-bg: var(--primary-50);
  --ai-panel-header-border: var(--neutrals-200);
  --ai-panel-icon-color: var(--primary-500);
  --ai-panel-title-color: var(--secondary-950);
  --ai-panel-badge-bg: var(--primary-100);
  --ai-panel-badge-color: var(--primary-700);
  --ai-panel-button-color: var(--neutrals-600);
  --ai-panel-button-hover-bg: var(--neutrals-100);
  --ai-panel-button-hover-color: var(--neutrals-900);
  --ai-panel-iframe-bg: var(--additional-50);
  --ai-panel-placeholder-bg: var(--neutrals-50);
  --ai-panel-placeholder-icon-color: var(--neutrals-300);
  --ai-panel-placeholder-text-color: var(--neutrals-500);
}

// Slide transition for panel
.ai-panel-slide-enter-active,
.ai-panel-slide-leave-active {
  transition: transform var(--app-panel-transition-duration, 0.3s)
    var(--app-panel-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
}

.ai-panel-slide-enter-from,
.ai-panel-slide-leave-to {
  transform: translateX(100%);
}

.vc-ai-agent-panel {
  @apply tw-flex tw-flex-col tw-h-full tw-shrink-0;
  background-color: var(--ai-panel-bg);
  box-shadow: var(--ai-panel-shadow);
  // Width transition for expand/collapse
  transition: width var(--app-panel-transition-duration, 0.3s)
    var(--app-panel-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  overflow: hidden;
  border-width: 1px;
  border-style: solid;
  border-color: var(--ai-panel-border-color);

  &--expanded {
    // Additional expanded styles if needed
  }

  &__content {
    @apply tw-flex-1 tw-overflow-hidden tw-flex tw-flex-col tw-pt-3;
  }
}
</style>
