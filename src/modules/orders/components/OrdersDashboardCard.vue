<template>
  <VcCard
    :header="$t('ORDERS.WIDGET.TITLE')"
    icon="fas fa-shopping-cart"
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
          v-loading:100="loading"
          class="tw-flex tw-flex-auto tw-flex-col"
          @click="() => onItemClick()"
        >
          <div class="tw-h-px tw-bg-[--orders-widget-separator-color] tw-w-full"></div>
          <div
            class="tw-text-center tw-m-4 tw-text-[26px] tw-font-medium tw-text-[color:var(--orders-widget-icon-color)]"
          >
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

  if (args?.param) {
    await openBlade({
      blade: resolveBladeByName("OrderDetails"),
      param: args?.param,
    });
  }
}
</script>

<style lang="scss">
:root {
  --orders-widget-icon-color: var(--empty-grid-icon-color, var(--primary-500));
  --orders-widget-separator-color: var(--base-border-color, var(--neutrals-200));
}
</style>
