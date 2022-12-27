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
        <div class= "tw-flex tw-flex-row tw-items-center">
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
                  <Field v-slot="{field, errorMessage, handleChange}" :modelValue="sellerDetails.name" name="company_name" rules="required">
                      <VcInput
                              v-bind="field"
                              class="tw-p-2"
                              :label="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_NAME.LABEL')"
                              v-model="sellerDetails.name"
                              :clearable="true"
                              :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_NAME.PLACEHOLDER')"
                              maxchars="254"
                              is-required
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
                      :clearable="true"
                      :placeholder="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_REG_NUM.PLACEHOLDER'
                        )
                      "
                      name="company_reg_num"
                      maxchars="128"
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
                      :clearable="true"
                      :placeholder="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.INFO.FORM.COMPANY_OUTER_ID.PLACEHOLDER'
                        )
                      "
                      name="company_outer_id"
                      maxchars="128"
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
                      <Field v-slot="{field, errorMessage, handleChange}" :modelValue="sellerDetails.addresses[0].countryCode" name="country" rules="required">
                          <VcSelect
                                  v-bind="field"
                                  class="tw-m-2"
                                  :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.COUNTRY.LABEL')"
                                  :clearable="false"
                                  :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.COUNTRY.PLACEHOLDER')"
                                  :options="filteredCountries"
                                  :initialItem="initialCountry"
                                  v-model="sellerDetails.addresses[0].countryCode"
                                  :isSearchable="true"
                                  @search="onCountrySearch"
                                  keyProperty="id"
                                  displayProperty="name"
                                  @update:modelValue="(e) => {handleChange(e); setCountry(e)}"
                                  @change="getRegions"
                                  is-required
                                  :error-message="errorMessage"
                          ></VcSelect>
                      </Field>
                  </VcCol>
                  <VcCol>
                      <Field v-slot="{field, errorMessage, handleChange}" :modelValue="sellerDetails.addresses[0].postalCode" name="zip" rules="required">
                          <VcInput
                                  v-bind="field"
                                  class="tw-m-2 tw-my-org__num-field"
                                  :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ZIP.LABEL')"
                                  :clearable="true"
                                  :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ZIP.PLACEHOLDER')"
                                  type="number"
                                  v-model="sellerDetails.addresses[0].postalCode"
                                  maxchars="32"
                                  is-required
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
                      :clearable="false"
                      :placeholder="
                        $t(
                          'SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.STATE.PLACEHOLDER'
                        )
                      "
                      :options="filteredRegions"
                      :initialItem="initialRegion"
                      v-model="sellerDetails.addresses[0].regionId"
                      :isSearchable="true"
                      @search="onRegionSearch"
                      keyProperty="id"
                      displayProperty="name"
                      @update:modelValue="setRegion"
                      name="state"
                    ></VcSelect>
                  </VcCol>
                  <VcCol>
                      <Field v-slot="{field, errorMessage, handleChange}" :modelValue="sellerDetails.addresses[0].city" name="city" rules="required">
                          <VcInput
                                  v-bind="field"
                                  class="tw-p-2"
                                  :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.CITY.LABEL')"
                                  :clearable="true"
                                  :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.CITY.PLACEHOLDER')"
                                  v-model="sellerDetails.addresses[0].city"
                                  maxchars="128"
                                  is-required
                                  :error-message="errorMessage"
                                  @update:modelValue="handleChange"
                          >
                          </VcInput>
                      </Field>
                  </VcCol>
                </VcRow>
                  <Field v-slot="{field, errorMessage, handleChange}" :modelValue="sellerDetails.addresses[0].line1" name="address_first" rules="required">
                      <VcInput
                              v-bind="field"
                              class="tw-p-2"
                              :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_1.LABEL')"
                              :clearable="true"
                              :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_1.PLACEHOLDER')"
                              v-model="sellerDetails.addresses[0].line1"
                              name="address_first"
                              maxchars="128"
                              is-required
                              :error-message="errorMessage"
                              @update:modelValue="handleChange"
                      >
                      </VcInput>
                  </Field>
                <VcInput
                  class="tw-p-2"
                  :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_2.LABEL')"
                  :clearable="true"
                  :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.ADDRESS_2.PLACEHOLDER')"
                  v-model="sellerDetails.addresses[0].line2"
                  name="address_second"
                  maxchars="128"
                >
                </VcInput>
                <div class="tw-m-2 tw-mb-2">
                    <Field v-slot="{field, errorMessage, handleChange}" :modelValue="sellerDetails.location" name="long_lat" :rules="{
                      regex:
                        /^([-+]?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?)),\s*([-+]?(?:180(?:\.0+)?|(?:(?:1[0-7]\d)|(?:[1-9]?\d))(?:\.\d+)?))$/,
                    }">
                        <VcInput
                                v-bind="field"
                                :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.LONGLAT.LABEL')"
                                :clearable="true"
                                :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.LONGLAT.PLACEHOLDER')"
                                v-model="sellerDetails.location"
                                name="long_lat"
                                maxchars="512"
                                :error-message="errorMessage"
                                @update:modelValue="handleChange"
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
                    <Field v-slot="{field, errorMessage, handleChange}" :modelValue="sellerDetails.phones[0]" name="phone" rules="numeric">
                        <VcInput
                                v-bind="field"
                                class="tw-mt-4 tw-mx-4 tw-my-org__num-field"
                                :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.PHONE.LABEL')"
                                :clearable="true"
                                :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.PHONE.PLACEHOLDER')"
                                type="number"
                                v-model="sellerDetails.phones[0]"
                                maxchars="64"
                                :error-message="errorMessage"
                                @update:modelValue="handleChange"
                        >
                        </VcInput>
                    </Field>
                </VcCol>
                <VcCol>
                    <Field v-slot="{field, errorMessage, handleChange}" :modelValue="sellerDetails.emails[0]" name="email" rules="email">
                        <VcInput
                                v-bind="field"
                                class="tw-mt-4 tw-mx-4"
                                :label="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.EMAIL.LABEL')"
                                :clearable="true"
                                :placeholder="$t('SETTINGS.SELLER_DETAILS.CARDS.ADDRESS.FORM.EMAIL.PLACEHOLDER')"
                                v-model="sellerDetails.emails[0]"
                                maxchars="256"
                                :error-message="errorMessage"
                                @update:modelValue="handleChange"
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
const { resetAutosaved, loadAutosaved, savedValue } = useAutosave(
  sellerDetails,
  modified,
  props.param ?? "sellerDetails"
);
const { getAccessToken, user } = useUser();
useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const errorMessage = ref("");
const { t } = useI18n();
const title = t("SETTINGS.SELLER_DETAILS.TITLE");
const fileUploading = ref(false);
const filteredCountries = ref([]);
const filteredRegions = ref([]);

const initialCountry = computed(() =>
  countriesList.value.find(
    (x) => x.id === sellerDetails.value.addresses[0].countryCode
  )
);

const initialRegion = computed(() =>
  regionsList.value.find(
    (x) => x.id === sellerDetails.value.addresses[0].regionId
  )
);
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

watch(
  () => countriesList.value,
  () => {
    filteredCountries.value = countriesList.value;
  }
);

watch(
  () => regionsList.value,
  () => {
    filteredRegions.value = regionsList.value;
  }
);

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
  loadSave();
  await getCountries();

  if (sellerDetails.value?.addresses[0]?.countryCode) {
    await getRegions(sellerDetails.value?.addresses[0]?.countryCode);
  }
});

function loadSave() {
  loadAutosaved();
  if (savedValue.value) {
    sellerDetails.value = Object.assign({}, savedValue.value);
  }
}

const logoHandler = computed(() =>
  sellerDetails.value.logo
    ? [{ url: sellerDetails.value.logo, name: user.value.userName }]
    : []
);

async function onBeforeClose() {
  if (modified.value) {
    const confirmationStatus = confirm(
      unref(
        computed(() =>
          t("SETTINGS.SELLER_DETAILS.CARDS.ALERTS.CLOSE_CONFIRMATION")
        )
      )
    );
    if (confirmationStatus) {
      resetAutosaved();
    }
    return confirmationStatus;
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

const onCountrySearch = (e: string) => {
  filteredCountries.value = countriesList.value.filter((x) =>
    x.name.toLowerCase().includes(e.toLowerCase())
  );
};

const onRegionSearch = (e: string) => {
  filteredRegions.value = regionsList.value.filter((x) =>
    x.name.toLowerCase().includes(e.toLowerCase())
  );
};

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
