import { type MockedItem, type MockedQuery, mockedItems } from ".";

export function loadMockItemsList(query: MockedQuery) {
  return new Promise((resolve: (value: MockedItem[]) => void) => {
    setTimeout(() => resolve(mockedItems), 1000);
  }).then((res) => {
    res = res.filter((x) => {
      if (query.keyword) {
        return x.name.toLowerCase().includes(query.keyword.toLowerCase());
      }
      return true;
    });

    return { results: res, totalCount: res.length };
  });
}

export async function loadMockItem(args?: { id: string }) {
  return new Promise((resolve: (value: MockedItem) => void) => {
    setTimeout(() => {
      const findMockedItem = mockedItems.find((x) => x.id === args?.id);

      if (findMockedItem) resolve({ ...findMockedItem });
    }, 1000);
  });
}

export async function removeMockItem(args: { id: string }) {
  new Promise((resolve: (value: boolean) => void) => {
    setTimeout(() => {
      const index = mockedItems.findIndex((x) => x.id === args.id);

      if (index > -1) {
        mockedItems.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 1000);
  });
}

export async function addNewMockItem(args: MockedItem) {
  return new Promise((resolve: (value: MockedItem) => void) => {
    setTimeout(() => {
      mockedItems.push(args);
      resolve(args);
    }, 1000);
  });
}

export async function updateMockItem(args: MockedItem) {
  return new Promise((resolve: (value: MockedItem) => void) => {
    setTimeout(() => {
      const index = mockedItems.findIndex((x) => x.id === args.id);

      if (index > -1) {
        mockedItems[index] = args;
        resolve(args);
      } else {
        resolve(args);
      }
    }, 1000);
  });
}
