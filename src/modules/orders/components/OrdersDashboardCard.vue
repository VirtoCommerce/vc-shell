<template>
  <VcCard
    :header="$t('ORDERS.WIDGET.TITLE')"
    icon="fas fa-sync-alt"
    :fill="true"
  >
    <template
      v-if="$isDesktop.value"
      #actions
    >
      <vc-button
        small
        outline
        @click="() => onItemClick()"
        >{{ $t("ORDERS.WIDGET.ALL") }}</vc-button
      >
    </template>
    <Orders
      :is-widget-view="true"
      @item-click="onItemClick"
    >
      <template #widget-mobile="{ totalCount, loading }">
        <div
          v-loading="loading"
          class="tw-flex tw-flex-auto tw-flex-col"
          @click="() => onItemClick()"
        >
          <div class="tw-h-px tw-bg-[#e3e7ec] tw-w-full"></div>
          <div class="tw-text-center tw-m-4 tw-text-[26px] tw-font-medium tw-text-[#319ed4]">
            {{ totalCount == 0 ? $t("ORDERS.WIDGET.EMPTY") : totalCount }}
          </div>
        </div>
      </template>
    </Orders>
  </VcCard>
</template>

<script setup lang="ts">
import { useBladeNavigation } from "@vc-shell/framework";

const { openBlade, resolveBladeByName } = useBladeNavigation();

async function onItemClick(args?: { param: string }) {
  await openBlade(
    {
      blade: resolveBladeByName("Orders"),
      param: args?.param,
    },
    true,
  );
}
</script>
