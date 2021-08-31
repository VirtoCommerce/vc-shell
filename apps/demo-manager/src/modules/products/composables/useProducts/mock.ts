import { IProduct, IProductResponse } from "../../types";

const categories = ["Electronics", "Snacks", "Woman Clothes", "Accessoires"];
const statuses = [
  "Draft",
  "Approved",
  "Published",
  "Waiting for approval",
  "Rejected",
  "Requires changes",
];

function generateResults(count: number): IProduct[] {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push({
      id: i,
      image: `/assets/${Math.floor(Math.random() * 5) + 1}.jpg`,
      gtin: `${Math.floor(Math.random() * 10000000)}`.padStart(10, "0"),
      sellerName: `Product ${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      createdDate: new Date(Math.floor(Math.random() * 10000000) * 1000),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return results;
}

const results = generateResults(1000);

export async function mockedProducts(args: {
  page?: number;
  sort?: string;
}): Promise<IProductResponse> {
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
  console.log(page, pageSize, data);
  return Promise.resolve({
    totalCount: results.length,
    results: data,
  });
}
