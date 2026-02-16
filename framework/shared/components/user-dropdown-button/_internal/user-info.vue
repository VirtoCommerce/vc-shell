<template>
  <div class="vc-user-info">
    <div
      v-if="avatarUrl"
      class="vc-user-info__avatar"
      :style="imageHandler"
    ></div>
    <VcIcon
      v-else
      icon="material-account_circle"
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
            role
              ? $te(`SHELL.USER.ROLE.${role}`)
                ? $t(`SHELL.USER.ROLE.${role}`)
                : role
              : user?.isAdministrator
                ? $t("SHELL.USER.ROLE.ADMINISTRATOR")
                : ""
          }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useUserManagement } from "../../../../core/composables/useUserManagement";
import { VcIcon } from "../../../../ui/components";

export interface Props {
  avatarUrl?: string;
  name?: string;
  role?: string;
  isExpanded?: boolean;
}

const props = defineProps<Props>();
const { user } = useUserManagement();

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
  @apply tw-flex tw-items-center tw-gap-3 tw-truncate tw-w-full;
  @apply tw-overflow-visible #{!important};

  &__avatar {
    @apply tw-rounded-full tw-overflow-hidden tw-w-[var(--user-info-avatar-width)] tw-h-[var(--user-info-avatar-height)] tw-bg-[color:var(--user-dropdown-account-info-role-color)]
    tw-bg-cover tw-bg-center tw-shrink-0;
  }

  &__icon {
    @apply tw-text-[color:var(--user-dropdown-button-color)] tw-text-[length:var(--user-info-avatar-height)] tw-shrink-0 tw-w-[var(--user-info-avatar-width)] tw-h-[var(--user-info-avatar-height)] #{!important};
  }

  &__info {
    @apply tw-grow tw-basis-0 tw-overflow-hidden tw-flex tw-flex-col tw-items-start;
  }

  &__name {
    @apply tw-text-sm tw-text-[color:var(--user-dropdown-account-info-name-color)] tw-max-w-[250px] tw-truncate tw-w-full tw-text-left;
  }

  &__role {
    @apply tw-text-sm tw-text-[color:var(--user-dropdown-account-info-role-color)] tw-truncate tw-text-left tw-w-full tw-max-w-[250px];
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
