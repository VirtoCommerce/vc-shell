import { IOffer, IOffersResponse } from "../../types";

const categories = [
  "Electronics / Audio & Video",
  "Food / Snacks / Chips & Crisps",
  "Women Clothes",
  "Accessoires",
];
const statuses = ["Saved", "Active", "Archived", "Future"];

function generateResults(count: number): IOffer[] {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push({
      id: `${i}`,
      product: {
        image: `/assets/${Math.floor(Math.random() * 5) + 1}.jpg`,
        gtin: `${Math.floor(Math.random() * 10000000)}`.padStart(10, "0"),
        category: categories[Math.floor(Math.random() * categories.length)],
        sellerName: `Product ${i + 1}`,
      },
      sku: `${Math.floor(Math.random() * 100000)}`.padStart(7, "0"),
      createdDate: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      listPrice: Math.random() * 100000,
      salePrice: Math.random() * 100000,
      minQty: Math.round(Math.random() * 1000),
      qty: Math.round(Math.random() * 100000),
    });
  }
  return results;
}

const results = generateResults(61);

export async function mockedOffer(args: { id: string }): Promise<IOffer> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const offer = results.find((item) => item.id === args.id);
      resolve(offer);
    }, 1000);
  });
}

export async function mockedOffers(args: {
  page?: number;
  sort?: string;
}): Promise<IOffersResponse> {
  const pageSize = 20;
  const page = args?.page || 1;
  const sortDirection = args?.sort?.slice(0, 1) === "-" ? "DESC" : "ASC";
  const sortField =
    (args?.sort?.slice(0, 1) === "-" ? args?.sort?.slice(1) : args?.sort) ||
    "id";

  const data = results
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortDirection === "ASC" ? -1 : 1;
      } else if (a[sortField] > b[sortField]) {
        return sortDirection === "ASC" ? 1 : -1;
      } else {
        return 0;
      }
    })
    .slice((page - 1) * pageSize, page * pageSize);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalCount: results.length,
        results: data,
      });
    }, 1000);
  });
}
