import type {
  SearchOffersQuery,
  SearchOffersResult,
  IOfferDetails,
  CreateNewOfferCommand,
  UpdateOfferCommand,
  ValidateOfferQuery,
  ValidateOfferResult,
  BulkOffersDeleteCommand,
  ChangeOfferDefaultCommand,
  SearchProductsForNewOfferQuery,
  IProduct,
} from "../modules/offers/types";

/**
 * Mock API Client for Offers Management
 * Replace with actual API implementation
 */
export class OffersClient {
  private mockOffers: IOfferDetails[] = [];
  private mockProducts: IProduct[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with sample data
    this.mockProducts = [
      {
        id: "product-1",
        name: "Product A",
        code: "PROD-001",
        imgSrc: "https://via.placeholder.com/100",
      },
      {
        id: "product-2",
        name: "Product B",
        code: "PROD-002",
        imgSrc: "https://via.placeholder.com/100",
      },
    ];

    this.mockOffers = [
      {
        id: "offer-1",
        productId: "product-1",
        name: "Special Offer A",
        productType: "Physical",
        sku: "ABC-12345678",
        trackInventory: true,
        fulfillmentCenterQuantities: {
          "center-1": 100,
          "center-2": 50,
        },
        isActive: true,
        isDefault: false,
        createdDate: new Date("2024-01-01"),
      },
      {
        id: "offer-2",
        productId: "product-2",
        name: "Special Offer B",
        productType: "Digital",
        sku: "XYZ-87654321",
        trackInventory: false,
        fulfillmentCenterQuantities: {},
        isActive: true,
        isDefault: true,
        createdDate: new Date("2024-01-15"),
      },
    ];
  }

  async searchOffers(query: SearchOffersQuery): Promise<SearchOffersResult> {
    await this.delay(300);

    let filtered = [...this.mockOffers];

    // Apply keyword filter
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          offer.name.toLowerCase().includes(keyword) || offer.sku.toLowerCase().includes(keyword)
      );
    }

    // Apply sorting
    if (query.sort) {
      const [field, direction] = query.sort.split(":");
      filtered.sort((a, b) => {
        const aVal = (a as any)[field];
        const bVal = (b as any)[field];
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return direction === "desc" ? -comparison : comparison;
      });
    }

    const total = filtered.length;
    const skip = query.skip || 0;
    const take = query.take || 20;
    const results = filtered.slice(skip, skip + take);

    return {
      results: results.map((offer) => ({
        id: offer.id!,
        productImage: this.mockProducts.find((p) => p.id === offer.productId)?.imgSrc,
        productName: this.mockProducts.find((p) => p.id === offer.productId)?.name || "",
        createdDate: offer.createdDate!,
        sku: offer.sku,
        isActive: offer.isActive || false,
        isDefault: offer.isDefault || false,
      })),
      totalCount: total,
    };
  }

  async getOfferByIdGET(id: string): Promise<IOfferDetails> {
    await this.delay(200);
    const offer = this.mockOffers.find((o) => o.id === id);
    if (!offer) {
      throw new Error(`Offer with id ${id} not found`);
    }
    return { ...offer };
  }

  async createNewOffer(command: CreateNewOfferCommand): Promise<IOfferDetails> {
    await this.delay(500);

    const newOffer: IOfferDetails = {
      id: `offer-${Date.now()}`,
      ...command,
      productType: command.productType as "Physical" | "Digital",
      isActive: true,
      isDefault: false,
      createdDate: new Date(),
    };

    this.mockOffers.push(newOffer);
    return newOffer;
  }

  async updateOffer(command: UpdateOfferCommand): Promise<IOfferDetails> {
    await this.delay(500);

    const index = this.mockOffers.findIndex((o) => o.id === command.id);
    if (index === -1) {
      throw new Error(`Offer with id ${command.id} not found`);
    }

    const updated = {
      ...this.mockOffers[index],
      ...command,
    };

    this.mockOffers[index] = updated;
    return updated;
  }

  async deleteOffers(ids: string[]): Promise<void> {
    await this.delay(300);
    this.mockOffers = this.mockOffers.filter((o) => !ids.includes(o.id!));
  }

  async bulkDeleteOffers(command: BulkOffersDeleteCommand): Promise<void> {
    await this.deleteOffers(command.ids);
  }

  async validateOffer(query: ValidateOfferQuery): Promise<ValidateOfferResult> {
    await this.delay(300);

    const exists = this.mockOffers.some(
      (o) => o.sku.toLowerCase() === query.sku.toLowerCase() && o.id !== query.id
    );

    if (exists) {
      return {
        isValid: false,
        errors: [
          {
            propertyName: "sku",
            errorMessage: `An offer with the SKU: ${query.sku} already exists`,
          },
        ],
      };
    }

    return { isValid: true };
  }

  async changeOfferDefault(command: ChangeOfferDefaultCommand): Promise<void> {
    await this.delay(300);

    // Set all offers to not default
    this.mockOffers.forEach((o) => {
      o.isDefault = false;
    });

    // Set the requested offer as default
    const offer = this.mockOffers.find((o) => o.id === command.offerId);
    if (offer) {
      offer.isDefault = true;
    }
  }

  async searchOfferProducts(query: SearchProductsForNewOfferQuery): Promise<{ results: IProduct[] }> {
    await this.delay(200);

    let filtered = [...this.mockProducts];

    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(keyword) || p.code.toLowerCase().includes(keyword)
      );
    }

    return {
      results: filtered.slice(0, query.take || 20),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
