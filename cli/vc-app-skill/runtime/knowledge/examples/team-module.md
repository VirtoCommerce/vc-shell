# Example: Team Module (Full List + Details Pattern)

This is a complete worked example showing the canonical
list-blade + details-blade pattern with `defineBlade`, `useDataTableSort`, `useModificationTracker`,
`Field` validation, `callParent`, `exposeToChildren`, and `onBeforeClose`.

---

## `index.ts` — Module entry point

<!-- PATTERN: defineAppModule — minimal entry point wiring blades + locales -->
```typescript
import * as pages from "./pages";
import * as locales from "./locales";
import { defineAppModule } from "@vc-shell/framework";

export default defineAppModule({ blades: pages, locales });

export * from "./pages";
export * from "./composables";
```

---

## `pages/index.ts` — Re-export all page blades

<!-- PATTERN: barrel export for pages used by defineAppModule -->
```typescript
export { default as TeamList } from "./team-list.vue";
export { default as TeamMemberDetails } from "./team-member-details.vue";
```

---

## `composables/index.ts`

<!-- PATTERN: barrel export for composables -->
```typescript
export { default as useTeamMembers } from "./useTeamMembers";
export { default as useTeamMember } from "./useTeamMember";
```

---

## `locales/index.ts`

<!-- PATTERN: locale barrel — import JSON and re-export by language key -->
```typescript
import en from "./en.json";
export { en };
```

---

## `pages/team-list.vue` — List blade

<!-- PATTERN: defineBlade with isWorkspace:true, menuItem with groupConfig -->
<!-- PATTERN: useDataTableSort — sortField/sortOrder bound to VcDataTable, sortExpression watched -->
<!-- PATTERN: exposeToChildren — exposes reload so child detail blade can call callParent("reload") -->
<!-- PATTERN: openBlade with onOpen/onClose to track selectedItemId -->
<!-- PATTERN: explicit VcColumn declarations — NO v-for, enables #body slots and mobile layout -->
<!-- PATTERN: column types: image, date-ago, status, status-icon for proper rendering -->
<!-- PATTERN: mobile-role/mobile-position for mobile card layout -->

```vue
<template>
  <VcBlade
    :title="title"
    width="50%"
    :toolbar-items="bladeToolbar"
    :expandable="false"
  >
    <VcDataTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :items="membersList"
      :total-count="totalCount"
      :pagination="{ currentPage, pages }"
      v-model:active-item-id="selectedItemId"
      state-key="team_list"
      v-model:sort-field="sortField"
      v-model:sort-order="sortOrder"
      :pull-to-refresh="true"
      :empty-state="{
        icon: 'lucide-users',
        title: $t('TEAM.PAGES.LIST.EMPTY.NO_ITEMS'),
        actionLabel: $t('TEAM.PAGES.LIST.EMPTY.ADD'),
        actionHandler: onAddMember,
      }"
      @row-click="onItemClick"
      @pagination-click="onPaginationClick"
      @pull-refresh="reload"
    >
      <!-- PATTERN: each VcColumn declared explicitly for slots and mobile layout -->
      <VcColumn
        id="iconUrl"
        :title="t('TEAM.PAGES.LIST.TABLE.HEADER.IMAGE')"
        empty-icon="lucide-user"
        type="image"
        :always-visible="true"
        width="60px"
        mobile-role="image"
      />
      <VcColumn
        id="firstName"
        :title="t('TEAM.PAGES.LIST.TABLE.HEADER.FIRST_NAME')"
        :always-visible="true"
        :sortable="true"
        mobile-position="top-left"
      />
      <VcColumn
        id="lastName"
        :title="t('TEAM.PAGES.LIST.TABLE.HEADER.LAST_NAME')"
        :always-visible="true"
        :sortable="true"
        mobile-position="bottom-left"
      />
      <VcColumn
        id="email"
        :title="t('TEAM.PAGES.LIST.TABLE.HEADER.EMAIL')"
        :always-visible="true"
        mobile-position="bottom-right"
      />

      <!-- PATTERN: custom body slot for computed display value -->
      <VcColumn
        id="role"
        :title="t('TEAM.PAGES.LIST.TABLE.HEADER.ROLE')"
        :always-visible="true"
        mobile-position="top-right"
      >
        <template #body="{ data }">
          {{ roleName(data.role as string) }}
        </template>
      </VcColumn>

      <!-- PATTERN: status column with VcStatus component in #body slot -->
      <VcColumn
        id="isLockedOut"
        :title="t('TEAM.PAGES.LIST.TABLE.HEADER.STATUS')"
        :always-visible="true"
        type="status"
        mobile-role="status"
      >
        <template #body="{ data }">
          <VcStatus :variant="data.isLockedOut ? 'danger' : 'success'">
            {{ data.isLockedOut ? t('TEAM.PAGES.LIST.TABLE.STATUS.LOCKED') : t('TEAM.PAGES.LIST.TABLE.STATUS.ACTIVE') }}
          </VcStatus>
        </template>
      </VcColumn>
    </VcDataTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { UserPermissions } from "../../types";
import { IBladeToolbar, useBlade, useDataTableSort } from "@vc-shell/framework";
import useTeamMembers from "../composables/useTeamMembers";
import { useI18n } from "vue-i18n";
import { roles } from "../common";

// PATTERN: defineBlade at module scope (NOT inside setup function)
// isWorkspace:true = appears in sidebar navigation
// permissions = required permissions array
// menuItem.groupConfig = places item inside a sidebar group
defineBlade({
  name: "Team",
  url: "/team",
  isWorkspace: true,
  permissions: [UserPermissions.UsersManage],
  menuItem: {
    title: "TEAM.MENU.TITLE",
    icon: "lucide-users",
    priority: 6,
    groupConfig: {
      id: "settings",
      title: "SETTINGS.MENU.TITLE",
      icon: "lucide-store",
      priority: 6,
    },
  },
});

const { openBlade, exposeToChildren, param } = useBlade();
const { t } = useI18n({ useScope: "global" });
const { getTeamMembers, searchQuery, loading, membersList, currentPage, pages, totalCount } = useTeamMembers();

// PATTERN: useDataTableSort — returns sortField/sortOrder for v-model binding
// and sortExpression (e.g. "firstName:DESC") to pass to API
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});

const selectedItemId = ref();
const title = computed(() => t("TEAM.PAGES.LIST.TITLE"));

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("TEAM.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "lucide-refresh-cw",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "addMember",
    title: computed(() => t("TEAM.PAGES.LIST.TOOLBAR.ADD_MEMBER")),
    icon: "lucide-user-plus",
    clickHandler: onAddMember,
  },
]);

// PATTERN: columns are declared in the template, NOT as a computed array
// This allows #body slots for custom rendering (VcStatus, images, etc.)

// PATTERN: watch sortExpression to reload data when sort changes
watch(sortExpression, async (value) => {
  await getTeamMembers({ ...searchQuery.value, sort: value });
});

// PATTERN: watch param to sync selectedItemId when blade is opened with a param
watch(
  () => param.value,
  () => {
    selectedItemId.value = param.value;
  },
  { immediate: true },
);

onMounted(async () => {
  await reload();
});

const reload = async () => {
  await getTeamMembers({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value?.take ?? 20),
    sort: sortExpression.value,
  });
};

const onPaginationClick = async (page: number) => {
  await getTeamMembers({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value?.take ?? 20),
    sort: sortExpression.value,
  });
};

// PATTERN: openBlade with param + options + onOpen/onClose callbacks
const onItemClick = (event: { data: { id?: string } }) => {
  openBlade({
    name: "TeamMemberDetails",
    param: event.data.id,
    options: {
      user: event.data,
    },
    onOpen() {
      selectedItemId.value = event.data.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

const roleName = (roleId: string) => {
  if (!roleId) return "N/A";
  return roles.value.find((role) => role.id === roleId)?.name || "N/A";
};

function onAddMember() {
  // PATTERN: open details blade without param = create mode
  openBlade({
    name: "TeamMemberDetails",
  });
}

// PATTERN: exposeToChildren — makes reload available via callParent("reload") in child blades
exposeToChildren({ reload });
</script>
```

---

## `pages/team-member-details.vue` — Details blade

<!-- PATTERN: defineBlade without url/isWorkspace — child blade opened by parent -->
<!-- PATTERN: useForm from vee-validate + Field component for validation -->
<!-- PATTERN: useModificationTracker via composable — modified flag drives save/reset toolbar state -->
<!-- PATTERN: callParent("reload") after save/delete to refresh the list -->
<!-- PATTERN: closeSelf() to close blade after action -->
<!-- PATTERN: onBeforeClose — confirmation dialog when leaving with unsaved changes -->
<!-- PATTERN: isVisible on toolbar items — conditional show/hide based on create vs edit mode (!!param.value) -->

```vue
<template>
  <VcBlade
    :loading="loading"
    :title="title"
    width="50%"
    :toolbar-items="bladeToolbar"
    :expandable="false"
    :modified="modified"
  >
    <template
      v-if="$slots['error']"
      #error
    >
      <slot name="error"></slot>
    </template>
    <VcContainer>
      <VcForm>
        <VcRow>
          <VcCol>
            <!-- PATTERN: Field wraps input for vee-validate — rules, errorMessage, handleChange -->
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('TEAM.PAGES.DETAILS.FORM.FIRST_NAME.LABEL')"
              :model-value="userDetails.firstName"
              name="name"
              rules="required"
            >
              <VcInput
                v-bind="field"
                v-model="userDetails.firstName"
                class="tw-p-3"
                :label="$t('TEAM.PAGES.DETAILS.FORM.FIRST_NAME.LABEL')"
                :placeholder="$t('TEAM.PAGES.DETAILS.FORM.FIRST_NAME.PLACEHOLDER')"
                :disabled="isOwnerReadonlyComputed"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('TEAM.PAGES.DETAILS.FORM.LAST_NAME.LABEL')"
              :model-value="userDetails.lastName"
              name="lastName"
              rules="required"
            >
              <VcInput
                v-bind="field"
                v-model="userDetails.lastName"
                class="tw-p-3"
                :label="$t('TEAM.PAGES.DETAILS.FORM.LAST_NAME.LABEL')"
                :placeholder="$t('TEAM.PAGES.DETAILS.FORM.LAST_NAME.PLACEHOLDER')"
                :disabled="isOwnerReadonlyComputed"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>
          </VcCol>
          <VcCol>
            <!-- PATTERN: VcGallery for image upload with useAssets -->
            <VcGallery
              :images="photoHandler"
              class="tw-p-3"
              variant="file-upload"
              :disabled="isOwnerReadonlyComputed"
              :rules="{ fileWeight: 300 }"
              :item-actions="{ preview: true, edit: false, remove: true }"
              :multiple="false"
              hide-after-upload
              :custom-text="{
                dragHere: $t('TEAM.PAGES.DETAILS.FORM.UPLOAD.DRAG'),
                browse: $t('TEAM.PAGES.DETAILS.FORM.UPLOAD.BROWSE'),
              }"
              upload-icon="lucide-camera"
              @remove="assetsHandler.remove"
              @upload="assetsHandler.upload"
            />
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol>
            <!-- PATTERN: email field with compound rules "required|email" -->
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('TEAM.PAGES.DETAILS.FORM.EMAIL.LABEL')"
              :model-value="userDetails.email"
              name="email"
              rules="required|email"
            >
              <VcInput
                v-bind="field"
                v-model="userDetails.email"
                class="tw-p-3"
                :label="$t('TEAM.PAGES.DETAILS.FORM.EMAIL.LABEL')"
                :placeholder="$t('TEAM.PAGES.DETAILS.FORM.EMAIL.PLACEHOLDER')"
                :disabled="!!param"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol>
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('TEAM.PAGES.DETAILS.FORM.ROLE.LABEL')"
              :model-value="userDetails.role"
              name="role"
              rules="required"
            >
              <VcSelect
                v-bind="field"
                v-model="userDetails.role"
                class="tw-p-3"
                :label="$t('TEAM.PAGES.DETAILS.FORM.ROLE.LABEL')"
                :placeholder="$t('TEAM.PAGES.DETAILS.FORM.ROLE.PLACEHOLDER')"
                :options="roles"
                option-value="id"
                option-label="name"
                :disabled="isOwnerReadonly"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                :clearable="false"
                @update:model-value="handleChange"
              />
            </Field>
          </VcCol>
        </VcRow>
        <!-- PATTERN: conditional rows based on create vs edit mode -->
        <VcRow v-if="userDetails.id">
          <VcCol>
            <VcSwitch
              v-model="isActive"
              class="tw-p-3"
              :label="$t('TEAM.PAGES.DETAILS.FORM.IS_ACTIVE.LABEL')"
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
              :label="$t('TEAM.PAGES.DETAILS.FORM.INVITE.LABEL')"
            />
          </VcCol>
        </VcRow>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, unref, WritableComputedRef } from "vue";
import { useUser, IBladeToolbar, usePopup, useAssets, useBlade, ICommonAsset } from "@vc-shell/framework";
import { Field, useForm } from "vee-validate";
import type { Image, User as IUser } from "../../../api_client/virtocommerce.mymodule";
import { useI18n } from "vue-i18n";
import { useTeamMember } from "../composables";
import { roles } from "../common";

// PATTERN: useForm at the top of script setup — validateOnMount:false is typical
const { meta } = useForm({ validateOnMount: false });

// PATTERN: defineBlade for child blade — no url, no isWorkspace, no menuItem
defineBlade({
  name: "TeamMemberDetails",
});

const { user } = useUser();
const { upload: uploadImage, remove: removeImage, loading: imageLoading } = useAssets();
// PATTERN: typed options generic on useBlade<OptionsType>
const { onBeforeClose, param, options, callParent, closeSelf } = useBlade<{ user: IUser }>();
const { t } = useI18n({ useScope: "global" });
const {
  userDetails,
  loading,
  modified,      // from useModificationTracker — true when data differs from pristine
  createTeamMember,
  resetEntries,  // resets to pristineValue
  deleteTeamMember,
  updateTeamMember,
  sendTeamMemberInvitation,
  getTeamMember,
  resetModificationState,
} = useTeamMember();

const { showError, showConfirmation } = usePopup();

const isOwnerReadonly = computed(() => userDetails.value?.role === "vcmp-owner-role");
const isCurrentUser = computed(() => userDetails.value?.userName === user.value?.userName);
const isOwnerReadonlyComputed = computed(() => isOwnerReadonly.value && !isCurrentUser.value);

const title = computed(() =>
  param.value ? userDetails.value.firstName + " " + userDetails.value.lastName : t("TEAM.PAGES.DETAILS.TITLE"),
);

const sendInviteStatus = ref(false);

// PATTERN: isDisabled based on vee-validate meta — dirty AND valid
const isDisabled = computed(() => {
  return !meta.value.dirty || !meta.value.valid;
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "invite",
    title: computed(() => t("TEAM.PAGES.DETAILS.TOOLBAR.CREATE")),
    icon: "lucide-send",
    async clickHandler() {
      try {
        await createTeamMember(userDetails.value, sendInviteStatus.value);
        callParent("reload");  // PATTERN: call parent's exposed reload function
        closeSelf();
      } catch (e) {
        if (e === "EMAIL_ALREADY_EXISTS") {
          showEmailExistsError();
        } else {
          throw e;
        }
      }
    },
    isVisible: !param.value,   // PATTERN: isVisible for create-only button
    disabled: computed(() => !(!isDisabled.value && modified.value)),
  },
  {
    id: "save",
    title: computed(() => t("TEAM.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "lucide-save",
    async clickHandler() {
      try {
        await updateTeamMember(userDetails.value);
        callParent("reload");
        closeSelf();
      } catch (e) {
        if (e === "EMAIL_ALREADY_EXISTS") {
          showEmailExistsError();
        }
      }
    },
    isVisible: !!param.value,  // PATTERN: isVisible for edit-only button
    disabled: computed(() => !(!isDisabled.value && modified.value)),
  },
  {
    id: "reset",
    title: computed(() => t("TEAM.PAGES.DETAILS.TOOLBAR.RESET")),
    icon: "lucide-undo-2",
    clickHandler() {
      resetEntries();  // PATTERN: reset to pristine value
    },
    isVisible: !!param.value,
    disabled: computed(() => !!param.value && !modified.value),
  },
  {
    id: "delete",
    title: computed(() => t("TEAM.PAGES.DETAILS.TOOLBAR.DELETE")),
    icon: "lucide-trash-2",
    async clickHandler() {
      // PATTERN: showConfirmation before destructive action
      if (await showConfirmation(computed(() => t("TEAM.PAGES.DETAILS.POPUP.ALERT.MESSAGE.USER_DELETE")))) {
        await removeUser();
        callParent("reload");
        closeSelf();
      }
    },
    isVisible: !!param.value,
    disabled: computed(() => isOwnerReadonly.value || isCurrentUser.value),
  },
]);

// PATTERN: WritableComputedRef for mapping complex model shape to/from component prop
const photoHandler = computed({
  get() {
    return userDetails.value?.iconUrl ? [{ url: userDetails.value.iconUrl, title: "" }] : [];
  },
  set(value) {
    if (value) {
      userDetails.value!.iconUrl = value.find(() => true)?.url;
    } else {
      userDetails.value!.iconUrl = undefined;
    }
  },
}) as WritableComputedRef<Image[]>;

const isActive = computed({
  get: () => userDetails.value?.isLockedOut,
  set: (val) => {
    userDetails.value.isLockedOut = val;
  },
});

const assetsHandler = {
  loading: imageLoading,
  async upload(files: FileList) {
    photoHandler.value = (await uploadImage(files, `entities/${userDetails.value?.ownerId}/users`)).map(
      (x) => ({ ...x } as Image),
    );
  },
  remove: (file: Image) => {
    photoHandler.value = removeImage([file as unknown as ICommonAsset], photoHandler.value);
  },
};

onMounted(async () => {
  if (param.value) {
    await getTeamMember({ id: param.value });
  } else {
    // PATTERN: set default values in create mode, then reset modification state
    if (role.value?.id) {
      userDetails.value.role = role.value?.id;
      resetModificationState();
    }
  }
});

function showEmailExistsError() {
  showError(t("TEAM.PAGES.DETAILS.POPUP.ERROR.MESSAGE.USER_EXIST", { email: userDetails.value.email }));
}

async function removeUser() {
  if (param.value) {
    await deleteTeamMember({ id: param.value });
    callParent("reload");
    closeSelf();
  }
}

// PATTERN: onBeforeClose — return true to block close, false to allow
// Typically shows a confirmation when modified is true
onBeforeClose(async () => {
  if (modified.value) {
    return !(await showConfirmation(unref(computed(() => t("TEAM.PAGES.ALERTS.CLOSE_CONFIRMATION")))));
  }
  return false;
});
</script>
```

---

## `composables/useTeamMembers/index.ts` — List composable

<!-- PATTERN: useApiClient for typed API client access -->
<!-- PATTERN: useAsync wraps async operations — returns action fn + loading ref -->
<!-- PATTERN: useLoading merges multiple loading refs into one -->
<!-- PATTERN: Interface-first composable design — export typed interface -->

```typescript
import { useApiClient, useAsync, useLoading } from "@vc-shell/framework";
import {
  SearchUsersQuery,
  SearchUsersResult,
  User,
  UserSecurityClient,
} from "../../../../api_client/virtocommerce.mymodule";
import type { SearchUsersQuery as ISearchUsersQuery } from "../../../../api_client/virtocommerce.mymodule";
import { computed, Ref, ref } from "vue";
import { useRoute } from "vue-router";

interface IUseTeamMembers {
  readonly loading: Ref<boolean>;
  readonly membersList: Ref<User[]>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  currentPage: Ref<number>;
  searchQuery: Ref<ISearchUsersQuery>;
  getTeamMembers: (query?: ISearchUsersQuery) => Promise<void>;
}

export default (options?: { pageSize?: number; sort?: string }): IUseTeamMembers => {
  const { getApiClient } = useApiClient(UserSecurityClient);
  const route = useRoute();

  const loading = ref(false);
  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<ISearchUsersQuery>({ take: pageSize, sort: options?.sort });
  const searchResult = ref<SearchUsersResult>();

  // PATTERN: useAsync<InputType> — wraps API call, returns { action, loading }
  const { action: getTeamMembers, loading: getTeamMembersLoading } = useAsync<ISearchUsersQuery>(
    async (query) => {
      const client = await getApiClient();
      const ownerId = route?.params?.ownerId as string;
      searchQuery.value = { ...searchQuery.value, ...query };
      searchResult.value = await client.searchUsers({ ...searchQuery.value, ownerId } as SearchUsersQuery);
    },
  );

  return {
    loading: useLoading(getTeamMembersLoading),
    membersList: computed(() => searchResult.value?.results || []),
    totalCount: computed(() => searchResult.value?.totalCount || 0),
    currentPage: computed(() => Math.floor((searchQuery.value.skip || 0) / pageSize) + 1),
    pages: computed(() => Math.ceil((searchResult.value?.totalCount || 0) / pageSize)),
    searchQuery,
    getTeamMembers,
  };
};
```

---

## `composables/useTeamMember/index.ts` — Details composable

<!-- PATTERN: useModificationTracker — tracks dirty state between currentValue and pristineValue -->
<!-- PATTERN: resetModificationState(pristineValue.value) — resets to pristine (undo changes) -->
<!-- PATTERN: useLoading with multiple loading refs — merges all into one boolean -->
<!-- PATTERN: throw error code string from composable for blade to handle UI -->

```typescript
import { useModificationTracker, useApiClient, useAsync, useLoading } from "@vc-shell/framework";
import {
  UserDetails,
  CreateUserCommand,
  UpdateUserCommand,
  SendUserInvitationCommand,
  ValidationFailure,
  ValidateUserQuery,
  UserSecurityClient,
  SearchUsersQuery,
  User,
} from "../../../../api_client/virtocommerce.mymodule";
import type { UserDetails as IUserDetails, User as IUser } from "../../../../api_client/virtocommerce.mymodule";
import { computed, ComputedRef, Ref, ref } from "vue";
import { useRoute } from "vue-router";

interface IUseTeamMember {
  loading: ComputedRef<boolean>;
  userDetails: Ref<User>;
  modified: ComputedRef<boolean>;
  createTeamMember: (details: IUser, inviteStatus: boolean) => Promise<void>;
  updateTeamMember: (details: IUser) => Promise<void>;
  sendTeamMemberInvitation: (args: { id: string }) => Promise<void>;
  deleteTeamMember: (args: { id: string }) => Promise<void>;
  validateTeamMember: (details: UserDetails) => Promise<ValidationFailure[]>;
  resetEntries: () => void;
  getTeamMember: (args: { id: string }) => Promise<void>;
  resetModificationState: () => void;
}

export default (): IUseTeamMember => {
  const { getApiClient } = useApiClient(UserSecurityClient);
  const route = useRoute();

  const userDetails = ref({} as User) as Ref<User>;

  // PATTERN: useModificationTracker — currentValue is reactive proxy of userDetails
  // isModified is true when currentValue differs from pristineValue (deep compare)
  const { currentValue, pristineValue, resetModificationState, isModified } = useModificationTracker(userDetails);

  const { action: getTeamMember, loading: getTeamMemberLoading } = useAsync<{ id: string }>(async (args) => {
    const client = await getApiClient();
    const ownerId = route?.params?.ownerId as string;
    if (!args?.id) throw new Error("Id is required");

    const result = await client
      .searchUsers({ ownerId, objectIds: [args.id] } as SearchUsersQuery)
      .then((res) => res.results?.find((x) => x.id === args.id));

    if (result) {
      currentValue.value = result;
    }
    resetModificationState();
  });

  const { action: createTeamMember, loading: createTeamMemberLoading } = useAsync<IUser>(
    async (details, inviteStatus) => {
      const client = await getApiClient();
      const ownerId = route?.params?.ownerId as string;

      const command = {
        userDetails: { ...details } as UserDetails,
        sendInvitation: inviteStatus,
        ownerId,
      } as CreateUserCommand;

      // PATTERN: validate before create, throw string error code for blade to handle
      const validationResult = await validateTeamMember(command.userDetails);
      if (validationResult.length && validationResult[0].errorCode === "EMAIL_ALREADY_EXISTS") {
        throw validationResult[0].errorCode;
      }

      await client.createUser(command);
      resetModificationState();
    },
  );

  const { action: updateTeamMember, loading: updateTeamMemberLoading } = useAsync<IUser, void>(
    async (details) => {
      const client = await getApiClient();
      if (!details?.id || !details?.ownerId) throw new Error("Id and ownerId are required");

      await client.updateUser({
        ownerId: details.ownerId,
        userId: details.id,
        userDetails: { ...details } as UserDetails,
      } as UpdateUserCommand);

      resetModificationState();
    },
  );

  const { action: sendTeamMemberInvitation, loading: sendTeamMemberInvitationLoading } = useAsync<{ id: string }, void>(
    async (args) => {
      if (!args?.id) throw new Error("Id is required");
      const client = await getApiClient();
      await client.sendUserInvitation({ userId: args?.id } as SendUserInvitationCommand);
    },
  );

  const { action: deleteTeamMember, loading: deleteTeamMemberLoading } = useAsync<{ id: string }, void>(
    async (args) => {
      if (!args?.id) throw new Error("Id is required");
      const client = await getApiClient();
      return await client.deleteUsers([args.id]);
    },
  );

  const { action: validateTeamMember, loading: validateTeamMemberLoading } = useAsync<
    UserDetails,
    ValidationFailure[]
  >(async (details) => {
    const client = await getApiClient();
    return await client.validateUser({ user: details } as ValidateUserQuery);
  });

  async function resetEntries() {
    // PATTERN: pass pristineValue to reset back to original loaded state
    resetModificationState(pristineValue.value);
  }

  return {
    // PATTERN: useLoading(a, b, c, ...) — combines multiple loading refs into one
    loading: useLoading(
      createTeamMemberLoading,
      updateTeamMemberLoading,
      sendTeamMemberInvitationLoading,
      deleteTeamMemberLoading,
      validateTeamMemberLoading,
      getTeamMemberLoading,
    ),
    userDetails: currentValue,
    modified: computed(() => isModified.value),
    createTeamMember,
    updateTeamMember,
    sendTeamMemberInvitation,
    deleteTeamMember,
    validateTeamMember,
    resetEntries,
    getTeamMember,
    resetModificationState,
  };
};
```
