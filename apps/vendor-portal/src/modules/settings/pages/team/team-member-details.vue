<template>
  <VcBlade
    :title="title"
    width="30%"
    v-loading="loading"
    @close="$emit('page:close')"
    :closable="closable"
    :expanded="expanded"
    :toolbarItems="bladeToolbar"
  >
    <VcContainer>
      <VcStatus
        :outline="false"
        :extend="true"
        variant="light-danger"
        class="w-full box-border mb-3"
        v-if="errorMessage"
      >
        <div class="flex flex-row items-center">
          <VcIcon
            icon="fas fa-exclamation-circle"
            class="text-[#ff4a4a] mr-3"
            size="xxl"
          ></VcIcon>
          <div>
            <div class="font-bold">
              {{ $t("SETTINGS.TEAM.PAGES.DETAILS.FORM.ERROR") }}
            </div>
            <div>{{ errorMessage }}</div>
          </div>
        </div>
      </VcStatus>
      <VcForm>
        <VcRow>
          <VcCol>
            <VcInput
              class="p-3"
              :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.FIRST_NAME.LABEL')"
              :placeholder="
                $t('SETTINGS.TEAM.PAGES.DETAILS.FORM.FIRST_NAME.PLACEHOLDER')
              "
              :required="true"
              name="name"
              :disabled="isOwnerReadonly"
              v-model="userDetails.firstName"
            >
            </VcInput>
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol>
            <VcInput
              class="p-3"
              :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.LAST_NAME.LABEL')"
              :placeholder="
                $t('SETTINGS.TEAM.PAGES.DETAILS.FORM.LAST_NAME.PLACEHOLDER')
              "
              :required="true"
              name="lastName"
              :disabled="isOwnerReadonly"
              v-model="userDetails.lastName"
            >
            </VcInput>
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol>
            <VcInput
              class="p-3"
              :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.EMAIL.LABEL')"
              :placeholder="
                $t('SETTINGS.TEAM.PAGES.DETAILS.FORM.EMAIL.PLACEHOLDER')
              "
              :required="true"
              name="email"
              rules="email"
              :disabled="!!props.param"
              v-model="userDetails.email"
            >
            </VcInput>
          </VcCol>
        </VcRow>

        <VcRow>
          <VcCol>
            <VcSelect
              class="p-3"
              :label="$t('SETTINGS.TEAM.PAGES.DETAILS.FORM.ROLE.LABEL')"
              :placeholder="
                $t('SETTINGS.TEAM.PAGES.DETAILS.FORM.ROLE.PLACEHOLDER')
              "
              :isRequired="true"
              name="role"
              :options="roles"
              v-model="userDetails.role"
              :initialItem="userDetails.role || role"
              keyProperty="id"
              :clearable="false"
              displayProperty="name"
              :isDisabled="isOwnerReadonly"
            >
            </VcSelect>
          </VcCol>
        </VcRow>
        <VcRow v-if="userDetails.id">
          <VcCol>
            <VcSwitch
              class="p-3"
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
              class="p-3"
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
import { IBladeToolbar } from "../../../../types";
import { useI18n, useUser } from "@virtoshell/core";
import useTeamMembers from "../../composables/useTeamMembers";
import ErrorPopup from "../../components/ErrorPopup.vue";
import WarningPopup from "../../components/WarningPopup.vue";
import { useForm } from "@virtoshell/ui";

const props = defineProps({
  expanded: {
    type: Boolean,
    default: true,
  },

  closable: {
    type: Boolean,
    default: true,
  },

  param: {
    type: String,
    default: undefined,
  },

  options: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["page:close", "parent:call"]);
const { validate } = useForm({ validateOnMount: false });
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

const title = computed(() =>
  userDetails.value.firstName && userDetails.value.lastName
    ? userDetails.value.firstName + " " + userDetails.value.lastName
    : t("SETTINGS.TEAM.PAGES.DETAILS.TITLE")
);

const isEmailExistsModal = ref(false);
const deleteModal = ref(false);
const sendInviteStatus = ref(false);
const errorMessage = ref("");

const isOwnerReadonly = computed(
  () => userDetails.value.role === "vcmp-owner-role"
);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "invite",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.CREATE")),
    icon: "fas fa-paper-plane",
    async clickHandler() {
      const { valid } = await validate();
      if (valid) {
        try {
          await createTeamMember(userDetails.value, sendInviteStatus.value);
          emit("parent:call", {
            method: "reload",
          });
          emit("page:close");
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
    disabled: computed(() => !modified.value),
  },
  {
    id: "save",
    title: computed(() => t("SETTINGS.TEAM.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    async clickHandler() {
      const { valid } = await validate();
      if (valid) {
        try {
          await updateTeamMember(userDetails.value);
          emit("parent:call", {
            method: "reload",
          });
          emit("page:close");
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
    disabled: computed(() => props.param && !modified.value),
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
          emit("page:close");
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
});

async function removeUser() {
  if (props.param) {
    deleteModal.value = false;
    await deleteTeamMember({ id: props.param });
    emit("parent:call", {
      method: "reload",
    });
    emit("page:close");
  }
}
</script>
