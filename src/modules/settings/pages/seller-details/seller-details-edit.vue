<template>
  <VcBlade
    :title="title"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    v-loading="loading"
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
                  :modelValue="sellerDetails.name"
                  name="company_name"
                  rules="required"
                >
                  <VcInput
                    v-bind="field"
                    class="tw-p-2"
                    :label="
                      $t(
                        'SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_NAME.LABEL'
                      )
                    "
                    v-model="sellerDetails.name"
                    :clearable="true"
                    :placeholder="
                      $t(
                        'SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_NAME.PLACEHOLDER'
                      )
                    "
                    maxlength="254"
                    required
                    :error="!!errors.length"
                    :error-message="errorMessage"
                    @update:modelValue="handleChange"
                  />
                </Field>
                <div class="tw-p-2">
                  <VcLabel class="tw-mb-2">{{
                    $t(
                      "SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMMISSION.LABEL"
                    )
                  }}</VcLabel>
                  <p>{{ computedFee }}</p>
                </div>
                <VcRow>
                  <VcCol>
                    <VcInput
                      class="tw-m-2"
                      :label="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_REG_NUM.LABEL'
                        )
                      "
                      v-model="sellerDetails.registrationId"
                      :placeholder="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_REG_NUM.PLACEHOLDER'
                        )
                      "
                      name="company_reg_num"
                      maxlength="128"
                      clearable
                    >
                    </VcInput>
                    <VcInput
                      class="tw-m-2"
                      :label="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_OUTER_ID.LABEL'
                        )
                      "
                      v-model="sellerDetails.outerId"
                      :placeholder="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_OUTER_ID.PLACEHOLDER'
                        )
                      "
                      name="company_outer_id"
                      maxlength="128"
                      clearable
                    >
                    </VcInput>
                  </VcCol>
                  <VcCol class="tw-m-2">
                    <VcLabel class="tw-mb-2">
                      <span>{{
                        $t(
                          "SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.UPLOAD.LABEL"
                        )
                      }}</span>
                    </VcLabel>
                    <div class="tw-relative">
                      <VcLoading :active="fileUploading"></VcLoading>
                      <VcGallery
                        class="tw-my-org__gallery -tw-m-2"
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
                        :hideAfterUpload="!!logoHandler.length"
                        rules="maxdimensions:120,120|size:1024"
                        name="logo"
                      ></VcGallery>
                    </div>

                    <VcHint class="tw-mt-1" v-if="!logoHandler.length">{{
                      $t(
                        "SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.UPLOAD.DESCRIPTION"
                      )
                    }}</VcHint>
                  </VcCol>
                </VcRow>
                <VcTextarea
                  class="tw-mb-4 tw-mx-2"
                  :label="
                    $t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.ABOUT.LABEL')
                  "
                  v-model="sellerDetails.description"
                  :clearable="true"
                  :placeholder="
                    $t(
                      'SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.ABOUT.PLACEHOLDER'
                    )
                  "
                  name="about"
                >
                </VcTextarea>
                <VcTextarea
                  class="tw-mb-4 tw-mx-2"
                  :label="
                    $t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.DELIVERY.LABEL')
                  "
                  :clearable="true"
                  v-model="sellerDetails.deliveryTime"
                  :placeholder="
                    $t(
                      'SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.DELIVERY.PLACEHOLDER'
                    )
                  "
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
                      :modelValue="sellerDetails.addresses[0].countryCode"
                      name="country"
                      rules="required"
                    >
                      <VcSelect
                        v-bind="field"
                        class="tw-m-2"
                        :label="
                          $t(
                            'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.COUNTRY.LABEL'
                          )
                        "
                        :placeholder="
                          $t(
                            'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.COUNTRY.PLACEHOLDER'
                          )
                        "
                        :options="countriesList"
                        v-model="sellerDetails.addresses[0].countryCode"
                        option-value="id"
                        option-label="name"
                        @update:modelValue="
                          (e) => {
                            handleChange(e);
                            setCountry(e);
                            getRegions(e);
                          }
                        "
                        required
                        searchable
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        :clearable="false"
                      ></VcSelect>
                    </Field>
                  </VcCol>
                  <VcCol>
                    <Field
                      v-slot="{ field, errorMessage, handleChange, errors }"
                      :modelValue="sellerDetails.addresses[0].postalCode"
                      name="zip"
                      rules="required"
                    >
                      <VcInput
                        v-bind="field"
                        class="tw-m-2 tw-my-org__num-field"
                        :label="
                          $t(
                            'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ZIP.LABEL'
                          )
                        "
                        :placeholder="
                          $t(
                            'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ZIP.PLACEHOLDER'
                          )
                        "
                        type="number"
                        v-model="sellerDetails.addresses[0].postalCode"
                        maxlength="32"
                        required
                        clearable
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        @update:modelValue="handleChange"
                      ></VcInput>
                    </Field>
                  </VcCol>
                </VcRow>
                <VcRow>
                  <VcCol>
                    <VcSelect
                      class="tw-m-2"
                      :label="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.STATE.LABEL'
                        )
                      "
                      :placeholder="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.STATE.PLACEHOLDER'
                        )
                      "
                      :options="regionsList"
                      v-model="sellerDetails.addresses[0].regionId"
                      option-value="id"
                      option-label="name"
                      @update:modelValue="setRegion"
                      name="state"
                      searchable
                      :clearable="false"
                    ></VcSelect>
                  </VcCol>
                  <VcCol>
                    <Field
                      v-slot="{ field, errorMessage, handleChange, errors }"
                      :modelValue="sellerDetails.addresses[0].city"
                      name="city"
                      rules="required"
                    >
                      <VcInput
                        v-bind="field"
                        class="tw-p-2"
                        :label="
                          $t(
                            'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.CITY.LABEL'
                          )
                        "
                        :placeholder="
                          $t(
                            'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.CITY.PLACEHOLDER'
                          )
                        "
                        v-model="sellerDetails.addresses[0].city"
                        maxlength="128"
                        required
                        clearable
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        @update:modelValue="handleChange"
                      >
                      </VcInput>
                    </Field>
                  </VcCol>
                </VcRow>
                <Field
                  v-slot="{ field, errorMessage, handleChange, errors }"
                  :modelValue="sellerDetails.addresses[0].line1"
                  name="address_first"
                  rules="required"
                >
                  <VcInput
                    v-bind="field"
                    class="tw-p-2"
                    :label="
                      $t(
                        'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_1.LABEL'
                      )
                    "
                    :placeholder="
                      $t(
                        'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_1.PLACEHOLDER'
                      )
                    "
                    v-model="sellerDetails.addresses[0].line1"
                    name="address_first"
                    maxlength="128"
                    required
                    clearable
                    :error="!!errors.length"
                    :error-message="errorMessage"
                    @update:modelValue="handleChange"
                  >
                  </VcInput>
                </Field>
                <VcInput
                  class="tw-p-2"
                  :label="
                    $t(
                      'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_2.LABEL'
                    )
                  "
                  :placeholder="
                    $t(
                      'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_2.PLACEHOLDER'
                    )
                  "
                  v-model="sellerDetails.addresses[0].line2"
                  name="address_second"
                  maxlength="128"
                  clearable
                >
                </VcInput>
                <div class="tw-m-2 tw-mb-2">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, errors }"
                    :modelValue="sellerDetails.location"
                    name="long_lat"
                    :rules="{
                      regex:
                        /^([-+]?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?)),\s*([-+]?(?:180(?:\.0+)?|(?:(?:1[0-7]\d)|(?:[1-9]?\d))(?:\.\d+)?))$/,
                    }"
                  >
                    <VcInput
                      v-bind="field"
                      :label="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.LONGLAT.LABEL'
                        )
                      "
                      :placeholder="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.LONGLAT.PLACEHOLDER'
                        )
                      "
                      v-model="sellerDetails.location"
                      name="long_lat"
                      maxlength="512"
                      :error="!!errors.length"
                      :error-message="errorMessage"
                      @update:modelValue="handleChange"
                      clearable
                    >
                    </VcInput>
                  </Field>

                  <VcHint class="tw-mt-1">{{
                    $t(
                      "SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.LONGLAT.DESCRIPTION"
                    )
                  }}</VcHint>
                </div>
              </div>
              <VcRow class="tw-border-t-[1px] tw-border-t-[#EAEEF2]">
                <VcCol>
                  <Field
                    v-slot="{ field, errorMessage, handleChange, errors }"
                    :modelValue="sellerDetails.phones[0]"
                    name="phone"
                    rules="numeric"
                  >
                    <VcInput
                      v-bind="field"
                      class="tw-mt-4 tw-mx-4 tw-my-org__num-field"
                      :label="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.PHONE.LABEL'
                        )
                      "
                      :placeholder="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.PHONE.PLACEHOLDER'
                        )
                      "
                      type="number"
                      v-model="sellerDetails.phones[0]"
                      maxlength="64"
                      :error="!!errors.length"
                      :error-message="errorMessage"
                      @update:modelValue="handleChange"
                      clearable
                    >
                    </VcInput>
                  </Field>
                </VcCol>
                <VcCol>
                  <Field
                    v-slot="{ field, errorMessage, handleChange, errors }"
                    :modelValue="sellerDetails.emails[0]"
                    name="email"
                    rules="email"
                  >
                    <VcInput
                      v-bind="field"
                      class="tw-mt-4 tw-mx-4"
                      :label="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.EMAIL.LABEL'
                        )
                      "
                      :placeholder="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.EMAIL.PLACEHOLDER'
                        )
                      "
                      v-model="sellerDetails.emails[0]"
                      maxlength="256"
                      :error="!!errors.length"
                      :error-message="errorMessage"
                      @update:modelValue="handleChange"
                      clearable
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

<script lang="ts">
import { defineComponent, onMounted, ref, computed, unref, watch } from "vue";
import { UserPermissions } from "../../../../types";

export default defineComponent({
  url: "/seller-details-edit",
  permissions: [UserPermissions.SellerDetailsEdit],
});
</script>

<script lang="ts" setup>
import {
  useI18n,
  useUser,
  useAutosave,
  useForm,
  IBladeToolbar,
} from "@vc-shell/framework";
import useSellerDetails from "../../composables/useSellerDetails";
import { Image } from "../../../../api_client/marketplacevendor";
import { useIsFormValid, Field } from "vee-validate";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "close:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
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

const { getAccessToken, user } = useUser();
useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const errorMessage = ref("");
const { t } = useI18n();
const title = t("SETTINGS.SELLER_DETAILS.TITLE");
const fileUploading = ref(false);

const computedFee = computed(() => {
  if (sellerDetails.value.commissionFee) {
    return `${sellerDetails.value.commissionFee?.name} (${
      sellerDetails.value.commissionFee?.fee
    } ${
      sellerDetails.value.commissionFee?.calculationType === "Percent"
        ? "%"
        : "Fixed"
    })`;
  }
  return "";
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("SETTINGS.SELLER_DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    disabled: computed(() => !isValid.value || !modified.value),
    async clickHandler() {
      errorMessage.value = undefined;
      if (isValid.value) {
        try {
          await updateSeller(sellerDetails.value);
        } catch (e) {
          errorMessage.value = e.message;
        }
      } else {
        alert(
          unref(computed(() => t("SETTINGS.SELLER_DETAILS.CARDS.NOT_VALID")))
        );
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
  sellerDetails.value.logo
    ? [{ url: sellerDetails.value.logo, name: user.value.userName }]
    : []
);

async function onBeforeClose() {
  if (modified.value) {
    return confirm(
      unref(
        computed(() =>
          t("SETTINGS.SELLER_DETAILS.CARDS.ALERTS.CLOSE_CONFIRMATION")
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
        `/api/assets?folderUrl=/seller_logos/${user.value.userName}`,
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
          t("SETTINGS.SELLER_DETAILS.CARDS.ALERTS.DELETE_CONFIRMATION")
        )
      )
    )
  ) {
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
