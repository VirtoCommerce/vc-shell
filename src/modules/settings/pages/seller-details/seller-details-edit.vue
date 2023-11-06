<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
  >
    <VcContainer>
      <VcStatus
        v-if="errorMessage"
        :outline="false"
        :extend="true"
        variant="light-danger"
        class="tw-w-full tw-box-border tw-mb-3"
      >
        <div class="tw-flex tw-flex-row tw-items-center">
          <VcIcon
            icon="fas fa-exclamation-circle"
            class="tw-text-[#ff4a4a] tw-mr-3"
            size="xxl"
          ></VcIcon>
          <div>
            <div class="tw-font-bold">
              {{ $t("SETTINGS.SELLER_DETAILS.CARDS.ERROR") }}
            </div>
            <div>{{ errorMessage }}</div>
          </div>
        </div>
      </VcStatus>
      <VcRow>
        <VcCol class="tw-m-2">
          <VcCard :header="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.TITLE')">
            <div class="tw-p-2">
              <VcForm>
                <Field
                  v-slot="{ field, errorMessage, handleChange, errors }"
                  :label="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_NAME.LABEL')"
                  :model-value="sellerDetails.name"
                  name="company_name"
                  rules="required"
                >
                  <VcInput
                    v-bind="field"
                    v-model="sellerDetails.name"
                    class="tw-p-2"
                    :label="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_NAME.LABEL')"
                    :clearable="true"
                    :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_NAME.PLACEHOLDER')"
                    maxlength="254"
                    required
                    :error="!!errors.length"
                    :error-message="errorMessage"
                    @update:model-value="handleChange"
                  />
                </Field>
                <div class="tw-p-2">
                  <VcLabel class="tw-mb-2">{{
                    $t("SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMMISSION.LABEL")
                  }}</VcLabel>
                  <p>{{ computedFee }}</p>
                </div>
                <VcRow>
                  <VcCol>
                    <VcInput
                      v-model="sellerDetails.registrationId"
                      class="tw-m-2"
                      :label="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_REG_NUM.LABEL')"
                      :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_REG_NUM.PLACEHOLDER')"
                      name="company_reg_num"
                      maxlength="128"
                      clearable
                    >
                    </VcInput>
                    <VcInput
                      v-model="sellerDetails.outerId"
                      class="tw-m-2"
                      :label="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_OUTER_ID.LABEL')"
                      :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_OUTER_ID.PLACEHOLDER')"
                      name="company_outer_id"
                      maxlength="128"
                      clearable
                    >
                    </VcInput>
                  </VcCol>
                  <VcCol class="tw-m-2">
                    <VcLabel class="tw-mb-2">
                      <span>{{ $t("SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.UPLOAD.LABEL") }}</span>
                    </VcLabel>
                    <div class="tw-relative">
                      <VcLoading :active="fileUploading"></VcLoading>
                      <VcGallery
                        class="tw-my-org__gallery -tw-m-2"
                        :images="logoHandler"
                        variant="file-upload"
                        :multiple="false"
                        :item-actions="{
                          preview: true,
                          edit: false,
                          remove: true,
                        }"
                        :disable-drag="true"
                        :hide-after-upload="!!logoHandler.length"
                        rules="mindimensions:120,120|fileWeight:1024"
                        name="logo"
                        @upload="onLogoUpload"
                        @item:remove="onLogoRemove"
                      ></VcGallery>
                    </div>

                    <VcHint
                      v-if="!logoHandler.length"
                      class="tw-mt-1"
                      >{{ $t("SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.UPLOAD.DESCRIPTION") }}</VcHint
                    >
                  </VcCol>
                </VcRow>
                <VcTextarea
                  v-model="sellerDetails.description"
                  class="tw-mb-4 tw-mx-2"
                  :label="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.ABOUT.LABEL')"
                  :clearable="true"
                  :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.ABOUT.PLACEHOLDER')"
                  name="about"
                >
                </VcTextarea>
                <VcTextarea
                  v-model="sellerDetails.deliveryTime"
                  class="tw-mb-4 tw-mx-2"
                  :label="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.DELIVERY.LABEL')"
                  :clearable="true"
                  :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.DELIVERY.PLACEHOLDER')"
                  name="delivery_time"
                >
                </VcTextarea>
              </VcForm>
            </div>
          </VcCard>
        </VcCol>
        <VcCol class="tw-m-2">
          <VcCard :header="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.TITLE')">
            <VcForm>
              <div class="tw-p-2">
                <VcRow>
                  <VcCol>
                    <Field
                      v-slot="{ field, errorMessage, handleChange, errors }"
                      :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.COUNTRY.LABEL')"
                      :model-value="sellerDetails.addresses[0].countryCode"
                      name="country"
                      rules="required"
                    >
                      <VcSelect
                        v-bind="field"
                        v-model="sellerDetails.addresses[0].countryCode"
                        class="tw-m-2"
                        :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.COUNTRY.LABEL')"
                        :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.COUNTRY.PLACEHOLDER')"
                        :options="countriesList"
                        option-value="id"
                        option-label="name"
                        required
                        searchable
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        :clearable="false"
                        @update:model-value="
                          (e: string) => {
                            handleChange(e);
                            setCountry(e);
                            getRegions(e);
                          }
                        "
                      ></VcSelect>
                    </Field>
                  </VcCol>
                  <VcCol>
                    <Field
                      v-slot="{ field, errorMessage, handleChange, errors }"
                      :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ZIP.LABEL')"
                      :model-value="sellerDetails.addresses[0].postalCode"
                      name="zip"
                      rules="required"
                    >
                      <VcInput
                        v-bind="field"
                        v-model="sellerDetails.addresses[0].postalCode"
                        class="tw-m-2 tw-my-org__num-field"
                        :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ZIP.LABEL')"
                        :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ZIP.PLACEHOLDER')"
                        type="number"
                        maxlength="32"
                        required
                        clearable
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        @update:model-value="handleChange"
                      ></VcInput>
                    </Field>
                  </VcCol>
                </VcRow>
                <VcRow>
                  <VcCol>
                    <VcSelect
                      v-model="sellerDetails.addresses[0].regionId"
                      class="tw-m-2"
                      :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.STATE.LABEL')"
                      :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.STATE.PLACEHOLDER')"
                      :options="regionsList"
                      option-value="id"
                      option-label="name"
                      name="state"
                      searchable
                      :clearable="false"
                      @update:model-value="setRegion"
                    ></VcSelect>
                  </VcCol>
                  <VcCol>
                    <Field
                      v-slot="{ field, errorMessage, handleChange, errors }"
                      :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.CITY.LABEL')"
                      :model-value="sellerDetails.addresses[0].city"
                      name="city"
                      rules="required"
                    >
                      <VcInput
                        v-bind="field"
                        v-model="sellerDetails.addresses[0].city"
                        class="tw-p-2"
                        :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.CITY.LABEL')"
                        :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.CITY.PLACEHOLDER')"
                        maxlength="128"
                        required
                        clearable
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        @update:model-value="handleChange"
                      >
                      </VcInput>
                    </Field>
                  </VcCol>
                </VcRow>
                <Field
                  v-slot="{ field, errorMessage, handleChange, errors }"
                  :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_1.LABEL')"
                  :model-value="sellerDetails.addresses[0].line1"
                  name="address_first"
                  rules="required"
                >
                  <VcInput
                    v-bind="field"
                    v-model="sellerDetails.addresses[0].line1"
                    class="tw-p-2"
                    :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_1.LABEL')"
                    :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_1.PLACEHOLDER')"
                    name="address_first"
                    maxlength="128"
                    required
                    clearable
                    :error="!!errors.length"
                    :error-message="errorMessage"
                    @update:model-value="handleChange"
                  >
                  </VcInput>
                </Field>
                <VcInput
                  v-model="sellerDetails.addresses[0].line2"
                  class="tw-p-2"
                  :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_2.LABEL')"
                  :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_2.PLACEHOLDER')"
                  name="address_second"
                  maxlength="128"
                  clearable
                >
                </VcInput>
                <div class="tw-m-2 tw-mb-2">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, errors }"
                    :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.LONGLAT.LABEL')"
                    :model-value="sellerDetails.location"
                    name="long_lat"
                    :rules="{
                      regex:
                        /^([-+]?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?)),\s*([-+]?(?:180(?:\.0+)?|(?:(?:1[0-7]\d)|(?:[1-9]?\d))(?:\.\d+)?))$/,
                    }"
                  >
                    <VcInput
                      v-bind="field"
                      v-model="sellerDetails.location"
                      :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.LONGLAT.LABEL')"
                      :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.LONGLAT.PLACEHOLDER')"
                      name="long_lat"
                      maxlength="512"
                      :error="!!errors.length"
                      :error-message="errorMessage"
                      clearable
                      @update:model-value="handleChange"
                    >
                    </VcInput>
                  </Field>

                  <VcHint class="tw-mt-1">{{
                    $t("SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.LONGLAT.DESCRIPTION")
                  }}</VcHint>
                </div>
              </div>
              <VcRow class="tw-border-t-[1px] tw-border-t-[#EAEEF2]">
                <VcCol>
                  <Field
                    v-slot="{ field, errorMessage, handleChange, errors }"
                    :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.PHONE.LABEL')"
                    :model-value="sellerDetails.phones[0]"
                    name="phone"
                    rules="numeric"
                  >
                    <VcInput
                      v-bind="field"
                      v-model="sellerDetails.phones[0]"
                      class="tw-mt-4 tw-mx-4 tw-my-org__num-field"
                      :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.PHONE.LABEL')"
                      :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.PHONE.PLACEHOLDER')"
                      type="number"
                      maxlength="64"
                      :error="!!errors.length"
                      :error-message="errorMessage"
                      clearable
                      @update:model-value="handleChange"
                    >
                    </VcInput>
                  </Field>
                </VcCol>
                <VcCol>
                  <Field
                    v-slot="{ field, errorMessage, handleChange, errors }"
                    :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.EMAIL.LABEL')"
                    :model-value="sellerDetails.emails[0]"
                    name="email"
                    rules="email"
                  >
                    <VcInput
                      v-bind="field"
                      v-model="sellerDetails.emails[0]"
                      class="tw-mt-4 tw-mx-4"
                      :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.EMAIL.LABEL')"
                      :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.EMAIL.PLACEHOLDER')"
                      maxlength="256"
                      :error="!!errors.length"
                      :error-message="errorMessage"
                      clearable
                      @update:model-value="handleChange"
                    >
                    </VcInput>
                  </Field>
                </VcCol>
              </VcRow>
            </VcForm>
          </VcCard>
        </VcCol>
      </VcRow>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, unref } from "vue";
import { UserPermissions } from "../../../types";
import { useUser, IBladeToolbar, usePopup } from "@vc-shell/framework";
import useSellerDetails from "../../composables/useSellerDetails";
import { Image } from "@vcmp-vendor-portal/api/marketplacevendor";
import { useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import { useI18n } from "vue-i18n";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "close:blade"): void;
}

defineOptions({
  url: "/seller-details-edit",
  isWorkspace: true,
  permissions: [UserPermissions.SellerDetailsEdit],
});

withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

defineEmits<Emits>();

const {
  getCurrentSeller,
  getCountries,
  setCountry,
  updateSeller,
  resetEntries,
  getRegions,
  setRegion,
  sellerDetails,
  countriesList,
  regionsList,
  modified,
  loading,
} = useSellerDetails();
const { showError, showConfirmation } = usePopup();

const { getAccessToken, user } = useUser();
useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();
const errorMessage = ref("");
const { t } = useI18n({ useScope: "global" });
const title = t("SETTINGS.SELLER_DETAILS.TITLE");
const fileUploading = ref(false);

const computedFee = computed(() => {
  if (sellerDetails.value.commissionFee) {
    return `${sellerDetails.value.commissionFee?.name} (${sellerDetails.value.commissionFee?.fee} ${
      sellerDetails.value.commissionFee?.calculationType === "Percent" ? "%" : "Fixed"
    })`;
  }
  return "";
});

const isDisabled = computed(() => {
  return !isDirty.value || !isValid.value;
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("SETTINGS.SELLER_DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    disabled: computed(() => isDisabled.value || !modified.value),
    async clickHandler() {
      errorMessage.value = undefined;
      if (isValid.value) {
        try {
          await updateSeller(sellerDetails.value);
        } catch (e) {
          errorMessage.value = e.message;
          throw e;
        }
      } else {
        showError(unref(computed(() => t("SETTINGS.SELLER_DETAILS.CARDS.NOT_VALID"))));
      }
    },
  },
  {
    id: "reset",
    title: computed(() => t("SETTINGS.SELLER_DETAILS.TOOLBAR.RESET")),
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

  if (sellerDetails.value?.addresses[0]?.countryCode) {
    await getRegions(sellerDetails.value?.addresses[0]?.countryCode);
  }
});

const logoHandler = computed(() =>
  sellerDetails.value.logo ? [{ url: sellerDetails.value.logo, name: user.value.userName, title: "" }] : []
);

async function onBeforeClose() {
  if (modified.value) {
    return await showConfirmation(unref(computed(() => t("SETTINGS.SELLER_DETAILS.CARDS.ALERTS.CLOSE_CONFIRMATION"))));
  }
}

async function onLogoUpload(files: FileList) {
  try {
    fileUploading.value = true;
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      const authToken = await getAccessToken();
      const result = await fetch(`/api/assets?folderUrl=/seller_logos/${user.value.userName}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const response = await result.json();
      if (response?.length) {
        const image = new Image(response[0]);
        image.createdDate = new Date();
        sellerDetails.value.logo = image.url;
      }
    }
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    fileUploading.value = false;
  }

  files = null;
}

async function onLogoRemove() {
  if (await showConfirmation(unref(computed(() => t("SETTINGS.SELLER_DETAILS.CARDS.ALERTS.DELETE_CONFIRMATION"))))) {
    sellerDetails.value.logo = undefined;
  }
}

// const onCountrySearch = (e: string) => {
//   filteredCountries.value = countriesList.value.filter((x) =>
//     x.name.toLowerCase().includes(e.toLowerCase())
//   );
// };

// const onRegionSearch = (e: string) => {
//   filteredRegions.value = regionsList.value.filter((x) =>
//     x.name.toLowerCase().includes(e.toLowerCase())
//   );
// };

defineExpose({
  title,
  onBeforeClose,
});
</script>

<style lang="scss">
.tw-my-org {
  &__gallery .vc-file-upload {
    @apply tw-h-[100px];
  }

  &__num-field {
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type="number"] {
      -moz-appearance: textfield;
    }
  }
}
</style>
