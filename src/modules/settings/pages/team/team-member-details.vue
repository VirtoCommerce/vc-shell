<template>
  <VcBlade
    :title="title"
    width="30%"
    v-loading="loading"
    @close="$emit('close:blade')"
    :closable="closable"
    :expanded="expanded"
    :toolbarItems="bladeToolbar"
  >
    <VcContainer>
      <VcStatus
        :outline="false"
        :extend="true"
        variant="light-danger"
        class="tw-w-full tw-box-border tw-mb-3"
        v-if="errorMessage"
      >
        <div class="tw-flex tw-flex-row tw-items-center">
          <VcIcon
            icon="fas fa-exclamation-circle"
            class="tw-text-[#ff4a4a] tw-mr-3"
            size="xxl"
          ></VcIcon>
          <div>
            <div class="tw-font-bold">
              {{ $t("SETTINGS.TEAM.PAGES.DETAILS.FORM.ERROR") }}
            </div>
            <div>{{ errorMessage }}</div>
          </div>
        </div>
      </VcStatus>
      <VcForm>
        <VcRow>
          <VcCol>
              <Field v-slot="{field, errorMessage, handleChange}" :modelValue="userDetails.firstName" name="name" rules="required">
                  <VcInput
                    v-bind="field"
                    class="tw-p-3"
                    :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.FIRST_NAME.LABEL')"
                    :placeholder="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.FIRST_NAME.PLACEHOLDER')"
                    :disabled="isOwnerReadonly"
                    v-model="userDetails.firstName"
                    is-required
                    :error-message="errorMessage"
                    @update:modelValue="handleChange"
                  />
              </Field>
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol>
              <Field v-slot="{field, errorMessage, handleChange}" :modelValue="userDetails.lastName" name="lastName" rules="required">
                  <VcInput
                    v-bind="field"
                    class="tw-p-3"
                    :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.LAST_NAME.LABEL')"
                    :placeholder="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.LAST_NAME.PLACEHOLDER')"
                    :disabled="isOwnerReadonly"
                    v-model="userDetails.lastName"
                    is-required
                    :error-message="errorMessage"
                    @update:modelValue="handleChange"
                  />
              </Field>
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol>
              <Field v-slot="{field, errorMessage, handleChange}" :modelValue="userDetails.email" name="email" rules="required|email">
                  <VcInput
                    v-bind="field"
                    class="tw-p-3"
                    :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.EMAIL.LABEL')"
                    :placeholder="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.EMAIL.PLACEHOLDER')"
                    :disabled="!!props.param"
                    v-model="userDetails.email"
                    is-required
                    :error-message="errorMessage"
                    @update:modelValue="handleChange"
                  />
              </Field>

          </VcCol>
        </VcRow>

        <VcRow>
          <VcCol>
              <Field v-slot="{field, errorMessage, handleChange}" :modelValue="userDetails.role" name="role" rules="required">
                  <VcSelect
                          v-bind="field"
                          class="tw-p-3"
                          :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.ROLE.LABEL')"
                          :placeholder="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.ROLE.PLACEHOLDER')"
                          :options="roles"
                          v-model="userDetails.role"
                          :initialItem="userDetails.role || role"
                          keyProperty="id"
                          :clearable="false"
                          displayProperty="name"
                          :isDisabled="isOwnerReadonly"
                          is-required
                          :error-message="errorMessage"
                          @update:modelValue="handleChange"
                  />
              </Field>
          </VcCol>
        </VcRow>
        <VcRow v-if="userDetails.id">
          <VcCol>
            <VcSwitch
              class="tw-p-3"
              :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.IS_ACTIVE.LABEL')"
              v-model="isActive"
              :true-value="false"
              :false-value="true"
              :disabled="isOwnerReadonly"
            />
          </VcCol>
        </VcRow>
        <VcRow v-else>
          <VcCol>
            <VcSwitch
              v-model="sendInviteStatus"
              class="tw-p-3"
              :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.INVITE.LABEL')"
            ></VcSwitch>
          </VcCol>
        </VcRow>
      </VcForm>
    </VcContainer>
  </VcBlade>
  <ErrorPopup
    v-if="isEmailExistsModal"
    @close="isEmailExistsModal = false"
    :email="userDetails.email"
    :message="errorMessage"
  ></ErrorPopup>
  <WarningPopup
    v-if="deleteModal"
    @close="deleteModal = false"
    @delete="removeUser"
  ></WarningPopup>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, unref } from "vue";
import {useI18n, useUser, useAutosave, IParentCallArgs, IBladeToolbar} from "@vc-shell/framework";
import useTeamMembers from "../../composables/useTeamMembers";
import ErrorPopup from "../../components/ErrorPopup.vue";
import WarningPopup from "../../components/WarningPopup.vue";
import { useIsFormValid, Field, useForm } from "vee-validate";
import {SellerUser, SellerUserDetails} from "../../../../api_client/marketplacevendor";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: {
      user?: SellerUser
  };
}

export interface Emits {
    (event: 'close:blade'): void
    (event: 'parent:call', args: IParentCallArgs): void
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
  options: () => ({}),
});

const emit = defineEmits<Emits>();

useForm({ validateOnMount: false });
const { user } = useUser();

const { t } = useI18n();
const {
  userDetails,
  loading,
  modified,
  handleUserDetailsItem,
  createTeamMember,
  resetEntries,
  deleteTeamMember,
  updateTeamMember,
  sendTeamMemberInvitation,
} = useTeamMembers();
const { loadAutosaved, resetAutosaved, savedValue } = useAutosave(
  userDetails,
  modified,
  props.param ?? "teamMembers"
);
const title = computed(() =>
  props.param
    ? userDetails.value.firstName + " " + userDetails.value.lastName
    : t("SETTINGS.TEAM.PAGES.DETAILS.TITLE")
);

const isEmailExistsModal = ref(false);
const deleteModal = ref(false);
const sendInviteStatus = ref(false);
const errorMessage = ref("");
const isValid = useIsFormValid();

const isOwnerReadonly = computed(
  () => userDetails.value.role === "vcmp-owner-role"
);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "invite",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.CREATE")),
    icon: "fas fa-paper-plane",
    async clickHandler() {
      if (isValid.value) {
        try {
          await createTeamMember(userDetails.value, sendInviteStatus.value);
          resetAutosaved();
          emit("parent:call", {
            method: "reload",
          });
          emit("close:blade");
        } catch (e) {
          if (e === "EMAIL_ALREADY_EXISTS") {
            isEmailExistsModal.value = true;
          } else {
            errorMessage.value = e.message;
          }
        }
      } else {
        alert(
          unref(computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.FORM.NOT_VALID")))
        );
      }
    },
    isVisible: !props.param,
    disabled: computed(() => !(isValid.value && modified.value)),
  },
  {
    id: "save",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    async clickHandler() {
      if (isValid.value) {
        try {
          await updateTeamMember(userDetails.value);
          resetAutosaved();
          emit("parent:call", {
            method: "reload",
          });
          emit("close:blade");
        } catch (e) {
          if (e === "EMAIL_ALREADY_EXISTS") {
            isEmailExistsModal.value = true;
          }
        }
      } else {
        alert(
          unref(computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.FORM.NOT_VALID")))
        );
      }
    },
    isVisible: !!props.param,
    disabled: computed(() => props.param && !(isValid.value && modified.value)),
  },
  {
    id: "reset",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.RESET")),
    icon: "fas fa-undo",
    clickHandler() {
      resetEntries();
    },
    isVisible: !!props.param,
    disabled: computed(() => props.param && !modified.value),
  },
  {
    id: "delete",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    clickHandler() {
      deleteModal.value = true;
    },
    isVisible: !!props.param,
    disabled: computed(
      () =>
        isOwnerReadonly.value ||
        user.value.userName === props.options.user.userName
    ),
  },
  {
    id: "resend",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.RESEND")),
    icon: "fas fa-paper-plane",
    async clickHandler() {
      if (props.options && props.options.user && props.options.user.sellerId) {
        try {
          await sendTeamMemberInvitation({ id: props.options.user.id });
          emit("close:blade");
        } catch (e) {
          errorMessage.value = e.message;
        }
      }
    },
    isVisible: !!props.param,
    disabled:
      computed(() => isOwnerReadonly.value) || !!userDetails.value.email,
  },
]);

const roles = [
  {
    id: "vcmp-admin-role",
    name: "Admin",
  },
  {
    id: "vcmp-agent-role",
    name: "Agent",
  },
];

const role = computed(
  () =>
    roles.find((x) => x.id === userDetails.value.role) ||
    roles.find((x) => x.id === "vcmp-agent-role")
);

const isActive = computed({
  get: () => !userDetails.value.isLockedOut,
  set: (val) => {
    userDetails.value.isLockedOut = !val;
  },
});

onMounted(async () => {
  if (props.param && props.options.user) {
    handleUserDetailsItem(props.options.user);

    if (props.options.user.role === "vcmp-owner-role") {
      roles.push({
        id: "vcmp-owner-role",
        name: "Owner",
      });
    }
  } else {
    userDetails.value.role = role.value.id;
    handleUserDetailsItem(userDetails.value);
  }
  loadAutosaved();

  if (savedValue.value) {
    userDetails.value = savedValue.value as unknown as SellerUserDetails;
  }
});

async function removeUser() {
  if (props.param) {
    deleteModal.value = false;
    await deleteTeamMember({ id: props.param });
    emit("parent:call", {
      method: "reload",
    });
    emit("close:blade");
  }
}

async function onBeforeClose() {
  if (modified.value) {
    const confirmationStatus = confirm(
      unref(computed(() => t("SETTINGS.TEAM.ALERTS.CLOSE_CONFIRMATION")))
    );
    if (confirmationStatus) {
      resetAutosaved();
    }
    return confirmationStatus;
  }
}

defineExpose({
  onBeforeClose,
});
</script>
