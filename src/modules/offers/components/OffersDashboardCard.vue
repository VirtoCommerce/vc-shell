<template>
  <VcCard
    :header="$t('OFFERS.WIDGET.TITLE')"
    icon="fas fa-file-invoice"
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
          v-loading="loading"
          class="tw-flex tw-flex-auto tw-flex-col"
        >
          <div class="tw-h-px tw-bg-[#e3e7ec] tw-w-full"></div>
          <div
            class="tw-flex tw-flex-auto tw-justify-center tw-my-4 tw-text-[26px] tw-font-medium tw-text-[#319ed4] tw-items-center"
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
