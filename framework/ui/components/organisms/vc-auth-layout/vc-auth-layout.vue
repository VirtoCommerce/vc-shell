<template>
  <main
    class="vc-auth-layout"
    :style="containerStyle"
  >
    <div class="vc-auth-layout__logo-wrapper">
      <img
        v-if="logo"
        :src="logo"
        :alt="logoAlt"
        class="vc-auth-layout__logo"
        :class="{ 'vc-auth-layout__logo--loaded': logoLoaded }"
        @load="logoLoaded = true"
      />
    </div>

    <div class="vc-auth-layout__card">
      <div
        v-if="title || subtitle"
        class="vc-auth-layout__header"
      >
        <h2
          v-if="title"
          class="vc-auth-layout__title"
        >
          {{ title }}
        </h2>
        <p
          v-if="subtitle"
          class="vc-auth-layout__subtitle"
        >
          {{ subtitle }}
        </p>
      </div>

      <div class="vc-auth-layout__content">
        <slot></slot>
      </div>
    </div>

    <div
      v-if="$slots.footer"
      class="vc-auth-layout__footer"
    >
      <slot name="footer"></slot>
    </div>

    <div
      v-if="version"
      class="vc-auth-layout__version"
    >
      {{ version }}
    </div>
  </main>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

export interface Props {
  /** Path to logo image */
  logo?: string;
  /** Background image URL (legacy support). If provided, renders full-screen background-image */
  background?: string;
  /** Card heading */
  title?: string;
  /** Card subheading */
  subtitle?: string;
  /** Page background color override */
  bgColor?: string;
  /** Accessible alt text for logo image */
  logoAlt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  logoAlt: "Logo",
});

defineSlots<{
  /** Form content (fields, buttons, SSO, errors) */
  default: () => unknown;
  /** Below card (terms of service, privacy links) */
  footer: () => unknown;
}>();

const router = useRouter();
const version = router.currentRoute.value.meta?.appVersion;

const logoLoaded = ref(false);
const bgLoaded = ref(false);

// Preload background image to avoid pop-in
watch(
  () => props.background,
  (url) => {
    bgLoaded.value = false;
    if (!url) return;
    const img = new Image();
    img.onload = () => {
      bgLoaded.value = true;
    };
    img.src = url;
  },
  { immediate: true },
);

const containerStyle = computed(() => {
  if (props.background) {
    return {
      background: bgLoaded.value ? `url(${props.background}) center / cover no-repeat` : undefined,
      backgroundColor: props.bgColor || undefined,
    };
  }
  if (props.bgColor) {
    return { backgroundColor: props.bgColor };
  }
  return undefined;
});
</script>

<style lang="scss">
:root {
  --auth-layout-bg: var(--neutrals-100);
  --auth-layout-card-bg: var(--additional-50);
  --auth-layout-card-border: var(--neutrals-200);
  --auth-layout-card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --auth-layout-card-radius: 12px;
  --auth-layout-card-max-width: 420px;
  --auth-layout-title-color: var(--neutrals-900);
  --auth-layout-subtitle-color: var(--neutrals-400);
  --auth-layout-version-color: var(--neutrals-400);
}

.vc-auth-layout {
  @apply tw-w-full tw-h-full tw-min-h-screen tw-box-border
    tw-flex tw-flex-col tw-items-center tw-justify-center
    tw-bg-[var(--auth-layout-bg)]
    tw-px-4 tw-py-8;
  transition: background 0.3s ease;

  &__logo-wrapper {
    @apply tw-mb-8 tw-flex tw-items-center tw-justify-center;
    min-height: 48px; // Reserve space for logo to prevent layout shift
  }

  &__logo {
    @apply tw-h-12 tw-max-w-[280px] tw-object-contain;
    opacity: 0;
    transition: opacity 0.3s ease;

    &--loaded {
      opacity: 1;
    }
  }

  &__card {
    @apply tw-w-full tw-bg-[var(--auth-layout-card-bg)]
      tw-border tw-border-solid tw-border-[var(--auth-layout-card-border)]
      tw-rounded-[var(--auth-layout-card-radius)]
      tw-overflow-y-auto;
    max-width: var(--auth-layout-card-max-width);
    box-shadow: var(--auth-layout-card-shadow);
  }

  &__header {
    @apply tw-pt-8 tw-px-8 tw-text-center;
  }

  &__title {
    @apply tw-text-2xl tw-font-semibold tw-text-[var(--auth-layout-title-color)]
      tw-m-0 tw-leading-tight;
  }

  &__subtitle {
    @apply tw-text-sm tw-text-[var(--auth-layout-subtitle-color)]
      tw-mt-2 tw-mb-0;
  }

  &__content {
    @apply tw-px-8 tw-pt-6 tw-pb-8;
  }

  &__footer {
    @apply tw-mt-6 tw-text-center tw-text-xs tw-text-[var(--auth-layout-subtitle-color)];
    max-width: var(--auth-layout-card-max-width);
  }

  &__version {
    @apply tw-mt-4 tw-text-xs tw-text-[var(--auth-layout-version-color)];
  }
}
</style>
