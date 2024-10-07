<template>
  <VcCard
    :header="$t('OFFERS.WIDGET.TITLE')"
    icon="fas fa-shapes"
    :fill="true"
  >
    <template
      v-if="$isDesktop.value"
      #actions
    >
      <vc-button
        small
        class="tw-mr-3"
        @click="addItem"
        >{{ $t("OFFERS.WIDGET.ADD") }}</vc-button
      >
      <vc-button
        small
        outline
        @click="() => onItemClick()"
        >{{ $t("OFFERS.WIDGET.ALL") }}</vc-button
      >
    </template>
    <Offers
      :is-widget-view="true"
      @item-click="onItemClick"
      @add="addItem"
    >
      <template #widget-mobile="{ totalCount, loading }">
        <div
          v-loading:100="loading"
          class="tw-flex tw-flex-auto tw-flex-col"
          @click="() => onItemClick()"
        >
          <div class="tw-h-px tw-bg-[--offers-card-widget-separator-color] tw-w-full"></div>
          <div
            class="tw-text-center tw-m-4 tw-text-[26px] tw-font-medium tw-text-[color:var(--offers-mobile-card-count-color)]"
          >
            {{ totalCount == 0 ? $t("OFFERS.WIDGET.EMPTY") : totalCount }}
          </div>
        </div>
      </template>
    </Offers>
  </VcCard>
</template>

<script setup lang="ts">
import { useBladeNavigation } from "@vc-shell/framework";

const { openBlade, resolveBladeByName } = useBladeNavigation();

async function onItemClick(args?: { param: string }) {
  await openBlade(
    {
      blade: resolveBladeByName("Offers"),
      param: args?.param,
    },
    true,
  );

  if (args?.param) {
    await openBlade({
      blade: resolveBladeByName("Offer"),
      param: args?.param,
    });
  }
}

async function addItem() {
  await openBlade(
    {
      blade: resolveBladeByName("Offers"),
    },
    true,
  );
  await openBlade({
    blade: resolveBladeByName("Offer"),
  });
}
</script>

<style lang="scss">
:root {
  --offers-card-widget-separator-color: var(--base-border-color, var(--neutrals-200));
  --offers-mobile-card-count-color: var(--mobile-card-count-color, var(--primary-500));
}
</style>
