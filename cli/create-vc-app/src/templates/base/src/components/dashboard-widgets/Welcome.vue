<template>
  <div class="dashboard-widget-welcome">
    <div class="dashboard-widget-welcome__welcome-image">
      <img
        :src="Welcome"
        alt="Welcome"
      />
    </div>
    <h1 class="dashboard-widget-welcome__welcome-title">{{ $t("SHELL.DASHBOARD.WELCOME.TITLE") }}</h1>
    <p class="dashboard-widget-welcome__welcome-description">
      {{ $t("SHELL.DASHBOARD.WELCOME.DESCRIPTION") }}
    </p>
    <VcButton
      variant="secondary"
      size="base"
      >{{ $t("SHELL.DASHBOARD.WELCOME.GET_STARTED") }}</VcButton
    >
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line import/no-unresolved
import Welcome from "/assets/welcome.png";
</script>

<style lang="scss">
:root {
  --dashboard-widget-welcome-background: linear-gradient(128deg, #e187f3 -18.35%, #45a5f5 96.57%);
  --dashboard-widget-welcome-title-color: var(--additional-50);
  --dashboard-widget-welcome-description-color: var(--additional-50);
  --dashboard-widget-welcome-button-color: var(--additional-50);
  --dashboard-widget-welcome-button-background: var(--additional-50);
}

.dashboard-widget-welcome {
  background: var(--dashboard-widget-welcome-background);
  @apply tw-h-full tw-p-6 tw-text-center tw-text-[color:var(--dashboard-widget-welcome-title-color)] tw-gap-6 tw-flex tw-flex-col tw-items-center;

  &__welcome-image {
    @apply tw-flex tw-justify-center tw-max-w-[80%] tw-h-[40%];
  }

  &__welcome-title {
    @apply tw-text-2xl tw-font-semibold;
  }

  &__welcome-description {
    @apply tw-whitespace-break-spaces tw-text-s tw-max-w-[90%] tw-mx-auto tw-leading-5 tw-font-semibold;
  }
}
</style>
