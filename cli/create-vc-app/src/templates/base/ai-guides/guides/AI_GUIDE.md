# AI Development Guide

Welcome to your new VC-Shell project! This project is already configured with AI guidance that will help you develop applications quickly.

## What can AI do?

The AI in this project knows everything about the VC-Shell framework and can:

### 🚀 Create modules from scratch
```
Create a product management module:
- List with table (name, price, category, status)
- Edit form with fields: name, description, price
- API: /api/products
- Add to menu with "inventory" icon
```

### ✏️ Modify existing blades
```
Add these fields to product form:
- SKU (text, required)
- Weight (number with units)
- Category (select from list)
- "In Stock" toggle
```

### 🔌 Connect to any API
```
Connect module to my API:
- URL: https://my-backend.com/api
- Authentication: Bearer token
- Endpoints: GET /items, POST /items, PUT /items/{id}
```

### 🎨 Customize UI
```
Make module mobile-friendly:
- Responsive table
- Touch-friendly buttons
- Mobile navigation
```

## Project Structure

```
src/
├── modules/           # Your modules
│   └── [name]/
│       ├── pages/    # Blades (list.vue, details.vue)
│       ├── composables/ # Business logic
│       ├── locales/  # Translations
│       └── index.ts  # Module registration
├── core/            # Framework core
├── shared/          # Shared components
└── ui/             # UI components
```

## Prompt Examples

### Simple Modifications
```
Add "email" field to product form
Modify table - add "status" column
Make "price" field required
Add "Duplicate" button to toolbar
```

### Complex Tasks
```
Create orders module with tabs:
- "General" tab: customer, date, status
- "Items" tab: items table
- "Shipping" tab: address, shipping method
- "Payment" tab: payment method, status
```

### API Integration
```
Create API client for my backend:
- Swagger URL: https://api.example.com/swagger.json
- Authentication: JWT token
- Integrate into products module
```

## Workflow

### 1. Creating a Module
1. Describe what you need to AI
2. AI will create complete module structure
3. Module will be automatically registered in the app

### 2. Modifying Existing Module
1. Attach file or specify path
2. Describe changes
3. AI will update code while preserving functionality

### 3. Connecting to API
1. Specify API URL and format
2. AI will generate client
3. Update module to work with new API

## Useful Commands

```bash
# Development
yarn dev

# Build
yarn build

# Generate API client
yarn generate-api-client

# Type checking
yarn type-check

# Linting
yarn lint
```

## API Configuration

1. Add to `.env.local`:
```
APP_PLATFORM_URL=https://your-api-url.com/
```

2. Run generation:
```bash
yarn generate-api-client
```

3. Use in modules:
```typescript
const { getApiClient } = useApiClient(GeneratedClient);
const client = getApiClient();
```

## Tips for Working with AI

### ✅ Good Prompts
- Describe specifically what you need
- Specify field types and validation
- Specify API endpoints
- Describe UI requirements

### ❌ Avoid
- Too generic descriptions
- Contradictory requirements
- Unspecified API details

### 💡 Examples of Good Prompts

**Creating a Module:**
```
Create customers module:
- List: name, email, phone, status, registration date
- Form: name (required), email (required, validation), phone, status (active/inactive)
- API: GET /clients, POST /clients, PUT /clients/{id}, DELETE /clients/{id}
- Add to menu with "people" icon
```

**Modification:**
```
In products module add:
- Category filter (dropdown)
- Search by name (input field)
- "Export to Excel" button
- Product image column
```

**API Integration:**
```
Connect module to GraphQL API:
- Endpoint: https://api.example.com/graphql
- Authentication: Bearer token in Authorization header
- Queries: products query, createProduct mutation, updateProduct mutation
- Update composables to work with GraphQL
```

## Getting Help

If AI doesn't understand your request:
1. Clarify details
2. Provide examples
3. Describe desired result
4. Specify constraints

## Additional Resources

- Full documentation: `/docs/ai-guides/`
- Prompt examples: `/docs/ai-guides/prompts/`
- Technical guides: `/docs/ai-guides/guides/`

Happy coding! 🚀
