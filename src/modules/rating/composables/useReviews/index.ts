import { useUser } from "@vc-shell/framework";
import { computed, ref, Ref } from "vue";
import {
  CustomerReview,
  SearchCustomerReviewsQuery,
  SearchCustomerReviewsResult,
  VcmpSellerRatingAndReviewsClient,
  ICustomerReview,
  ISearchCustomerReviewsQuery,
} from "../../../../api_client/marketplacevendor";

interface IUseReviewsOptions {
  pageSize?: number;
  sort?: string;
}

interface IUseReviews {
  readonly loading: Ref<boolean>;
  readonly reviews: Ref<ICustomerReview[]>;
  readonly customerReview: Ref<CustomerReview>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  currentPage: Ref<number>;
  sort: Ref<string>;
  loadReviews: () => void;
  handleReview: (review: CustomerReview) => void;
}

const loading = ref(false);

export default (options?: IUseReviewsOptions): IUseReviews => {
  const pageSize = options?.pageSize || 20;
  const currentPage = ref(1);
  const sort = ref(options?.sort || "createdDate:DESC");
  const searchQuery = computed(
    () =>
      ({
        take: pageSize,
        skip: (currentPage.value - 1) * pageSize,
        sort: sort.value,
      } as ISearchCustomerReviewsQuery)
  );
  const searchResult = ref<SearchCustomerReviewsResult>();

  const customerReview = ref(new CustomerReview());

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerRatingAndReviewsClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function loadReviews() {
    const client = await getApiClient();

    const body = new SearchCustomerReviewsQuery(searchQuery.value);

    try {
      loading.value = true;
      searchResult.value = await client.searchCustomerReviews(body);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function handleReview(review: CustomerReview) {
    customerReview.value = Object.assign({}, new CustomerReview(review));
  }

  return {
    loading: computed(() => loading.value),
    reviews: computed(() => searchResult.value?.results),
    customerReview: computed(() => customerReview.value),
    totalCount: computed(() => searchResult.value?.totalCount),
    pages: computed(() => Math.ceil(searchResult.value?.totalCount / pageSize)),
    currentPage,
    sort,
    loadReviews,
    handleReview,
  };
};
