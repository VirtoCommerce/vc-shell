import { ref, computed } from "vue";

export interface Offer {
  id: string;
  name: string;
  image: string;
  createdDate: Date | string;
  sku: string;
  isActive: boolean;
  isDefault: boolean;
}

// Mock data for development
const MOCK_OFFERS: Offer[] = [
  {
    id: "1",
    name: "Summer Collection T-Shirt",
    image: "https://via.placeholder.com/60",
    createdDate: new Date(Date.now() - 1 * 86400000),
    sku: "TSH-001",
    isActive: true,
    isDefault: false,
  },
  {
    id: "2",
    name: "Winter Jacket Premium",
    image: "https://via.placeholder.com/60",
    createdDate: new Date(Date.now() - 2 * 86400000),
    sku: "JAC-002",
    isActive: true,
    isDefault: true,
  },
  {
    id: "3",
    name: "Spring Sneakers",
    image: "https://via.placeholder.com/60",
    createdDate: new Date(Date.now() - 3 * 86400000),
    sku: "SNE-003",
    isActive: false,
    isDefault: false,
  },
  {
    id: "4",
    name: "Fall Boots Leather",
    image: "https://via.placeholder.com/60",
    createdDate: new Date(Date.now() - 4 * 86400000),
    sku: "BOO-004",
    isActive: true,
    isDefault: false,
  },
  {
    id: "5",
    name: "Classic Denim Jeans",
    image: "https://via.placeholder.com/60",
    createdDate: new Date(Date.now() - 5 * 86400000),
    sku: "JEA-005",
    isActive: true,
    isDefault: false,
  }
];

export interface SearchQuery {
  skip?: number;
  take?: number;
  sort?: string;
  keyword?: string;
}

export default function useOfferList() {
  const items = ref<Offer[]>([]);
  const loading = ref(false);
  const totalCount = ref(0);
  const currentPage = ref(1);
  const searchQuery = ref<SearchQuery>({ take: 20 });
  const pageSize = 20;

  const pages = computed(() => Math.ceil(totalCount.value / pageSize));

  async function loadOffers(query?: SearchQuery) {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Apply mock filtering
    let filtered = [...MOCK_OFFERS];

    // Filter by keyword (search in name and SKU)
    if (query?.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.sku.toLowerCase().includes(keyword)
      );
    }

    // Apply sorting
    if (query?.sort) {
      const sortField = query.sort.replace(":desc", "");
      const descending = query.sort.includes(":desc");

      filtered.sort((a, b) => {
        let aVal = a[sortField as keyof Offer];
        let bVal = b[sortField as keyof Offer];

        // Handle date sorting
        if (sortField === "createdDate") {
          aVal = new Date(aVal as string).getTime();
          bVal = new Date(bVal as string).getTime();
        }

        // Handle boolean sorting
        if (typeof aVal === "boolean") {
          aVal = aVal ? 1 : 0;
          bVal = bVal ? 1 : 0;
        }

        if (aVal < bVal) return descending ? 1 : -1;
        if (aVal > bVal) return descending ? -1 : 1;
        return 0;
      });
    }

    // Apply pagination
    const skip = query?.skip || 0;
    const take = query?.take || 20;
    items.value = filtered.slice(skip, skip + take);
    totalCount.value = filtered.length;

    if (query) {
      searchQuery.value = { ...searchQuery.value, ...query };
      currentPage.value = Math.floor(skip / pageSize) + 1;
    }

    loading.value = false;
  }

  async function deleteOffer(id: string) {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Remove from mock data
    const index = MOCK_OFFERS.findIndex(item => item.id === id);
    if (index !== -1) {
      MOCK_OFFERS.splice(index, 1);
    }

    // Reload list
    await loadOffers(searchQuery.value);

    loading.value = false;
  }

  async function bulkDeleteOffers(ids: string[]) {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Remove from mock data
    ids.forEach(id => {
      const index = MOCK_OFFERS.findIndex(item => item.id === id);
      if (index !== -1) {
        MOCK_OFFERS.splice(index, 1);
      }
    });

    // Reload list
    await loadOffers(searchQuery.value);

    loading.value = false;
  }

  return {
    items: computed(() => items.value),
    loading: computed(() => loading.value),
    totalCount: computed(() => totalCount.value),
    currentPage: computed(() => currentPage.value),
    pages,
    searchQuery,
    loadOffers,
    deleteOffer,
    bulkDeleteOffers,
  };
}
