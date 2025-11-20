import type {
  IOffer,
  IOfferDetails,
  SearchOffersQuery,
  SearchOffersResult,
  CreateNewOfferCommand,
  UpdateOfferCommand,
  BulkOffersDeleteCommand,
  ValidateOfferQuery,
  ValidationResult,
  ChangeOfferDefaultCommand,
  SearchProductsForNewOfferQuery,
  IProduct,
} from "../modules/offers/types";

/**
 * Mocked API Client for Offers
 * Replace these methods with actual API calls when backend is ready
 */
export class OffersClient {
  private mockOffers: IOfferDetails[] = [
    {
      id: "1",
      sku: "OFF-12345678",
      name: "Premium Product Offer",
      productId: "prod-1",
      productType: "Physical",
      isActive: true,
      isDefault: true,
      trackInventory: false,
      createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      modifiedDate: new Date().toISOString(),
      product: {
        id: "prod-1",
        name: "Premium Product",
        sku: "PROD-001",
        imgSrc: "https://via.placeholder.com/150",
      },
      images: [
        {
          id: "img-1",
          url: "https://via.placeholder.com/400",
          name: "Product Image 1",
          sortOrder: 0,
        },
      ],
      inventoryInfo: [
        {
          fulfillmentCenterId: "fc-1",
          fulfillmentCenterName: "Main Warehouse",
          inStockQuantity: 100,
        },
      ],
      priceList: [],
    },
    {
      id: "2",
      sku: "OFF-87654321",
      name: "Digital Product Offer",
      productId: "prod-2",
      productType: "Digital",
      isActive: true,
      isDefault: false,
      trackInventory: true,
      createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      modifiedDate: new Date().toISOString(),
      product: {
        id: "prod-2",
        name: "Digital Product",
        sku: "PROD-002",
        imgSrc: "https://via.placeholder.com/150",
      },
      images: [],
      inventoryInfo: [],
      priceList: [],
    },
  ];

  private mockProducts: IProduct[] = [
    {
      id: "prod-1",
      name: "Premium Product",
      sku: "PROD-001",
      imgSrc: "https://via.placeholder.com/150",
    },
    {
      id: "prod-2",
      name: "Digital Product",
      sku: "PROD-002",
      imgSrc: "https://via.placeholder.com/150",
    },
    {
      id: "prod-3",
      name: "Standard Product",
      sku: "PROD-003",
      imgSrc: "https://via.placeholder.com/150",
    },
  ];

  /**
   * Search offers with pagination, sorting, and filtering
   */
  async searchOffers(query: SearchOffersQuery): Promise<SearchOffersResult> {
    // Simulate API delay
    await this.delay(300);

    let filtered = [...this.mockOffers];

    // Apply keyword filter
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          offer.name?.toLowerCase().includes(keyword) ||
          offer.sku?.toLowerCase().includes(keyword) ||
          offer.product?.name?.toLowerCase().includes(keyword)
      );
    }

    // Apply sorting
    if (query.sort) {
      const [field, order] = query.sort.split(":");
      filtered.sort((a, b) => {
        let aVal: any = a;
        let bVal: any = b;

        // Handle nested fields
        if (field.includes(".")) {
          const fields = field.split(".");
          aVal = fields.reduce((obj, key) => obj?.[key], a);
          bVal = fields.reduce((obj, key) => obj?.[key], b);
        } else {
          aVal = a[field as keyof IOfferDetails];
          bVal = b[field as keyof IOfferDetails];
        }

        if (aVal < bVal) return order === "asc" ? -1 : 1;
        if (aVal > bVal) return order === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    const skip = query.skip || 0;
    const take = query.take || 20;
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + take);

    return {
      results: paginated as IOffer[],
      totalCount: total,
    };
  }

  /**
   * Get offer by ID
   */
  async getOfferByIdGET(id: string): Promise<IOfferDetails> {
    await this.delay(200);

    const offer = this.mockOffers.find((o) => o.id === id);
    if (!offer) {
      throw new Error(`Offer with ID ${id} not found`);
    }

    return { ...offer };
  }

  /**
   * Create new offer
   */
  async createNewOffer(command: CreateNewOfferCommand): Promise<IOfferDetails> {
    await this.delay(500);

    const newOffer: IOfferDetails = {
      id: `offer-${Date.now()}`,
      ...command,
      isActive: true,
      isDefault: false,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      product: this.mockProducts.find((p) => p.id === command.productId),
      images: [],
      priceList: [],
    };

    this.mockOffers.push(newOffer);
    return newOffer;
  }

  /**
   * Update existing offer
   */
  async updateOffer(command: UpdateOfferCommand): Promise<void> {
    await this.delay(400);

    const index = this.mockOffers.findIndex((o) => o.id === command.id);
    if (index === -1) {
      throw new Error(`Offer with ID ${command.id} not found`);
    }

    this.mockOffers[index] = {
      ...this.mockOffers[index],
      ...command,
      modifiedDate: new Date().toISOString(),
    };
  }

  /**
   * Delete offers by IDs
   */
  async deleteOffers(ids: string[]): Promise<void> {
    await this.delay(300);

    ids.forEach((id) => {
      const index = this.mockOffers.findIndex((o) => o.id === id);
      if (index !== -1) {
        this.mockOffers.splice(index, 1);
      }
    });
  }

  /**
   * Bulk delete offers
   */
  async bulkDeleteOffers(command: BulkOffersDeleteCommand): Promise<void> {
    await this.deleteOffers(command.ids);
  }

  /**
   * Validate offer SKU uniqueness
   */
  async validateOffer(query: ValidateOfferQuery): Promise<ValidationResult> {
    await this.delay(200);

    const exists = this.mockOffers.some(
      (offer) => offer.sku === query.sku && offer.id !== query.id
    );

    if (exists) {
      return {
        isValid: false,
        errors: [
          {
            propertyName: "SKU",
            errorMessage: `An offer with the SKU: ${query.sku} already exists`,
            errorCode: "SKU_DUPLICATE",
          },
        ],
      };
    }

    return {
      isValid: true,
      errors: [],
    };
  }

  /**
   * Change offer default status
   */
  async changeOfferDefault(command: ChangeOfferDefaultCommand): Promise<void> {
    await this.delay(300);

    // Set all offers to non-default
    this.mockOffers.forEach((offer) => {
      offer.isDefault = false;
    });

    // Set the specified offer as default
    const offer = this.mockOffers.find((o) => o.id === command.id);
    if (offer) {
      offer.isDefault = true;
      offer.modifiedDate = new Date().toISOString();
    }
  }

  /**
   * Enable offer
   */
  async enableOffer(id: string): Promise<void> {
    await this.delay(200);

    const offer = this.mockOffers.find((o) => o.id === id);
    if (offer) {
      offer.isActive = true;
      offer.modifiedDate = new Date().toISOString();
    }
  }

  /**
   * Disable offer
   */
  async disableOffer(id: string): Promise<void> {
    await this.delay(200);

    const offer = this.mockOffers.find((o) => o.id === id);
    if (offer) {
      offer.isActive = false;
      offer.modifiedDate = new Date().toISOString();
    }
  }

  /**
   * Search products for new offer
   */
  async searchOfferProducts(query: SearchProductsForNewOfferQuery): Promise<IProduct[]> {
    await this.delay(300);

    if (!query.keyword || query.keyword.length < 2) {
      return [];
    }

    const keyword = query.keyword.toLowerCase();
    return this.mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword)
    );
  }

  /**
   * Upload images for offer
   */
  async uploadImages(offerId: string, files: File[]): Promise<Array<{ id: string; url: string; name: string }>> {
    await this.delay(1000);

    // Mock image upload
    return files.map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
      sortOrder: index,
    }));
  }

  /**
   * Delete image
   */
  async deleteImage(imageId: string): Promise<void> {
    await this.delay(200);
    // Mock deletion
  }

  /**
   * Get marketplace settings
   */
  async getSettings(): Promise<{ allowMultipleOffers: boolean }> {
    await this.delay(100);
    return {
      allowMultipleOffers: true,
    };
  }

  /**
   * Get available languages
   */
  async getLanguages(): Promise<Array<{ code: string; displayName: string }>> {
    await this.delay(100);
    return [
      { code: "en-US", displayName: "English (US)" },
      { code: "es-ES", displayName: "Español" },
      { code: "fr-FR", displayName: "Français" },
    ];
  }

  /**
   * Simulate API delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const offersClient = new OffersClient();
