<template>
  <VcCol class="tw-p-2 !tw-basis-2/4">
    <VcCard
      :header="$t('PRODUCTS.WIDGET.TITLE')"
      icon="fas fa-box-open"
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
          >{{ $t("PRODUCTS.WIDGET.ALL") }}</vc-button
        >
      </template>
      <Products
        :is-widget-view="true"
        @item-click="onItemClick"
        @add="addItem"
      >
        <template #widget-mobile="{ totalCount, loading }">
          <div
            v-loading="loading"
            class="tw-flex tw-flex-auto tw-flex-col"
            @click="() => onItemClick()"
          >
            <div class="tw-h-px tw-bg-[#e3e7ec] tw-w-full"></div>
            <div class="tw-text-center tw-m-4 tw-text-[26px] tw-font-medium tw-text-[#319ed4]">
              {{ totalCount == 0 ? $t("PRODUCTS.WIDGET.EMPTY") : totalCount }}
            </div>
          </div>
        </template>
      </Products>
    </VcCard>
  </VcCol>
</template>

<script setup lang="ts">
import { useBladeNavigation } from "@vc-shell/framework";

const { openBlade, resolveBladeByName } = useBladeNavigation();

async function onItemClick(args?: { param: string }) {
  await openBlade(
    {
      blade: resolveBladeByName("Products"),
      param: args?.param,
    },
    true,
  );

  if (args?.param) {
    await openBlade({
      blade: resolveBladeByName("Product"),
      param: args?.param,
    });
  }
}

async function addItem() {
  await openBlade(
    {
      blade: resolveBladeByName("Products"),
    },
    true,
  );
  await openBlade({
    blade: resolveBladeByName("Product"),
  });
}
</script>
