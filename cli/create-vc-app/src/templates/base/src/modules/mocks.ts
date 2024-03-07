/* eslint-disable import/no-unresolved */
import img1 from "/assets/1.jpeg";
import img2 from "/assets/2.jpg";
import img3 from "/assets/3.jpg";

export interface MockedItem {
  imgSrc: string;
  name: string;
  createdDate: Date;
  id: string;
}

const mockedItems: MockedItem[] = [
  {
    imgSrc: img1,
    name: "Item 1",
    createdDate: new Date(),
    id: "item-id-1",
  },
  {
    imgSrc: img2,
    name: "Item 2",
    createdDate: new Date(),
    id: "item-id-2",
  },
  {
    imgSrc: img3,
    name: "Item 3",
    createdDate: new Date(),
    id: "item-id-3",
  },
];

export function loadMockItemsList() {
  return new Promise((resolve: (value: MockedItem[]) => void) => {
    setTimeout(() => resolve(mockedItems), 1000);
  }).then((res) => {
    return { results: res, totalCount: res.length };
  });
}

export function loadMockItem(args?: { id: string }) {
  return new Promise((resolve: (value: MockedItem) => void) => {
    setTimeout(() => {
      const findMockedItem = mockedItems.find((x) => x.id === args?.id);

      if (findMockedItem) resolve(findMockedItem);
    }, 1000);
  });
}
