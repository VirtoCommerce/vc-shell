<template>
  <div class="vc-user-info">
    <div
      v-if="avatarUrl"
      class="vc-user-info__avatar"
      :style="imageHandler"
    ></div>
    <VcIcon
      v-else
      icon="fas fa-user-circle"
      class="vc-user-info__icon"
    />
    <Transition name="opacity">
      <div
        v-show="isExpanded || $isMobile.value"
        class="vc-user-info__info"
      >
        <div class="vc-user-info__name">
          {{ name || (user && "fullName" in user && user.fullName) || user?.userName }}
        </div>
        <div class="vc-user-info__role">
          {{
            (role && $t(`SHELL.USER.ROLE.${role}`)) ||
            (user?.isAdministrator ? $t("SHELL.USER.ROLE.ADMINISTRATOR") : "")
          }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useUser } from "../../../../core/composables";
import { VcIcon } from "../../../../ui/components";

export interface Props {
  avatarUrl?: string;
  name?: string;
  role?: string;
  isExpanded?: boolean;
}

const props = defineProps<Props>();
const { user } = useUser();

const imageHandler = computed(() => {
  if (props.avatarUrl) {
    return `background-image: url(${CSS.escape(props.avatarUrl)})`;
  }
  return undefined;
});
</script>

<style lang="scss">
:root {
  --user-info-avatar-width: 38px;
  --user-info-avatar-height: 38px;
}

.vc-user-info {
  @apply tw-flex tw-items-center tw-gap-3;

  &__avatar {
    @apply tw-rounded-full tw-overflow-hidden tw-w-[var(--user-info-avatar-width)] tw-h-[var(--user-info-avatar-height)] tw-bg-[color:var(--user-dropdown-account-info-role-color)]
    tw-bg-cover tw-bg-center tw-shrink-0;
  }

  &__icon {
    @apply tw-text-[color:var(--user-dropdown-button-color)] tw-text-[length:var(--user-info-avatar-height)];
  }

  &__info {
    @apply tw-grow tw-basis-0 tw-overflow-hidden tw-flex tw-flex-col tw-items-start;
  }

  &__name {
    @apply tw-text-sm tw-text-[color:var(--user-dropdown-account-info-name-color)] tw-max-w-[250px] tw-truncate;
  }

  &__role {
    @apply tw-text-sm tw-text-[color:var(--user-dropdown-account-info-role-color)];
  }
}

.opacity-enter-active,
.opacity-leave-active {
  transition: opacity 0.3s ease;
}

.opacity-enter-from,
.opacity-leave-to {
  opacity: 0;
}
</style>
