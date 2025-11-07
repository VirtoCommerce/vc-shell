# API Client Generation Guide

Complete guide for generating and using API clients in VC Shell applications.

## When to Use This

Use these prompts when you need to:
- Connect your module to a backend API
- Generate TypeScript API clients from OpenAPI/Swagger
- Integrate with VirtoCommerce Platform
- Use custom REST APIs

## Prerequisites

- VC Shell application created with `create-vc-app`
- Node.js 18 or higher
- Access to API endpoint or OpenAPI specification
- Backend URL and authentication details

---

## Quick Start

### Step 1: Configure Environment

**Prompt for AI:**
```
Configure my VC Shell app to connect to the API at https://my-backend.com

Setup:
- API URL: https://my-backend.com
- Platform modules: Virtocommerce.Catalog, Virtocommerce.Orders
```

**AI will create/update `.env.local`:**
```env
APP_PLATFORM_URL=https://my-backend.com
APP_PLATFORM_MODULES=[Virtocommerce.Catalog, Virtocommerce.Orders]
APP_API_CLIENT_DIRECTORY=./src/api_client/
```

---

### Step 2: Generate API Client

**Prompt for AI:**
```
Generate API client using the configured platform URL.
```

**AI will run:**
```bash
yarn generate-api-client
```

**Expected output:**
```
✓ Fetching API specifications...
✓ Generating TypeScript clients...
✓ Building API client package...
✓ API client generated successfully!

Generated clients:
- src/api_client/virtocommerce.catalog
- src/api_client/virtocommerce.orders
```

---

### Step 3: Use Generated Client

**Prompt for AI:**
```
Update the products module to use the generated Catalog API client.

Operations needed:
- Load products list in grid blade
- Load single product in details blade
- Save product (create/update)
- Delete product
```

**AI will update composables:**

```typescript
// src/modules/products/composables/useProductList.ts
import { useApiClient } from '@vc-shell/framework';
import { Catalog } from '../../../api_client/virtocommerce.catalog';

export function useProductList() {
  const { getApiClient } = useApiClient(Catalog);

  const { action: loadProducts, loading, items } = useAsync(async () => {
    const client = await getApiClient();
    const response = await client.searchProducts({
      searchPhrase: searchQuery.value,
      skip: (currentPage.value - 1) * pageSize.value,
      take: pageSize.value
    });
    
    return {
      results: response.data.results || [],
      totalCount: response.data.totalCount || 0
    };
  });

  return {
    loadProducts,
    loading,
    items
  };
}
```

---

## Detailed Examples

### Example 1: VirtoCommerce Platform Integration

**Scenario:** Connect to VirtoCommerce Platform API

**Prompt for AI:**
```
Configure API client for VirtoCommerce Platform.

Platform details:
- URL: https://demo.virtocommerce.com
- Modules needed:
  - Virtocommerce.Catalog (products, categories)
  - Virtocommerce.Orders (orders management)
  - Virtocommerce.Customer (customer data)
  - Virtocommerce.Inventory (stock management)

Generate clients and show me how to use them in my modules.
```

**AI will:**

1. **Update `.env.local`:**
```env
APP_PLATFORM_URL=https://demo.virtocommerce.com
APP_PLATFORM_MODULES=[Virtocommerce.Catalog, Virtocommerce.Orders, Virtocommerce.Customer, Virtocommerce.Inventory]
APP_API_CLIENT_DIRECTORY=./src/api_client/
```

2. **Update `package.json` (if not exists):**
```json
{
  "scripts": {
    "generate-api-client": "cross-env api-client-generator"
  }
}
```

3. **Run generation:**
```bash
yarn generate-api-client
```

4. **Create example usage:**
```typescript
// Example: Products composable
import { useApiClient } from '@vc-shell/framework';
import { Catalog } from '../../../api_client/virtocommerce.catalog';

const { getApiClient } = useApiClient(Catalog);
const client = await getApiClient();

// Search products
const products = await client.searchProducts({
  searchPhrase: 'laptop',
  skip: 0,
  take: 20
});

// Get product by ID
const product = await client.getProductById({ id: 'prod-123' });

// Update product
await client.updateProduct({
  product: updatedProductData
});
```

---

### Example 2: Custom REST API Integration

**Scenario:** Connect to your own REST API (not VirtoCommerce Platform)

**Prompt for AI:**
```
I have a custom REST API at https://api.myapp.com

Endpoints:
- GET /api/products - List products
- GET /api/products/{id} - Get product
- POST /api/products - Create product
- PUT /api/products/{id} - Update product
- DELETE /api/products/{id} - Delete product

Authentication: Bearer token in Authorization header

Create API integration without using the platform generator.
Use fetch or axios directly.
```

**AI will create custom API service:**

```typescript
// src/api_client/custom-api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.myapp.com';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface ProductSearchResponse {
  data: Product[];
  total: number;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  // Get token from your auth system
  const token = localStorage.getItem('auth_token');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const customApi = {
  async getProducts(params: { skip: number; take: number; search?: string }): Promise<ProductSearchResponse> {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams({
      skip: params.skip.toString(),
      take: params.take.toString(),
      ...(params.search && { search: params.search })
    });

    const response = await fetch(`${API_BASE_URL}/api/products?${query}`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  async getProductById(id: string): Promise<Product> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(product)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(product)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
  }
};
```

**Usage in composable:**
```typescript
// src/modules/products/composables/useProductList.ts
import { useAsync } from '@vc-shell/framework';
import { customApi } from '../../../api_client/custom-api';

export function useProductList() {
  const { action: loadProducts, loading, items } = useAsync(async () => {
    const response = await customApi.getProducts({
      skip: (currentPage.value - 1) * pageSize.value,
      take: pageSize.value,
      search: searchQuery.value
    });
    
    return {
      results: response.data,
      totalCount: response.total
    };
  });

  return {
    loadProducts,
    loading,
    items
  };
}
```

---

### Example 3: GraphQL API Integration

**Scenario:** Connect to GraphQL API

**Prompt for AI:**
```
Integrate with GraphQL API at https://api.myapp.com/graphql

Queries needed:
- products (search, pagination)
- product (by ID)

Mutations needed:
- createProduct
- updateProduct
- deleteProduct

Setup GraphQL client and create integration.
```

**AI will install dependencies and create client:**

```bash
yarn add graphql-request graphql
```

```typescript
// src/api_client/graphql-client.ts
import { GraphQLClient } from 'graphql-request';

const endpoint = import.meta.env.VITE_GRAPHQL_URL || 'https://api.myapp.com/graphql';

const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${localStorage.getItem('auth_token')}`
  }
});

export const graphqlApi = {
  async getProducts(search: string, skip: number, take: number) {
    const query = `
      query GetProducts($search: String, $skip: Int, $take: Int) {
        products(search: $search, skip: $skip, take: $take) {
          items {
            id
            name
            price
            description
          }
          totalCount
        }
      }
    `;

    const data = await client.request(query, { search, skip, take });
    return data.products;
  },

  async getProduct(id: string) {
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          name
          price
          description
        }
      }
    `;

    const data = await client.request(query, { id });
    return data.product;
  },

  async createProduct(input: any) {
    const mutation = `
      mutation CreateProduct($input: ProductInput!) {
        createProduct(input: $input) {
          id
          name
          price
        }
      }
    `;

    const data = await client.request(mutation, { input });
    return data.createProduct;
  },

  async updateProduct(id: string, input: any) {
    const mutation = `
      mutation UpdateProduct($id: ID!, $input: ProductInput!) {
        updateProduct(id: $id, input: $input) {
          id
          name
          price
        }
      }
    `;

    const data = await client.request(mutation, { id, input });
    return data.updateProduct;
  },

  async deleteProduct(id: string) {
    const mutation = `
      mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id)
      }
    `;

    await client.request(mutation, { id });
  }
};
```

---

### Example 4: Update Existing Module with API

**Scenario:** You have a generated module, need to connect it to API

**Prompt for AI:**
```
I have a products module generated with create-vc-app.
Connect it to my API at https://api.shop.com

API structure:
- GET /products?page={page}&limit={limit}&search={query}
  Response: { data: Product[], total: number }
  
- GET /products/{id}
  Response: Product
  
- POST /products
  Body: Product (without id)
  Response: Product
  
- PUT /products/{id}
  Body: Product
  Response: Product
  
- DELETE /products/{id}
  Response: 204

Replace all TODO comments in composables with actual API calls.
```

**AI will update:**

**1. Create API client:**
```typescript
// src/api_client/shop-api.ts
const API_URL = 'https://api.shop.com';

export const shopApi = {
  async getProducts(page: number, limit: number, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    const response = await fetch(`${API_URL}/products?${params}`);
    return response.json();
  },

  async getProduct(id: string) {
    const response = await fetch(`${API_URL}/products/${id}`);
    return response.json();
  },

  async createProduct(product: any) {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return response.json();
  },

  async updateProduct(id: string, product: any) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return response.json();
  },

  async deleteProduct(id: string) {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE'
    });
  }
};
```

**2. Update list composable:**
```typescript
// src/modules/products/composables/useProductsList.ts
import { shopApi } from '../../../api_client/shop-api';

// Replace TODO with:
const { action: loadProducts, loading, items } = useAsync(async () => {
  const response = await shopApi.getProducts(
    currentPage.value,
    pageSize.value,
    searchQuery.value
  );
  
  return {
    results: response.data,
    totalCount: response.total
  };
});
```

**3. Update details composable:**
```typescript
// src/modules/products/composables/useProductDetails.ts
import { shopApi } from '../../../api_client/shop-api';

// Load product
const loadProduct = async (id: string) => {
  const product = await shopApi.getProduct(id);
  item.value = product;
};

// Save product
const saveChanges = async () => {
  if (item.value.id) {
    await shopApi.updateProduct(item.value.id, item.value);
  } else {
    const created = await shopApi.createProduct(item.value);
    item.value = created;
  }
};

// Delete product
const deleteProduct = async () => {
  if (item.value.id) {
    await shopApi.deleteProduct(item.value.id);
  }
};
```

---

## Configuration Options

### Environment Variables

**Required variables in `.env.local`:**
```env
# For VirtoCommerce Platform
APP_PLATFORM_URL=https://platform-url.com
APP_PLATFORM_MODULES=[Module1, Module2]
APP_API_CLIENT_DIRECTORY=./src/api_client/

# For custom APIs
VITE_API_URL=https://api.myapp.com
VITE_GRAPHQL_URL=https://api.myapp.com/graphql
```

### package.json Script

**If not already present, add:**
```json
{
  "scripts": {
    "generate-api-client": "cross-env api-client-generator"
  },
  "devDependencies": {
    "@vc-shell/api-client-generator": "latest",
    "cross-env": "latest"
  }
}
```

---

## Error Handling

### Pattern 1: Basic Error Handling

```typescript
import { notification } from '@vc-shell/framework';

const { action: loadProducts, loading, error } = useAsync(async () => {
  try {
    const response = await api.getProducts();
    return response.data;
  } catch (err) {
    notification.error('Failed to load products', {
      timeout: 5000
    });
    console.error('API Error:', err);
    throw err;
  }
});
```

### Pattern 2: Retry Logic

```typescript
const { action: loadProducts, loading } = useAsync(async () => {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const response = await api.getProducts();
      return response.data;
    } catch (err) {
      retries--;
      if (retries === 0) {
        notification.error('Failed to load products after 3 attempts');
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
});
```

### Pattern 3: Validation Errors

```typescript
const saveProduct = async () => {
  try {
    await api.updateProduct(item.value.id, item.value);
    notification.success('Product saved successfully');
  } catch (err: any) {
    if (err.response?.status === 400) {
      // Validation errors
      const errors = err.response.data.errors;
      notification.error('Validation failed', {
        timeout: 5000
      });
      // Display field-specific errors
      Object.keys(errors).forEach(field => {
        console.error(`${field}: ${errors[field]}`);
      });
    } else {
      notification.error('Failed to save product');
    }
  }
};
```

---

## Authentication Patterns

### Pattern 1: Bearer Token

```typescript
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = localStorage.getItem('auth_token');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Usage
const headers = await getAuthHeaders();
const response = await fetch(url, { headers });
```

### Pattern 2: API Key

```typescript
const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': import.meta.env.VITE_API_KEY
};
```

### Pattern 3: OAuth 2.0

```typescript
import { useAuth } from '@vc-shell/framework';

const { getAccessToken } = useAuth();

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}
```

---

## Testing API Integration

### Manual Testing

**Prompt for AI:**
```
Create a test script to verify API connection.

Check:
- Can connect to API
- Can authenticate
- Can fetch data
- Can create/update/delete

Create a test file I can run with: node test-api.js
```

**AI will create:**
```javascript
// test-api.js
const API_URL = 'https://api.myapp.com';

async function testApi() {
  console.log('Testing API connection...');

  try {
    // Test connection
    const response = await fetch(`${API_URL}/health`);
    console.log('✓ API is reachable');

    // Test products endpoint
    const products = await fetch(`${API_URL}/products?page=1&limit=10`);
    const data = await products.json();
    console.log(`✓ Products endpoint working (${data.total} products)`);

    console.log('\nAll tests passed!');
  } catch (err) {
    console.error('✗ API test failed:', err.message);
  }
}

testApi();
```

---

## Common Issues and Solutions

### Issue 1: CORS Errors

**Error:** `Access-Control-Allow-Origin header is missing`

**Solution:**
```typescript
// For development, configure Vite proxy
// vite.config.mts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.myapp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});

// Then use relative URLs
const response = await fetch('/api/products');
```

---

### Issue 2: Authentication Token Expired

**Solution:**
```typescript
async function fetchWithRetry(url: string, options: RequestInit) {
  let response = await fetch(url, options);
  
  if (response.status === 401) {
    // Refresh token
    await refreshAuthToken();
    
    // Retry with new token
    const newHeaders = await getAuthHeaders();
    response = await fetch(url, {
      ...options,
      headers: newHeaders
    });
  }
  
  return response;
}
```

---

### Issue 3: API Client Generator Fails

**Error:** `Cannot connect to platform URL`

**Checklist:**
1. Verify URL is correct in `.env.local`
2. Check network connection
3. Verify platform modules exist
4. Try with `--VERBOSE=true` flag

```bash
cross-env VERBOSE=true yarn generate-api-client
```

---

## Next Steps

After setting up API integration:

1. **Test Endpoints:** Verify all CRUD operations work
2. **Add Error Handling:** Implement proper error handling
3. **Add Loading States:** Show loading indicators
4. **Add Validation:** Validate data before sending to API
5. **Add Caching:** Implement caching for better performance
6. **Monitor Performance:** Track API response times

---

## Related Documentation

- [CLI Usage Guide](./cli-usage.md) - Using create-vc-app
- [Quick Start Scenarios](./quick-start-scenarios.md) - Common patterns
- [Complete Workflow Guide](../guides/complete-workflow.md) - Full process
- [Official API Client Documentation](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/API-Integration/api-client-integration/)

