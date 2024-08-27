interface MockedItem {
  imgSrc: string;
  name: string;
  id: string;
  description: string;
  price: number;
  salePrice: number;
  guid: string;
  currency: string;
}

interface MockedQuery {
  keyword?: string;
}

const mockedItems: MockedItem[] = [
  {
    id: "beb211ea-1379-5a79-832c-9577ad387feb",
    name: "Product 1",
    imgSrc: "https://via.placeholder.com/150",
    description: "Product 1 description",
    price: 100,
    salePrice: 90,
    guid: "a1e26bcd-2704-5a3f-b97c-3e32e3d77a38",
    currency: "USD",
  },
  {
    id: "44b96758-792a-5449-b649-f2a0cd614c4b",
    name: "Product 2",
    imgSrc: "https://via.placeholder.com/150",
    description: "Product 2 description",
    price: 200,
    salePrice: 90,
    guid: "0ab995c0-3798-5011-a4ae-498e4c683cfd",
    currency: "USD",
  },
  {
    id: "605b2bfb-ba13-5687-91d5-0261b4b60524",
    name: "Product 3",
    imgSrc: "https://via.placeholder.com/150",
    description: "Product 3 description",
    price: 300,
    salePrice: 90,
    guid: "8a9b6954-7bf7-58b2-a146-c68e06fa7bb4",
    currency: "USD",
  },
  {
    id: "5ca8185c-0c28-59bf-ab40-991f134e6db3",
    name: "Product 4",
    imgSrc: "https://via.placeholder.com/150",
    description: "Product 4 description",
    price: 400,
    salePrice: 90,
    guid: "261364c5-f976-5c86-a92c-b0f0ea14efc7",
    currency: "USD",
  },
  {
    id: "077930cb-0874-5f85-9a5b-daafdd0bf860",
    name: "Product 5",
    imgSrc: "https://via.placeholder.com/150",
    description: "Product 5 description",
    price: 500,
    salePrice: 90,
    guid: "74d302ef-31e6-5432-91f1-d92c87ee2d2a",
    currency: "USD",
  },
];

const currencyOptions = [
  {
    value: "USD",
    label: "USD",
  },
  {
    value: "EUR",
    label: "EUR",
  },
  {
    value: "GBP",
    label: "GBP",
  },
];

export { mockedItems, currencyOptions };

export type { MockedItem, MockedQuery };
