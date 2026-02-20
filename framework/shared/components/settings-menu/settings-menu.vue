<template>
  <div class="vc-settings-menu">
    <template
      v-for="(group, groupIndex) in groupedItems"
      :key="group.name"
    >
      <div
        v-if="groupIndex > 0"
        class="vc-settings-menu__separator"
      />
      <div class="vc-settings-menu__group">
        <component
          :is="item.component"
          v-for="item in group.items"
          :key="item.id"
          v-bind="item.props || {}"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useSettingsMenu } from "@core/composables/useSettingsMenu";

const { items } = useSettingsMenu();

const groupedItems = computed(() => {
  const groups = new Map<string, typeof items.value>();

  for (const item of items.value) {
    const groupName = item.group ?? "general";
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName)!.push(item);
  }

  return Array.from(groups.entries()).map(([name, groupItems]) => ({
    name,
    items: groupItems,
  }));
});
</script>

<style lang="scss">
.vc-settings-menu {
  @apply tw-w-full tw-py-1;

  &__separator {
    @apply tw-mx-3 tw-my-1 tw-border-t tw-border-solid tw-border-neutrals-200;
  }

  &__group {
    @apply tw-flex tw-flex-col;
  }
}
</style>
