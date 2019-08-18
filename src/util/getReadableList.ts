export const getReadableList = (items: ReadonlyArray<string>, connector: string): string => {
  const { length: itemsLength } = items;

  if (itemsLength === 1) return `"${items[0]}"`;

  return `${items
    .map(x => `"${x}"`)
    .slice(0, itemsLength - 1)
    .join(', ')} ${connector} "${[...items].pop()}"`;
};
