<template>
  <DashboardWidgetCard
    :header="$t('ENTITIES.WIDGET.TITLE')"
    icon="lucide-package-open"
    :loading="loading"
  >
    <template
      v-if="$isDesktop.value"
      #actions
    >
      <VcButton
        size="base"
        variant="secondary"
        @click="addItem"
      >
        {{ $t("ENTITIES.WIDGET.ADD") }}
      </VcButton>
      <VcButton
        size="sm"
        variant="secondary"
        @click="() => onItemClick()"
      >
        {{ $t("ENTITIES.WIDGET.ALL") }}
      </VcButton>
    </template>

    <template #content>
      <!-- Show table if items exist -->
      <VcTable
        v-if="items?.length"
        :items="items?.slice(0, 5)"
        :columns="columns"
        :header="false"
        :footer="false"
        :reorderable-columns="false"
        :resizable-columns="false"
        state-key="entities-dashboard-card"
        @item-click="onItemClick"
      />
      <!-- Show empty state if no items -->
      <div
        v-else
        class="tw-text-center tw-py-8"
      >
        <VcIcon
          icon="lucide-package-open"
          size="xxl"
          class="tw-text-neutral-400 tw-mb-4"
        />
        <p class="tw-text-neutral-600">
          {{ $t("ENTITIES.WIDGET.EMPTY") }}
        </p>
      </div>
    </template>
  </DashboardWidgetCard>
</template>

<script setup lang="ts">
import { useBladeNavigation, ITableColumns, DashboardWidgetCard } from "@vc-shell/framework";
import { onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
// TODO: Import your composable and types
import { useEntityList } from "../composables/useEntityList";
import type { Entity } from "../types";

const { openBlade, resolveBladeByName } = useBladeNavigation();
const { loadEntities, items, loading } = useEntityList();
const { t } = useI18n({
  useScope: "global",
});

const columns = computed((): ITableColumns[] => [
  {
    id: "img",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.IMAGE")),
    alwaysVisible: true,
    mobilePosition: "image",
  },
  {
    id: "status",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.STATUS")),
    alwaysVisible: true,
    type: "status",
    mobilePosition: "status",
  },
  {
    id: "name",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.NAME")),
    mobilePosition: "top-left",
  },
  {
    id: "createdDate",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    type: "date-ago",
    mobilePosition: "bottom-right",
  },
]);

onMounted(() => {
  loadEntities({
    take: 5,
  });
});

async function onItemClick(item?: Entity) {
  // Open list blade first
  await openBlade(
    {
      blade: resolveBladeByName("Entities"),
      param: item?.id,
    },
    true,
  );

  // If item selected, open details blade
  if (item?.id) {
    await openBlade({
      blade: resolveBladeByName("EntityDetails"),
      param: item?.id,
    });
  }
}

async function addItem() {
  // Open list blade first
  await openBlade(
    {
      blade: resolveBladeByName("Entities"),
    },
    true,
  );
  // Then open empty details blade for new item
  await openBlade({
    blade: resolveBladeByName("EntityDetails"),
  });
}
</script>
