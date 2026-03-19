<template>
  <div class="vc-user-info">
    <div
      v-if="avatarUrl"
      class="vc-user-info__avatar"
      :style="imageHandler"
    ></div>
    <div
      v-else
      class="vc-user-info__avatar-fallback"
    >
      <VcIcon
        icon="lucide-circle-user"
        size="l"
      />
    </div>
    <div class="vc-user-info__info">
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
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useUserManagement } from "@core/composables/useUserManagement";
import { VcIcon } from "@ui/components/atoms/vc-icon";

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
  --user-info-avatar-size: 32px;
}

.vc-user-info {
  @apply tw-flex tw-items-center tw-gap-2.5 tw-truncate;
  @apply tw-overflow-visible #{!important};
  transition: gap var(--app-bar-transition-duration, 200ms) var(--app-bar-hover-transition-timing-function, ease);

  &__avatar {
    @apply tw-rounded-lg tw-overflow-hidden tw-bg-cover tw-bg-center tw-shrink-0;
    width: var(--user-info-avatar-size);
    height: var(--user-info-avatar-size);
    background-color: var(--user-dropdown-account-info-role-color);
  }

  &__avatar-fallback {
    @apply tw-rounded-lg tw-shrink-0 tw-flex tw-items-center tw-justify-center;
    width: var(--user-info-avatar-size);
    height: var(--user-info-avatar-size);
    background: var(--neutrals-100, #f5f5f5);
    color: var(--neutrals-400, #a3a3a3);
  }

  &__info {
    @apply tw-grow tw-basis-0 tw-overflow-hidden tw-flex tw-flex-col tw-items-start;
    transition:
      width var(--app-bar-transition-duration, 200ms) var(--app-bar-hover-transition-timing-function, ease),
      flex var(--app-bar-transition-duration, 200ms) var(--app-bar-hover-transition-timing-function, ease),
      opacity var(--app-bar-transition-duration, 200ms) var(--app-bar-hover-transition-timing-function, ease);
  }

  &__name {
    @apply tw-font-semibold tw-truncate tw-w-full tw-text-left tw-max-w-[250px];
    font-size: 13px;
    color: var(--neutrals-800, #262626);
  }

  &__role {
    @apply tw-truncate tw-text-left tw-w-full tw-max-w-[250px];
    font-size: 11px;
    color: var(--neutrals-400, #a3a3a3);
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
