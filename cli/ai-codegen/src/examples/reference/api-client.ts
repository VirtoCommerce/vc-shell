/**
 * @file Reference API Client
 * @description SINGLE SOURCE OF TRUTH for API client pattern
 * @version 2.0.0
 * @lastUpdated 2025-11-26
 *
 * This is the authoritative example for API clients in VC-Shell.
 * All API clients should follow this pattern exactly.
 *
 * KEY PATTERNS:
 * 1. AuthApiBase inheritance for useApiClient compatibility
 * 2. Constructor with optional _baseUrl and _http params
 * 3. Consistent method naming: search{Entity}s, get{Entity}ById, etc.
 * 4. Proper TypeScript interfaces for all types
 * 5. Mock implementation for development (replace with real HTTP later)
 *
 * FILE STRUCTURE:
 * src/api_client/
 * ├── products.api.ts     # Types/interfaces (this file)
 * ├── products.mock.ts    # Mock data (optional)
 * └── products.client.ts  # Client class
 *
 * Or combine into single file for smaller modules.
 */

import { AuthApiBase } from "@vc-shell/framework";

// =============================================================================
// ENTITY INTERFACES
// =============================================================================

/** Main entity interface */
export interface IProduct {
  id?: string;
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  status?: string;
  isActive?: boolean;
  createdDate?: string;
  modifiedDate?: string;
}

// =============================================================================
// QUERY INTERFACES
// =============================================================================

/** Search query parameters */
export interface IProductSearchQuery {
  take?: number;
  skip?: number;
  keyword?: string;
  sort?: string;
  // Filter fields
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

/** Search result wrapper */
export interface IProductSearchResult {
  results?: IProduct[];
  totalCount?: number;
}

// =============================================================================
// COMMAND INTERFACES
// =============================================================================

/** Create command */
export interface ICreateProductCommand {
  name: string;
  sku?: string;
  description?: string;
  price?: number;
  status?: string;
  isActive?: boolean;
}

/** Update command */
export interface IUpdateProductCommand extends ICreateProductCommand {
  id: string;
}

// =============================================================================
// MOCK DATA (for development)
// =============================================================================

const MOCK_PRODUCTS: IProduct[] = [
  {
    id: "1",
    name: "Product One",
    sku: "SKU-001",
    description: "First product description",
    price: 99.99,
    status: "Active",
    isActive: true,
    createdDate: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Product Two",
    sku: "SKU-002",
    description: "Second product description",
    price: 149.99,
    status: "Inactive",
    isActive: false,
    createdDate: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Product Three",
    sku: "SKU-003",
    description: "Third product description",
    price: 199.99,
    status: "Pending",
    isActive: true,
    createdDate: new Date().toISOString(),
  },
];

// =============================================================================
// API CLIENT CLASS
// =============================================================================

/**
 * Product API Client
 *
 * ⚠️ CRITICAL: Must extend AuthApiBase for useApiClient() compatibility!
 *
 * Constructor signature must match:
 * constructor(_baseUrl?: string, _http?: { fetch: typeof fetch })
 */
export class ProductClient extends AuthApiBase {
  private products: IProduct[] = [...MOCK_PRODUCTS];

  /**
   * ⚠️ REQUIRED constructor signature for AuthApiBase
   * Keep these params even if not used in mock implementation
   */
  constructor(_baseUrl?: string, _http?: { fetch: typeof fetch }) {
    super();
  }

  // ---------------------------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------------------------

  /**
   * Search products with filtering and pagination
   * @param query - Search parameters
   */
  async searchProducts(query?: IProductSearchQuery): Promise<IProductSearchResult> {
    // Simulate network delay
    await this.delay(300);

    let results = [...this.products];

    // Apply keyword filter
    if (query?.keyword) {
      const keyword = query.keyword.toLowerCase();
      results = results.filter(
        (p) =>
          p.name?.toLowerCase().includes(keyword) ||
          p.sku?.toLowerCase().includes(keyword)
      );
    }

    // Apply status filter
    if (query?.status) {
      results = results.filter((p) => p.status === query.status);
    }

    // Apply sorting
    if (query?.sort) {
      const [field, direction] = query.sort.split(":");
      results.sort((a, b) => {
        const aVal = (a as any)[field] ?? "";
        const bVal = (b as any)[field] ?? "";
        const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return direction === "DESC" ? -cmp : cmp;
      });
    }

    const totalCount = results.length;

    // Apply pagination
    const skip = query?.skip ?? 0;
    const take = query?.take ?? 20;
    results = results.slice(skip, skip + take);

    return { results, totalCount };
  }

  // ---------------------------------------------------------------------------
  // GET BY ID
  // ---------------------------------------------------------------------------

  /**
   * Get single product by ID
   * @param id - Product ID
   */
  async getProductById(id: string): Promise<IProduct> {
    await this.delay(200);

    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new Error(`Product not found: ${id}`);
    }

    return { ...product };
  }

  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------

  /**
   * Create new product
   * @param command - Create command
   */
  async createProduct(command: ICreateProductCommand): Promise<IProduct> {
    await this.delay(300);

    const newProduct: IProduct = {
      ...command,
      id: crypto.randomUUID(),
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
    };

    this.products.push(newProduct);
    return { ...newProduct };
  }

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------

  /**
   * Update existing product
   * @param command - Update command
   */
  async updateProduct(command: IUpdateProductCommand): Promise<IProduct> {
    await this.delay(300);

    const index = this.products.findIndex((p) => p.id === command.id);
    if (index === -1) {
      throw new Error(`Product not found: ${command.id}`);
    }

    const updated: IProduct = {
      ...this.products[index],
      ...command,
      modifiedDate: new Date().toISOString(),
    };

    this.products[index] = updated;
    return { ...updated };
  }

  // ---------------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------------

  /**
   * Delete single product
   * @param id - Product ID
   */
  async deleteProduct(id: string): Promise<void> {
    await this.delay(200);

    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product not found: ${id}`);
    }

    this.products.splice(index, 1);
  }

  /**
   * Delete multiple products
   * @param ids - Array of product IDs
   */
  async deleteProducts(ids: string[]): Promise<void> {
    await this.delay(300);

    this.products = this.products.filter((p) => !ids.includes(p.id!));
  }

  // ---------------------------------------------------------------------------
  // UTILITIES
  // ---------------------------------------------------------------------------

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
