// Shared fixtures for VcDataTable stories.
// Extracted so themed story files can reuse the same mock data.

export interface Product {
  id: number;
  name: string;
  price: number;
  currency: string;
  stock: number;
  status: string;
  isActive: boolean;
  createdAt: Date;
}

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Laptop Pro",
    price: 1299.99,
    currency: "USD",
    stock: 45,
    status: "In Stock",
    isActive: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    name: "Wireless Mouse",
    price: 49.99,
    currency: "USD",
    stock: 120,
    status: "In Stock",
    isActive: true,
    createdAt: new Date("2024-02-10"),
  },
  {
    id: 3,
    name: "USB-C Hub",
    price: 89.99,
    currency: "EUR",
    stock: 0,
    status: "Out of Stock",
    isActive: false,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: 4,
    name: 'Monitor 27"',
    price: 399.99,
    currency: "USD",
    stock: 15,
    status: "Low Stock",
    isActive: true,
    createdAt: new Date("2024-03-05"),
  },
  {
    id: 5,
    name: "Mechanical Keyboard",
    price: 149.99,
    currency: "EUR",
    stock: 75,
    status: "In Stock",
    isActive: true,
    createdAt: new Date("2024-02-28"),
  },
];

/**
 * Basic usage of VcDataTable with VcColumn
 *
 */

export interface OrderProduct extends Product {
  orders?: Array<{
    orderId: string;
    date: string;
    quantity: number;
    customer: string;
  }>;
}

export const mockProductsWithOrders: OrderProduct[] = [
  {
    id: 1,
    name: "Laptop Pro",
    price: 1299.99,
    currency: "USD",
    stock: 45,
    status: "In Stock",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    orders: [
      { orderId: "ORD-001", date: "2024-03-10", quantity: 2, customer: "John Smith" },
      { orderId: "ORD-005", date: "2024-03-12", quantity: 1, customer: "Jane Doe" },
      { orderId: "ORD-008", date: "2024-03-15", quantity: 3, customer: "Bob Wilson" },
    ],
  },
  {
    id: 2,
    name: "Wireless Mouse",
    price: 49.99,
    currency: "USD",
    stock: 120,
    status: "In Stock",
    isActive: true,
    createdAt: new Date("2024-02-10"),
    orders: [
      { orderId: "ORD-002", date: "2024-03-11", quantity: 5, customer: "Alice Brown" },
      { orderId: "ORD-006", date: "2024-03-13", quantity: 10, customer: "Charlie Davis" },
    ],
  },
  {
    id: 3,
    name: "USB-C Hub",
    price: 89.99,
    currency: "EUR",
    stock: 0,
    status: "Out of Stock",
    isActive: false,
    createdAt: new Date("2024-01-20"),
    orders: [],
  },
  {
    id: 4,
    name: 'Monitor 27"',
    price: 399.99,
    currency: "USD",
    stock: 15,
    status: "Low Stock",
    isActive: true,
    createdAt: new Date("2024-03-05"),
    orders: [{ orderId: "ORD-003", date: "2024-03-09", quantity: 1, customer: "Eve Johnson" }],
  },
  {
    id: 5,
    name: "Mechanical Keyboard",
    price: 149.99,
    currency: "EUR",
    stock: 75,
    status: "In Stock",
    isActive: true,
    createdAt: new Date("2024-02-28"),
    orders: [
      { orderId: "ORD-004", date: "2024-03-08", quantity: 2, customer: "Frank Miller" },
      { orderId: "ORD-007", date: "2024-03-14", quantity: 1, customer: "Grace Lee" },
    ],
  },
];

/**
 * VcDataTable with expandable rows
 *
 * Add a VcColumn with expander prop to enable row expansion.
 * Click the expand icon to reveal additional content for each row.
 * Use the #expansion slot to customize the expanded content.
 */
