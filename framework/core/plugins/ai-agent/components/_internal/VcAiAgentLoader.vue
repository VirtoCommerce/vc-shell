<template>
  <div class="vc-ai-agent-loader">
    <div class="vc-ai-agent-loader__content">
      <div class="vc-ai-agent-loader__logo">
        <VcVirtoOzLogo :width="80" :height="87" animated />
      </div>
      <p v-if="text" class="vc-ai-agent-loader__text">{{ text }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import VcVirtoOzLogo from "@core/plugins/ai-agent/components/_internal/VcVirtoOzLogo.vue";

export interface Props {
  /** Loading text to display */
  text?: string;
}

defineProps<Props>();
</script>

<style lang="scss">
@keyframes virto-oz-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes virto-oz-glow {
  0%,
  100% {
    filter: drop-shadow(0 4px 15px rgba(255, 149, 51, 0.4));
  }
  25% {
    filter: drop-shadow(0 4px 15px rgba(255, 79, 187, 0.4));
  }
  50% {
    filter: drop-shadow(0 4px 15px rgba(28, 145, 252, 0.4));
  }
  75% {
    filter: drop-shadow(0 4px 15px rgba(154, 45, 248, 0.4));
  }
}

.vc-ai-agent-loader {
  @apply tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-z-10;
  background: linear-gradient(
    135deg,
    var(--additional-50) 0%,
    var(--neutrals-50) 100%
  );

  &__content {
    @apply tw-flex tw-flex-col tw-items-center tw-gap-5;
  }

  &__logo {
    animation: virto-oz-float 2.5s ease-in-out infinite,
      virto-oz-glow 4s linear infinite;
  }

  &__text {
    @apply tw-text-sm tw-m-0 tw-font-medium;
    color: var(--neutrals-600);
  }
}
</style>
