<template>
  <VcBlade
    :title="title"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    v-loading="loading"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
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
              {{ $t("SETTINGS.ORGANIZATION.CARDS.ERROR") }}
            </div>
            <div>{{ errorMessage }}</div>
          </div>
        </div>
      </VcStatus>
      <VcRow>
        <VcCol class="m-2">
          <VcCard :header="$t('SETTINGS.ORGANIZATION.CARDS.INFO.TITLE')">
            <div class="p-2">
              <VcForm>
                <VcInput
                  class="m-2"
                  :label="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_NAME.LABEL'
                    )
                  "
                  v-model="sellerDetails.name"
                  :clearable="true"
                  :required="true"
                  :placeholder="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_NAME.PLACEHOLDER'
                    )
                  "
                  :name="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_NAME.LABEL'
                    )
                  "
                >
                </VcInput>
                <VcRow>
                  <VcCol>
                    <VcInput
                      class="m-2"
                      :label="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_REG_NUM.LABEL'
                        )
                      "
                      v-model="sellerDetails.registrationId"
                      :clearable="true"
                      :required="true"
                      :placeholder="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_REG_NUM.PLACEHOLDER'
                        )
                      "
                      :name="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_REG_NUM.LABEL'
                        )
                      "
                    >
                    </VcInput>
                    <VcInput
                      class="m-2"
                      :label="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_OUTER_ID.LABEL'
                        )
                      "
                      v-model="sellerDetails.outerId"
                      :clearable="true"
                      :required="true"
                      :placeholder="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_OUTER_ID.PLACEHOLDER'
                        )
                      "
                      :name="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.COMPANY_OUTER_ID.LABEL'
                        )
                      "
                    >
                    </VcInput>
                  </VcCol>
                  <VcCol class="m-2">
                    <VcLabel class="mb-2">
                      <span>{{
                        $t("SETTINGS.ORGANIZATION.CARDS.INFO.FORM.UPLOAD.LABEL")
                      }}</span>
                    </VcLabel>
                    <div class="relative">
                      <VcLoading :active="fileUploading"></VcLoading>
                      <VcGallery
                        class="my-org__gallery -m-2"
                        :images="logoHandler"
                        @upload="onLogoUpload"
                        variant="file-upload"
                        :multiple="false"
                        @item:remove="onLogoRemove"
                        :itemActions="{
                          preview: true,
                          edit: false,
                          remove: true,
                        }"
                        :disableDrag="true"
                      ></VcGallery>
                    </div>

                    <VcHint class="mt-1">{{
                      $t(
                        "SETTINGS.ORGANIZATION.CARDS.INFO.FORM.UPLOAD.DESCRIPTION"
                      )
                    }}</VcHint>
                  </VcCol>
                </VcRow>
                <VcTextarea
                  class="mb-4 mx-2"
                  :label="
                    $t('SETTINGS.ORGANIZATION.CARDS.INFO.FORM.ABOUT.LABEL')
                  "
                  v-model="sellerDetails.description"
                  :clearable="true"
                  :required="true"
                  :placeholder="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.ABOUT.PLACEHOLDER'
                    )
                  "
                  :name="
                    $t('SETTINGS.ORGANIZATION.CARDS.INFO.FORM.ABOUT.LABEL')
                  "
                >
                </VcTextarea>
                <VcTextarea
                  class="mb-4 mx-2"
                  :label="
                    $t('SETTINGS.ORGANIZATION.CARDS.INFO.FORM.DELIVERY.LABEL')
                  "
                  :clearable="true"
                  :required="true"
                  v-model="sellerDetails.deliveryTime"
                  :placeholder="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.INFO.FORM.DELIVERY.PLACEHOLDER'
                    )
                  "
                  :name="
                    $t('SETTINGS.ORGANIZATION.CARDS.INFO.FORM.DELIVERY.LABEL')
                  "
                >
                </VcTextarea>
              </VcForm>
            </div>
          </VcCard>
        </VcCol>
        <VcCol class="m-2">
          <VcCard :header="$t('SETTINGS.ORGANIZATION.CARDS.ADDRESS.TITLE')">
            <VcForm>
              <div class="p-2">
                <VcRow>
                  <VcCol>
                    <VcSelect
                      class="m-2"
                      :label="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.COUNTRY.LABEL'
                        )
                      "
                      :clearable="false"
                      :placeholder="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.COUNTRY.PLACEHOLDER'
                        )
                      "
                      :options="countriesList"
                      v-model="sellerDetails.addresses[0].countryCode"
                      keyProperty="id"
                      displayProperty="name"
                      @update:modelValue="setCountry"
                      :name="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.COUNTRY.LABEL'
                        )
                      "
                    ></VcSelect>
                  </VcCol>
                  <VcCol>
                    <VcInput
                      class="m-2"
                      :label="
                        $t('SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ZIP.LABEL')
                      "
                      :clearable="true"
                      :placeholder="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ZIP.PLACEHOLDER'
                        )
                      "
                      v-model="sellerDetails.addresses[0].postalCode"
                      :name="
                        $t('SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ZIP.LABEL')
                      "
                    ></VcInput>
                  </VcCol>
                </VcRow>
                <VcRow>
                  <VcCol>
                    <VcInput
                      class="m-2"
                      :label="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.STATE.LABEL'
                        )
                      "
                      :clearable="true"
                      :placeholder="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.STATE.PLACEHOLDER'
                        )
                      "
                      v-model="sellerDetails.addresses[0].regionName"
                      :name="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.STATE.LABEL'
                        )
                      "
                    >
                    </VcInput>
                  </VcCol>
                  <VcCol>
                    <VcInput
                      class="p-2"
                      :label="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.CITY.LABEL'
                        )
                      "
                      :clearable="true"
                      :placeholder="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.CITY.PLACEHOLDER'
                        )
                      "
                      v-model="sellerDetails.addresses[0].city"
                      :name="
                        $t(
                          'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.CITY.LABEL'
                        )
                      "
                    >
                    </VcInput>
                  </VcCol>
                </VcRow>
                <VcInput
                  class="p-2"
                  :label="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ADDRESS_1.LABEL'
                    )
                  "
                  :clearable="true"
                  :placeholder="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ADDRESS_1.PLACEHOLDER'
                    )
                  "
                  v-model="sellerDetails.addresses[0].line1"
                  :name="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ADDRESS_1.LABEL'
                    )
                  "
                >
                </VcInput>
                <VcInput
                  class="p-2"
                  :label="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ADDRESS_2.LABEL'
                    )
                  "
                  :clearable="true"
                  :placeholder="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ADDRESS_2.PLACEHOLDER'
                    )
                  "
                  v-model="sellerDetails.addresses[0].line2"
                  :name="
                    $t(
                      'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.ADDRESS_2.LABEL'
                    )
                  "
                >
                </VcInput>
                <div class="m-2 mb-2">
                  <VcInput
                    :label="
                      $t(
                        'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.LONGLAT.LABEL'
                      )
                    "
                    :clearable="true"
                    :placeholder="
                      $t(
                        'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.LONGLAT.PLACEHOLDER'
                      )
                    "
                    v-model="sellerDetails.location"
                    :name="
                      $t(
                        'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.LONGLAT.LABEL'
                      )
                    "
                  >
                  </VcInput>
                  <VcHint class="mt-1">{{
                    $t(
                      "SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.LONGLAT.DESCRIPTION"
                    )
                  }}</VcHint>
                </div>
              </div>
              <VcRow class="border-t-[1px] border-t-[#EAEEF2]">
                <VcCol class="">
                  <VcInput
                    class="mt-4 mx-4"
                    :label="
                      $t('SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.PHONE.LABEL')
                    "
                    :clearable="true"
                    :required="true"
                    :placeholder="
                      $t(
                        'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.PHONE.PLACEHOLDER'
                      )
                    "
                    type="number"
                    v-model="sellerDetails.phones[0]"
                    :name="
                      $t('SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.PHONE.LABEL')
                    "
                  >
                  </VcInput>
                </VcCol>
                <VcCol class="">
                  <VcInput
                    class="mt-4 mx-4"
                    :label="
                      $t('SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.EMAIL.LABEL')
                    "
                    :clearable="true"
                    :required="true"
                    :placeholder="
                      $t(
                        'SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.EMAIL.PLACEHOLDER'
                      )
                    "
                    :name="
                      $t('SETTINGS.ORGANIZATION.CARDS.ADDRESS.FORM.EMAIL.LABEL')
                    "
                    rules="email"
                    v-model="sellerDetails.emails[0]"
                  >
                  </VcInput>
                </VcCol>
              </VcRow>
            </VcForm>
          </VcCard>
        </VcCol>
      </VcRow>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, unref } from "vue";
import { UserPermissions, IBladeToolbar } from "../../../../types";

export default defineComponent({
  url: "organization",
  permissions: [UserPermissions.SellerDetailsEdit],
});
</script>

<script lang="ts" setup>
import { useI18n, useUser } from "@virtoshell/core";
import useOrganization from "../../composables/useOrganization";
import { Image } from "@virtoshell/api-client";
import { useForm } from "@virtoshell/ui";

defineProps({
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
defineEmits(["page:close", "page:open"]);

const {
  getCurrentSeller,
  getCountries,
  setCountry,
  updateSeller,
  resetEntries,
  sellerDetails,
  countriesList,
  modified,
  loading,
} = useOrganization();
const { getAccessToken, user } = useUser();
const { validate } = useForm({ validateOnMount: false });
const errorMessage = ref("");
const { t } = useI18n();
const title = t("SETTINGS.ORGANIZATION.TITLE");
const fileUploading = ref(false);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("SETTINGS.ORGANIZATION.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    disabled: computed(() => !modified.value),
    async clickHandler() {
      const { valid } = await validate();

      if (valid) {
        try {
          await updateSeller(sellerDetails.value);
        } catch (e) {
          errorMessage.value = e.message;
        }
      } else {
        alert(
          unref(computed(() => t("SETTINGS.ORGANIZATION.CARDS.NOT_VALID")))
        );
      }
    },
  },
  {
    id: "reset",
    title: computed(() => t("SETTINGS.ORGANIZATION.TOOLBAR.RESET")),
    icon: "fas fa-undo",
    disabled: computed(() => !modified.value),
    clickHandler() {
      resetEntries();
    },
  },
]);

onMounted(async () => {
  await getCurrentSeller();
  await getCountries();
});

const logoHandler = computed(() =>
  sellerDetails.value.logo
    ? [{ url: sellerDetails.value.logo, name: user.value.userName }]
    : []
);

async function onBeforeClose() {
  if (modified.value) {
    return confirm(
      unref(
        computed(() =>
          t("SETTINGS.ORGANIZATION.CARDS.ALERTS.CLOSE_CONFIRMATION")
        )
      )
    );
  }
}

async function onLogoUpload(files: FileList) {
  try {
    fileUploading.value = true;
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      const authToken = await getAccessToken();
      const result = await fetch(
        `/api/assets?folderUrl=/temp/${user.value.userName}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const response = await result.json();
      if (response?.length) {
        const image = new Image(response[0]);
        image.createdDate = new Date();
        sellerDetails.value.logo = image.url;
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    fileUploading.value = false;
  }

  files = null;
}

function onLogoRemove() {
  if (
    window.confirm(
      unref(
        computed(() =>
          t("SETTINGS.ORGANIZATION.CARDS.ALERTS.DELETE_CONFIRMATION")
        )
      )
    )
  ) {
    sellerDetails.value.logo = undefined;
  }
}

defineExpose({
  title,
  onBeforeClose,
});
</script>

<style lang="scss">
.my-org {
  &__gallery .vc-file-upload {
    @apply h-[100px];
  }
}
</style>
